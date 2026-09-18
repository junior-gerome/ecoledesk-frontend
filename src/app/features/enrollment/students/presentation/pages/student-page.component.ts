import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Gender } from "@app/enums/gender";
import { TypeParent } from "@app/features/parent/domain/enums/typeParent.enum";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { HasPermissionDirective } from "@app/shared/directives/has-permission.directive";
import { APP_PERMISSIONS } from "@app/core/constants/permissions.constants";
import { SelectOption } from "@app/shared/ui/select/select.component";
import {
  ToastComponent,
  ToastVariant,
} from "@app/shared/ui/toast/toast.component";
import { StudentEnrollmentFacade } from "../../application/facades/student-enrollment.facade";
import { StudentPageUseCase } from "../../application/use-cases/student-page.use-case";
import { StudentPageStore } from "../store/student-page.store";
import { StudentFormComponent } from "../components/student-form.component";
import { StudentListComponent } from "../components/student-list.component";
import { EnrollmentDomainService } from "../../domain/services/enrollment-domain.service";
import { ENROLLMENT_REPOSITORY } from "../../domain/repositories/enrollment.repository";
import {
  EnrollmentFormBuilder,
  EnrollmentFormGroup,
} from "../../infrastructure/enrollment-form.builder";
import { StudentEnrollmentRepository } from "../../infrastructure/student-enrollment.repository";
import { EnrollmentStore, StoreActionResult } from "../store/enrollment.store";
import { StudentFileExportService } from "../../infrastructure/student-file-export.service";
import { StudentEntity } from "../../domain/models/student.entity";
import { PaginationComponent } from "@app/shared/ui/pagination/pagination.component";
import { ListExportService, ListExportColumn, ListExportOptions } from "@app/shared/services/list-export.service";
import { firstValueFrom } from "rxjs";

type StudentPageMode = "list" | "create" | "edit";

import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: "app-student-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageLayoutComponent,
    PageHeaderComponent,
    ButtonComponent,
    HasPermissionDirective,
ToastComponent,
    StudentListComponent,
    StudentFormComponent,
    PaginationComponent,
  ],
  providers: [
    StudentEnrollmentRepository,
    {
      provide: ENROLLMENT_REPOSITORY,
      useExisting: StudentEnrollmentRepository,
    },
    EnrollmentFormBuilder,
    EnrollmentDomainService,
    EnrollmentStore,
    StudentPageUseCase,
    StudentEnrollmentFacade,
    StudentPageStore,
    StudentFileExportService,
  ],
  templateUrl: "./student-page.component.html",
})
export class StudentPageComponent implements OnInit {
  readonly permissions = APP_PERMISSIONS;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
private readonly formBuilder = inject(EnrollmentFormBuilder);
  protected readonly store = inject(StudentPageStore);
  private readonly exportService = inject(StudentFileExportService);
  private readonly listExport = inject(ListExportService);
  private readonly repository = inject(ENROLLMENT_REPOSITORY);
  private readonly domain = inject(EnrollmentDomainService);

  readonly studentForm: EnrollmentFormGroup = this.formBuilder.create();
  private readonly initialFormValue = this.studentForm.getRawValue();
  private readonly mode = signal<StudentPageMode>("list");
  readonly searchInput = signal("");
  readonly appliedSearch = signal("");

  readonly selectedIds = signal<Set<string>>(new Set<string>());
  readonly exportMenuOpen = signal(false);
  readonly isExporting = signal(false);
  readonly allPageSelected = computed(() => {
    const ids = this.filteredStudents().map((s) => s.id).filter((id): id is string => !!id);
    return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
  });
  readonly somePageSelected = computed(() => {
    const ids = this.filteredStudents().map((s) => s.id).filter((id): id is string => !!id);
    return ids.some((id) => this.selectedIds().has(id));
  });
  readonly selectedStudentCount = computed(() => this.selectedIds().size);
  readonly pageStudentCount = computed(() => this.filteredStudents().length);

  readonly isImporting = signal(false);
  readonly importPreviewRows = signal<Partial<StudentEntity>[]>([]);
  readonly importPreviewOpen = signal(false);
  readonly importValidationErrors = computed(() =>
    this.importPreviewRows()
      .map((row, index) => this.validateImportRow(row, index))
      .filter((message): message is string => !!message),
  );

  readonly students = this.store.students;
  readonly studentClasses = this.store.studentClasses;
  readonly filteredStudents = computed(() => {
    const query = this.appliedSearch().trim().toLowerCase();
    if (!query) {
      return this.students();
    }
    return this.students().filter((student) => this.matchesStudent(student, query));
  });
  readonly currentPage = this.store.currentPage;
  readonly totalPages = this.store.totalPages;
  readonly totalElements = this.store.totalElements;
  readonly sections = this.store.sections;
  readonly classes = this.store.classes;
  readonly selectedMontant = this.store.selectedMontant;
  readonly montantLoading = this.store.montantLoading;
  readonly isSubmitting = this.store.isSubmitting;
  readonly error = this.store.error;

  readonly isListMode = computed(() => this.mode() === "list");
  readonly isEditMode = computed(() => this.mode() === "edit");
  readonly pageTitleKey = computed(() => {
    if (this.mode() === "edit") {
      return "Modifier un eleve";
    }

    if (this.mode() === "create") {
      return "Preinscrire un eleve";
    }

    return "Liste des eleves preinscrits";
  });

  readonly genderOptions: SelectOption<Gender>[] = Object.values(Gender).map(
    (gender) => ({
      value: gender,
      label: gender,
    }),
  );

  readonly typeParentOptions: SelectOption<string>[] = Object.values(
    TypeParent,
  ).map((typeParent) => ({
    value: typeParent,
    label: typeParent,
  }));

  readonly sectionOptions = computed<SelectOption<string>[]>(() =>
    this.sections()
      .filter((section) => !!section.id)
      .map((section) => ({
        value: String(section.id),
        label: section.libelle ?? `Section ${section.id}`,
      })),
  );

  readonly classOptions = computed<SelectOption<string>[]>(() =>
    this.classes()
      .filter((classroom) => !!classroom.id)
      .map((classroom) => ({
        value: String(classroom.id),
        label: classroom.nameClasse ?? `Classe ${classroom.id}`,
      })),
  );

  readonly classPlaceholder = computed(() =>
    this.classes().length
      ? "Selectionnez une classe"
      : "Choisissez d'abord une section",
  );

  readonly toast = signal<{
    visible: boolean;
    title: string;
    message: string;
    variant: ToastVariant;
  }>({
    visible: false,
    title: "",
    message: "",
    variant: "info",
  });

  ngOnInit(): void {
    void this.initializePage();
  }

  async goToCreate(): Promise<void> {
    await this.router.navigate(["/pre-enrollments/new"]);
  }

  async goToProfile(studentId: string): Promise<void> {
    const queryParams = this.appliedSearch() ? { q: this.appliedSearch() } : {};
    await this.router.navigate(["/students", studentId], { queryParams });
  }

  async goToEdit(studentId: string): Promise<void> {
    const queryParams = this.appliedSearch() ? { q: this.appliedSearch() } : {};
    await this.router.navigate(["/students", studentId, "edit"], { queryParams });
  }

toggleExportMenu(): void {
    this.exportMenuOpen.update((open) => !open);
  }

  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  toggleStudentSelection(studentId: string): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }

  toggleSelectAllOnPage(checked: boolean): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const student of this.filteredStudents()) {
        if (!student.id) continue;
        if (checked) {
          next.add(student.id);
        } else {
          next.delete(student.id);
        }
      }
      return next;
    });
  }

  clearSelection(): void {
    this.selectedIds.set(new Set<string>());
  }

  private selectedStudents(): StudentEntity[] {
    return this.filteredStudents().filter(
      (student) => !!student.id && this.selectedIds().has(student.id),
    );
  }

  async onExportSelectionExcel(): Promise<void> {
    const selected = this.selectedStudents();
    if (!selected.length) {
      this.showToast("Aucun elève sélectionné", "warning", "Export");
      return;
    }
    this.closeExportMenu();
    await this.runExport(
      "Excel",
      this.buildExcelOptions("Selection d'eleves", selected),
    );
  }

  async onExportSelectionPdf(): Promise<void> {
    const selected = this.selectedStudents();
    if (!selected.length) {
      this.showToast("Aucun elève sélectionné", "warning", "Export");
      return;
    }
    this.closeExportMenu();
    await this.runExport("PDF", this.buildPdfOptions("Selection d'eleves", selected));
  }

  async onExportPageExcel(): Promise<void> {
    const page = this.filteredStudents();
    if (!page.length) {
      this.showToast("Aucun élève à exporter", "warning", "Export");
      return;
    }
    this.closeExportMenu();
    await this.runExport("Excel", this.buildExcelOptions("Liste des eleves", page));
  }

  async onExportPagePdf(): Promise<void> {
    const page = this.filteredStudents();
    if (!page.length) {
      this.showToast("Aucun élève à exporter", "warning", "Export");
      return;
    }
    this.closeExportMenu();
    await this.runExport("PDF", this.buildPdfOptions("Liste des eleves", page));
  }

  async onExportAllExcel(): Promise<void> {
    this.closeExportMenu();
    const data = await this.fetchAllStudents();
    await this.runExport("Excel", this.buildExcelOptions("Liste des eleves", data.students, data.classes));
  }

  async onExportAllPdf(): Promise<void> {
    this.closeExportMenu();
    const data = await this.fetchAllStudents();
    await this.runExport("PDF", this.buildPdfOptions("Liste des eleves", data.students, data.classes));
  }

  private async runExport(format: "Excel" | "PDF", options: ListExportOptions): Promise<void> {
    if (this.isExporting()) return;
    this.isExporting.set(true);
    try {
      if (format === "Excel") {
        await this.listExport.exportExcel(options);
      } else {
        await this.listExport.exportPdf(options);
      }
      this.showToast(
        `${options.rows.length} eleve(s) exporte(s) en ${format}`,
        "success",
        "Export reussi",
      );
    } catch {
      console.error("Erreur lors de l'export", format);
      this.showToast(`Erreur lors de l'export ${format}`, "danger", "Erreur");
    } finally {
      this.isExporting.set(false);
    }
  }

  private buildExcelOptions(
    title: string,
    students: StudentEntity[],
    classMap?: Readonly<Record<string, string>>,
  ): ListExportOptions {
    return {
      title,
      subtitle: `Généré le ${new Date().toLocaleDateString('fr-FR')} — ${students.length} eleve(s)`,
      fileName: this.exportFileName("xlsx"),
      columns: this.exportColumns(),
      rows: students.map((student) => this.toExportRow(student, classMap)),
    };
  }

  private buildPdfOptions(
    title: string,
    students: StudentEntity[],
    classMap?: Readonly<Record<string, string>>,
  ): ListExportOptions {
    return {
      title,
      subtitle: `Généré le ${new Date().toLocaleDateString('fr-FR')} — ${students.length} eleve(s)`,
      fileName: this.exportFileName("pdf"),
      columns: this.exportColumns(),
      rows: students.map((student) => this.toExportRow(student, classMap)),
    };
  }

  private exportColumns(): ListExportColumn[] {
    return [
      { header: "N°", key: "numero", weight: 14, align: "center" },
      { header: "Nom", key: "nom", weight: 20 },
      { header: "Prénom", key: "prenom", weight: 20 },
      { header: "Date de naissance", key: "naissance", weight: 18, align: "center" },
      { header: "Classe", key: "classe", weight: 24 },
    ];
  }

  private toExportRow(
    student: StudentEntity,
    classMap?: Readonly<Record<string, string>>,
  ): Record<string, string> {
    const studentId = student.id?.trim() ?? null;
    const classes = classMap ?? this.studentClasses();
    return {
      numero: student.studentNumber?.trim() || (studentId ? String(studentId) : "—"),
      nom: student.lastNameStudent?.trim() || "—",
      prenom: student.firstNameStudent?.trim() || "—",
      naissance: this.formatExportDate(student.dateOfBirth),
      classe: studentId ? (classes[studentId] ?? "Non inscrit") : "Non inscrit",
    };
  }

  private formatExportDate(value: unknown): string {
    if (!value) return "—";
    if (value instanceof Date) {
      return `${String(value.getDate()).padStart(2, "0")}/${String(value.getMonth() + 1).padStart(2, "0")}/${value.getFullYear()}`;
    }
    const text = String(value);
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text.trim());
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
    return text.slice(0, 10);
  }

  private exportFileName(extension: "xlsx" | "pdf"): string {
    const date = new Date().toISOString().split("T")[0];
    return `liste-eleves-${date}.${extension}`;
  }

  private async fetchAllStudents(): Promise<{
    students: StudentEntity[];
    classes: Record<string, string>;
  }> {
    const query = this.appliedSearch();
    const all: StudentEntity[] = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const result = await firstValueFrom(
        this.repository.getStudents({ page, size: 500, q: query || null }),
      );
      all.push(...result.students);
      hasNext = !result.last;
      page += 1;
      if (page > 5000) break;
    }

    const [enrollments, classes, activeSchoolYear] = await Promise.all([
      firstValueFrom(this.repository.getEnrollments()),
      firstValueFrom(this.repository.getAllClasses()),
      firstValueFrom(this.repository.getActiveSchoolYear()),
    ]);

    const activeYearId = this.domain.resolveId(activeSchoolYear?.id);
    const latestEnrollmentIndex = this.domain.buildLatestEnrollmentIndex(
      enrollments,
      activeYearId,
    );
    const classNameMap = this.domain.buildClassNameMap(classes);
    const classByStudent = this.domain.buildStudentClasses(
      all,
      latestEnrollmentIndex,
      classNameMap,
    );

    return { students: all, classes: classByStudent };
  }

  async onDownloadTemplate(): Promise<void> {
    try {
      await this.exportService.downloadTemplateExcel();
      this.showToast("Template telecharge", "success", "Template Excel");
    } catch {
      this.showToast("Erreur lors du telechargement", "danger", "Erreur");
    }
  }

  async onImportExcel(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isImporting.set(true);
    try {
      const rows = await this.exportService.importStudentsFromExcel(file);
      if (!rows.length) {
        this.showToast("Aucun eleve trouve dans le fichier", "warning", "Import Excel");
        return;
      }
      this.importPreviewRows.set(rows);
      this.importPreviewOpen.set(true);
      this.showToast(`${rows.length} eleve(s) detecte(s)`, "info", "Import Excel");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Format de fichier invalide";
      this.showToast(msg, "danger", "Erreur Import");
    } finally {
      this.isImporting.set(false);
      // Reset input so the same file can be re-selected
      input.value = "";
    }
  }

  async confirmImportExcel(): Promise<void> {
    if (this.isImporting() || this.importValidationErrors().length) {
      return;
    }

    this.isImporting.set(true);
    try {
      const count = await this.exportService.createStudentsFromPreview(
        this.importPreviewRows(),
      );
      this.importPreviewOpen.set(false);
      this.importPreviewRows.set([]);
      await this.store.loadListPage();
      this.showToast(`${count} eleve(s) importe(s) avec succes`, "success", "Import Excel");
    } catch (error) {
      console.error("Erreur validation import Excel", error);
      this.showToast("Impossible de valider l'import Excel.", "danger", "Import Excel");
    } finally {
      this.isImporting.set(false);
    }
  }

  cancelImportPreview(): void {
    this.importPreviewOpen.set(false);
    this.importPreviewRows.set([]);
  }

onSearch(): void {
    this.appliedSearch.set(this.searchInput().trim());
    this.clearSelection();
    void this.store.loadListPage({ q: this.appliedSearch() || null, page: 1 });
  }

  clearSearch(): void {
    this.searchInput.set("");
    this.appliedSearch.set("");
    this.clearSelection();
    void this.store.loadListPage({ q: null, page: 1 });
  }

  async onPageChange(page: number): Promise<void> {
    this.clearSelection();
    await this.store.loadListPage({ page });
  }

  async onSubmit(): Promise<void> {
    const validationMessage = this.store.validateBeforeSubmit(
      this.studentForm.getRawValue(),
    );

    if (validationMessage) {
      this.studentForm.markAllAsTouched();
      this.showToast(validationMessage, "warning", "Attention");
      return;
    }

    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.showToast(
        "Le formulaire contient encore des champs invalides.",
        "warning",
        "Attention",
      );
      return;
    }

    const result = this.isEditMode()
      ? await this.store.updateStudent(this.studentForm.getRawValue())
      : await this.store.createStudent(this.studentForm.getRawValue());

    if (!result.success) {
      this.showToast(result.message, this.toToastVariant(result), "Attention");
      return;
    }

    await this.router.navigate(["/students"]);
  }

  async cancel(): Promise<void> {
    this.store.resetEditionContext();
    this.studentForm.reset(this.initialFormValue, { emitEvent: false });
    await this.router.navigate(["/students"]);
  }

  async deleteStudent(studentId: string): Promise<void> {
    if (!confirm("Voulez-vous vraiment supprimer cet eleve ?")) {
      return;
    }

    const result = await this.store.deleteStudent(studentId);
    if (!result.success) {
      this.showToast(
        result.message,
        this.toToastVariant(result),
        "Suppression impossible",
      );
    }
  }

  async onSectionChange(sectionId: string | null): Promise<void> {
    this.studentForm.patchValue(
      { classId: null, montantId: null },
      {
        emitEvent: false,
      },
    );
    await this.store.loadMontantForClass(null);
    await this.store.loadClassesForSection(this.toId(sectionId));
  }

  async onClassChange(classId: string | null): Promise<void> {
    this.studentForm.patchValue({ montantId: null }, { emitEvent: false });
    await this.store.loadMontantForClass(this.toId(classId));
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  private async initializePage(): Promise<void> {
    const listSearch = this.route.snapshot.queryParamMap.get("q") ?? "";
    this.searchInput.set(listSearch);
    this.appliedSearch.set(listSearch);
    const idParam = this.route.snapshot.paramMap.get("id");
    const studentId = this.toId(idParam);

    if (studentId) {
      this.mode.set("edit");
      const formValue = await this.store.loadStudentForm(studentId);
      if (formValue) {
        this.studentForm.reset(
          { ...this.initialFormValue, ...formValue },
          {
            emitEvent: false,
          },
        );
      }
      return;
    }

    if (this.route.snapshot.routeConfig?.path === "new") {
      this.mode.set("create");
      await this.store.loadStudentForm();
      this.studentForm.reset(this.initialFormValue, { emitEvent: false });
      return;
    }

this.mode.set("list");
    await this.store.loadListPage({ q: listSearch || null });
  }

  private showToast(message: string, variant: ToastVariant, title = ""): void {
    this.toast.set({
      visible: true,
      title,
      message,
      variant,
    });
  }

  private toId(value: string | null | undefined): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    return value.trim() || null;
  }

  private toToastVariant(result: StoreActionResult): ToastVariant {
    if (result.kind === "success") {
      return "success";
    }

    if (result.kind === "warning") {
      return "warning";
    }

    return "danger";
  }

  private validateImportRow(
    row: Partial<StudentEntity>,
    index: number,
  ): string | null {
    const line = index + 4;
    if (!row.lastNameStudent?.trim() || !row.firstNameStudent?.trim()) {
      return `Ligne ${line}: nom et prenom obligatoires.`;
    }
    if (!row.dateOfBirth) {
      return `Ligne ${line}: date de naissance obligatoire.`;
    }
    if (!row.parent?.lastNameParent?.trim() || !row.parent?.phoneNumber?.trim()) {
      return `Ligne ${line}: parent et telephone parent obligatoires.`;
    }
    return null;
  }

  private matchesStudent(student: { id?: string | null; lastNameStudent: string; firstNameStudent: string; dateOfBirth: unknown }, query: string): boolean {
    const className = student.id ? this.studentClasses()[student.id] : "";
    return [
      student.id,
      student.lastNameStudent,
      student.firstNameStudent,
      student.dateOfBirth,
      className,
    ].some((value) => String(value ?? "").toLowerCase().includes(query));
  }
}



