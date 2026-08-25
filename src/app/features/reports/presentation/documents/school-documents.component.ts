import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ReactiveFormsModule, NonNullableFormBuilder } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import type { jsPDF } from "jspdf";
import { finalize, map, startWith } from "rxjs";

import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { TableComponent } from "@app/shared/ui/table/table.component";
import { ToastComponent, ToastVariant } from "@app/shared/ui/toast/toast.component";
import {
  SchoolClassApi,
  SchoolDocumentApiDateValue,
  SchoolEnrollmentApi,
  SchoolStudentApi,
  SchoolYearApi,
} from "@features/reports/domain/models";
import {
  SCHOOL_DOCUMENTS_REPOSITORY,
  SchoolDocumentsRepository,
} from "@features/reports/domain/repositories/school-documents.repository";
import { SchoolDocumentsRepositoryAdapter } from "@features/reports/infrastructure/school-documents.repository";
import { PreferencesService, AppPreferences } from "@app/features/settings/infrastructure/preferences.service";

type SchoolDocumentType = "school-card" | "identity-card" | "certificate";
type SchoolDocumentScope = "student" | "class";

interface SchoolDocumentClass {
  id: string;
  label: string;
}

interface SchoolDocumentRecipient {
  studentId: string;
  firstName: string;
  lastName: string;
  studentName: string;
  dateOfBirth: string;
  classId: string | null;
  className: string;
  sectionName: string;
  schoolYearLabel: string;
  enrollmentDate: string;
  registrationNumber: string;
}

interface SchoolDocumentsForm {
  documentType: SchoolDocumentType;
  scope: SchoolDocumentScope;
  studentId: string;
  classId: string;
}

interface ToastState {
  visible: boolean;
  title: string;
  message: string;
  variant: ToastVariant;
}

@Component({
  selector: "app-school-documents",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    SelectComponent,
    TableComponent,
    ToastComponent,
    TranslateModule,
  ],
  templateUrl: "./school-documents.component.html",
  providers: [
    SchoolDocumentsRepositoryAdapter,
    {
      provide: SCHOOL_DOCUMENTS_REPOSITORY,
      useExisting: SchoolDocumentsRepositoryAdapter,
    },
  ],
})
export class SchoolDocumentsComponent implements OnInit {
  private readonly repository = inject<SchoolDocumentsRepository>(
    SCHOOL_DOCUMENTS_REPOSITORY,
  );
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly preferencesService = inject(PreferencesService);

  /** School preferences loaded from GET /settings/preferences */
  readonly schoolPreferences = signal<AppPreferences | null>(null);

  readonly loading = signal(false);
  readonly generating = signal(false);
  readonly recipients = signal<SchoolDocumentRecipient[]>([]);
  readonly classes = signal<SchoolDocumentClass[]>([]);
  readonly activeSchoolYearLabel = signal("Annee scolaire non definie");
  readonly toast = signal<ToastState>({
    visible: false,
    title: "",
    message: "",
    variant: "info",
  });

  readonly documentTypeOptions: SelectOption<SchoolDocumentType>[] = [
    { label: "Carte scolaire", value: "school-card" },
    { label: "Carte d'identite scolaire", value: "identity-card" },
    { label: "Attestation de scolarite", value: "certificate" },
  ];

  readonly scopeOptions: SelectOption<SchoolDocumentScope>[] = [
    { label: "Un eleve", value: "student" },
    { label: "Toute une classe", value: "class" },
  ];

  readonly documentForm = this.fb.group<SchoolDocumentsForm>({
    documentType: "school-card",
    scope: "student",
    studentId: "",
    classId: "",
  });

  readonly formState = toSignal(
    this.documentForm.valueChanges.pipe(
      startWith(this.documentForm.getRawValue()),
      map(() => this.documentForm.getRawValue()),
    ),
    { initialValue: this.documentForm.getRawValue() },
  );

  readonly studentOptions = computed<SelectOption<string>[]>(() =>
    this.recipients().map((recipient) => ({
      label: `${recipient.studentName} - ${recipient.className}`,
      value: recipient.studentId,
    })),
  );

  readonly classOptions = computed<SelectOption<string>[]>(() =>
    this.classes().map((classe) => ({
      label: classe.label,
      value: classe.id,
    })),
  );

  readonly filteredRecipients = computed(() => {
    const form = this.formState();
    const recipients = this.recipients();

    if (form.scope === "student") {
      return recipients.filter(
        (recipient) => recipient.studentId === form.studentId,
      );
    }

    return recipients.filter(
      (recipient) => recipient.classId !== null && recipient.classId === form.classId,
    );
  });

  readonly previewRecipients = computed(() => this.filteredRecipients().slice(0, 8));

  readonly estimatedPages = computed(() => {
    const count = this.filteredRecipients().length;
    if (count === 0) {
      return 0;
    }

    return this.formState().documentType === "certificate"
      ? count
      : Math.ceil(count / 8);
  });

  readonly selectedDocumentLabel = computed(() => {
    const selectedType = this.formState().documentType;
    return (
      this.documentTypeOptions.find((option) => option.value === selectedType)
        ?.label ?? "Document scolaire"
    );
  });

  readonly classesWithStudentsCount = computed(() => {
    const classIds = new Set(
      this.recipients()
        .map((recipient) => recipient.classId)
        .filter((classId): classId is string => !!classId),
    );

    return classIds.size;
  });

  ngOnInit(): void {
    // Load school preferences (name, code, address) from backend
    this.preferencesService.get().subscribe({
      next: (prefs) => this.schoolPreferences.set(prefs),
      error: () => { /* non-fatal — documents will use fallback labels */ },
    });
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.repository
      .loadData()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ students, enrollments, classes, activeSchoolYear }) => {
        const recipients = this.buildRecipients(
          students ?? [],
          enrollments ?? [],
          classes ?? [],
          activeSchoolYear,
        );
        const classList = this.buildClassList(classes ?? [], recipients);

        this.recipients.set(recipients);
        this.classes.set(classList);
        this.activeSchoolYearLabel.set(
          this.normalizeText(activeSchoolYear?.libelleAcademicYear) ||
            recipients[0]?.schoolYearLabel ||
            "Annee scolaire non definie",
        );
        this.patchDefaultSelections(recipients, classList);

        if (recipients.length === 0) {
          this.showToast(
            "Aucune donnee",
            "Aucun eleve n'a ete recupere depuis la base.",
            "warning",
          );
          return;
        }

        this.showToast(
          "Donnees chargees",
          `${recipients.length} eleve(s) disponible(s) pour la production.`,
          "success",
        );
      });
  }

  async generatePdf(): Promise<void> {
    const recipients = this.filteredRecipients();

    if (recipients.length === 0) {
      this.showToast(
        "Selection vide",
        "Choisissez un eleve ou une classe avec des eleves inscrits.",
        "warning",
      );
      return;
    }

    this.generating.set(true);

    try {
      const { jsPDF: JsPdf } = await import("jspdf");
      const doc = new JsPdf({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const documentType = this.formState().documentType;

      if (documentType === "certificate") {
        this.drawCertificates(doc, recipients);
      } else {
        this.drawCards(doc, recipients, documentType);
      }

      doc.save(this.buildFileName(documentType));
      this.showToast(
        "PDF genere",
        `${recipients.length} document(s) produit(s) avec les donnees chargees.`,
        "success",
      );
    } catch (error) {
      console.error("Erreur lors de la generation du PDF", error);
      this.showToast(
        "Generation impossible",
        "Le PDF n'a pas pu etre genere. Verifiez les donnees puis reessayez.",
        "danger",
      );
    } finally {
      this.generating.set(false);
    }
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  private buildRecipients(
    students: SchoolStudentApi[],
    enrollments: SchoolEnrollmentApi[],
    classes: SchoolClassApi[],
    activeSchoolYear: SchoolYearApi | null,
  ): SchoolDocumentRecipient[] {
    const classesById = new Map<string, SchoolClassApi>();
    for (const classe of classes) {
      const classId = this.toId(classe.id);
      if (classId) {
        classesById.set(classId, classe);
      }
    }

    const enrollmentsByStudent = new Map<string, SchoolEnrollmentApi[]>();
    const studentsById = new Map<string, SchoolStudentApi>();

    for (const student of students) {
      const studentId = this.toId(student.id);
      if (studentId) {
        studentsById.set(studentId, student);
      }
    }

    for (const enrollment of enrollments) {
      const studentId = this.toId(enrollment.student?.id ?? enrollment.studentId);
      if (!studentId) {
        continue;
      }

      if (enrollment.student) {
        studentsById.set(studentId, {
          ...studentsById.get(studentId),
          ...enrollment.student,
          id: studentId,
        });
      }

      const existing = enrollmentsByStudent.get(studentId) ?? [];
      existing.push(enrollment);
      enrollmentsByStudent.set(studentId, existing);
    }

    const activeSchoolYearId = this.toId(activeSchoolYear?.id);

    return [...studentsById.entries()]
      .map(([studentId, student]) =>
        this.toRecipient(
          studentId,
          student,
          this.pickEnrollment(enrollmentsByStudent.get(studentId) ?? [], activeSchoolYearId),
          classesById,
          activeSchoolYear,
        ),
      )
      .filter((recipient): recipient is SchoolDocumentRecipient => recipient !== null)
      .sort((a, b) =>
        a.className.localeCompare(b.className) ||
        a.lastName.localeCompare(b.lastName) ||
        a.firstName.localeCompare(b.firstName),
      );
  }

  private toRecipient(
    studentId: string,
    student: SchoolStudentApi,
    enrollment: SchoolEnrollmentApi | null,
    classesById: Map<string, SchoolClassApi>,
    activeSchoolYear: SchoolYearApi | null,
  ): SchoolDocumentRecipient | null {
    const firstName = this.normalizeText(student.firstNameStudent);
    const lastName = this.normalizeText(student.lastNameStudent);

    if (!firstName && !lastName) {
      return null;
    }

    const classId = this.toId(enrollment?.classeRoom?.id ?? enrollment?.classeRoomId);
    const enrollmentClass = classId ? classesById.get(classId) : null;
    const className =
      this.normalizeText(enrollment?.classeRoom?.nameClasse) ||
      this.normalizeText(enrollmentClass?.nameClasse) ||
      "Non affecte";
    const schoolYearLabel =
      this.normalizeText(enrollment?.anneescolaire?.libelleAcademicYear ?? enrollment?.anneescolaire?.libelleAnneeScolaire) ||
      this.normalizeText(enrollmentClass?.academicYear?.libelleAcademicYear ?? enrollmentClass?.anneeScolaire?.libelleAcademicYear ?? enrollmentClass?.anneeScolaire?.libelleAnneeScolaire) ||
      this.normalizeText(activeSchoolYear?.libelleAcademicYear) ||
      "Annee scolaire non definie";

    return {
      studentId,
      firstName,
      lastName,
      studentName: `${lastName} ${firstName}`.trim(),
      dateOfBirth: this.toDisplayDate(student.dateOfBirth),
      classId,
      className,
      sectionName:
        this.normalizeText(enrollment?.classeRoom?.section?.libelle) ||
        this.normalizeText(enrollmentClass?.section?.libelle) ||
        "-",
      schoolYearLabel,
      enrollmentDate: this.toDisplayDate(enrollment?.dateInscription),
      // Utilise le vrai matricule backend (studentNumber) ; fallback sur GSBP-XXXXX si absent
      registrationNumber: student.studentNumber ?? `GSBP-${studentId.padStart(5, "0")}`,
    };
  }

  private buildClassList(
    classes: SchoolClassApi[],
    recipients: SchoolDocumentRecipient[],
  ): SchoolDocumentClass[] {
    const classMap = new Map<string, string>();

    for (const classe of classes) {
      const id = this.toId(classe.id);
      if (id) {
        classMap.set(id, this.normalizeText(classe.nameClasse) || `Classe ${id}`);
      }
    }

    for (const recipient of recipients) {
      if (recipient.classId) {
        classMap.set(recipient.classId, recipient.className);
      }
    }

    return [...classMap.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private pickEnrollment(
    enrollments: SchoolEnrollmentApi[],
    activeSchoolYearId: string | null,
  ): SchoolEnrollmentApi | null {
    if (enrollments.length === 0) {
      return null;
    }

    if (activeSchoolYearId) {
      const activeEnrollment = enrollments.find((enrollment) => {
        const yearId = this.toId(
          enrollment.anneescolaire?.id ?? enrollment.anneeScolaireId,
        );
        return yearId === activeSchoolYearId;
      });

      if (activeEnrollment) {
        return activeEnrollment;
      }
    }

    return [...enrollments].sort((a, b) => {
      const aId = Number(this.toId(a.id) ?? 0);
      const bId = Number(this.toId(b.id) ?? 0);
      return bId - aId;
    })[0] ?? null;
  }

  private patchDefaultSelections(
    recipients: SchoolDocumentRecipient[],
    classes: SchoolDocumentClass[],
  ): void {
    const form = this.documentForm.getRawValue();
    const nextStudentId = recipients.some(
      (recipient) => recipient.studentId === form.studentId,
    )
      ? form.studentId
      : recipients[0]?.studentId ?? "";
    const firstClassWithStudents =
      classes.find((classe) =>
        recipients.some((recipient) => recipient.classId === classe.id),
      )?.id ?? classes[0]?.id ?? "";
    const nextClassId = classes.some((classe) => classe.id === form.classId)
      ? form.classId
      : firstClassWithStudents;

    this.documentForm.patchValue({
      studentId: nextStudentId,
      classId: nextClassId,
    });
  }

  private drawCards(
    doc: jsPDF,
    recipients: SchoolDocumentRecipient[],
    documentType: Exclude<SchoolDocumentType, "certificate">,
  ): void {
    const cardWidth = 85;
    const cardHeight = 54;
    const marginX = 12;
    const marginY = 15;
    const gapX = 9;
    const gapY = 10;
    const cardsPerPage = 8;
    const title =
      documentType === "school-card"
        ? "CARTE SCOLAIRE"
        : "CARTE D'IDENTITE SCOLAIRE";

    recipients.forEach((recipient, index) => {
      if (index > 0 && index % cardsPerPage === 0) {
        doc.addPage();
      }

      const pageIndex = index % cardsPerPage;
      const column = pageIndex % 2;
      const row = Math.floor(pageIndex / 2);
      const x = marginX + column * (cardWidth + gapX);
      const y = marginY + row * (cardHeight + gapY);

      this.drawCard(doc, x, y, cardWidth, cardHeight, title, recipient);
    });
  }

  private drawCard(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    recipient: SchoolDocumentRecipient,
  ): void {
    const prefs = this.schoolPreferences();
    const schoolCode = prefs?.schoolCode ?? 'GSBP';

    doc.setDrawColor(31, 41, 55);
    doc.setFillColor(248, 250, 252);
    doc.rect(x, y, width, height, "FD");

    doc.setFillColor(31, 41, 55);
    doc.rect(x, y, width, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(schoolCode, x + 4, y + 6.5);
    doc.text(title, x + width - 4, y + 6.5, { align: "right" });

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(recipient.schoolYearLabel, x + 4, y + 14);

    doc.setDrawColor(148, 163, 184);
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 4, y + 17, 18, 22, "FD");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text("PHOTO", x + 13, y + 29, { align: "center" });

    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(this.truncate(doc, recipient.studentName, 54), x + 26, y + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`Classe: ${this.truncate(doc, recipient.className, 42)}`, x + 26, y + 28);
    doc.text(`Section: ${this.truncate(doc, recipient.sectionName, 38)}`, x + 26, y + 33);
    doc.text(`Ne(e): ${recipient.dateOfBirth}`, x + 26, y + 38);
    doc.text(`Matricule: ${recipient.registrationNumber}`, x + 4, y + 45);

    doc.setDrawColor(100, 116, 139);
    doc.line(x + width - 28, y + 46, x + width - 5, y + 46);
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text("Signature", x + width - 16.5, y + 49.5, { align: "center" });
  }

  private drawCertificates(
    doc: jsPDF,
    recipients: SchoolDocumentRecipient[],
  ): void {
    const prefs = this.schoolPreferences();
    const schoolName = prefs?.schoolName ?? 'Groupe Scolaire Bilingue';
    const schoolCode = prefs?.schoolCode ?? 'GSBP';

    recipients.forEach((recipient, index) => {
      if (index > 0) {
        doc.addPage();
      }

      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(schoolName.toUpperCase(), 105, 24, {
        align: "center",
      });
      doc.setFontSize(10);
      doc.text(schoolCode, 105, 32, { align: "center" });

      doc.setDrawColor(31, 41, 55);
      doc.line(35, 40, 175, 40);

      doc.setFontSize(18);
      doc.text("ATTESTATION DE SCOLARITE", 105, 62, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const body = [
        "Le Directeur atteste que l'eleve",
        recipient.studentName,
        `ne(e) le ${recipient.dateOfBirth}, matricule ${recipient.registrationNumber},`,
        `est regulierement inscrit(e) en classe de ${recipient.className}`,
        `pour l'annee scolaire ${recipient.schoolYearLabel}.`,
      ];

      let currentY = 90;
      for (const line of body) {
        const wrappedLines = doc.splitTextToSize(line, 145) as string[];
        doc.text(wrappedLines, 35, currentY);
        currentY += wrappedLines.length * 8;
      }

      doc.text(
        "En foi de quoi la presente attestation est delivree pour servir et valoir ce que de droit.",
        35,
        currentY + 10,
        { maxWidth: 145 },
      );

      const issueDate = new Intl.DateTimeFormat("fr-FR").format(new Date());
      doc.text(`Fait le ${issueDate}`, 130, 215);
      doc.line(125, 240, 175, 240);
      doc.setFont("helvetica", "bold");
      doc.text("Le Directeur", 150, 249, { align: "center" });
    });
  }

  private buildFileName(documentType: SchoolDocumentType): string {
    const prefixes: Record<SchoolDocumentType, string> = {
      "school-card": "cartes-scolaires",
      "identity-card": "cartes-identite-scolaire",
      certificate: "attestations-scolarite",
    };
    const date = new Date().toISOString().slice(0, 10);

    return `${prefixes[documentType]}-${date}.pdf`;
  }

  private truncate(doc: jsPDF, value: string, maxWidth: number): string {
    if (doc.getTextWidth(value) <= maxWidth) {
      return value;
    }

    let nextValue = value;
    while (nextValue.length > 0 && doc.getTextWidth(`${nextValue}...`) > maxWidth) {
      nextValue = nextValue.slice(0, -1);
    }

    return `${nextValue}...`;
  }

  private toDisplayDate(value: SchoolDocumentApiDateValue): string {
    const isoDate = this.toIsoDate(value);
    if (!isoDate) {
      return "-";
    }

    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  }

  private toIsoDate(value: SchoolDocumentApiDateValue): string | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    if (Array.isArray(value) && value.length >= 3) {
      const [year, month, day] = value;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    const rawDate = String(value);
    const datePart = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;

    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : null;
  }

  private toId(value: number | string | null | undefined): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    return String(value);
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? "").trim();
  }

  private showToast(
    title: string,
    message: string,
    variant: ToastVariant,
  ): void {
    this.toast.set({
      visible: true,
      title,
      message,
      variant,
    });
  }
}
