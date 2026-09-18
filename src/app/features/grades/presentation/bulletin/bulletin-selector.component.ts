import { CommonModule } from "@angular/common";
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Class } from "@app/features/classes/domain/models";
import { Sequence } from "@app/features/sequence/domain/models";
import { NotificationService } from "@app/core/notification/notification.service";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { CardComponent } from "@app/shared/ui/card/card.component";
import { EmptyStateComponent } from "@app/shared/ui/empty-state/empty-state.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { TranslateModule } from "@ngx-translate/core";
import { Bulletin } from "@features/grades/domain/entities";
import { GRADE_MANAGEMENT_REPOSITORY, GradeManagementRepository } from "@features/grades/domain/repositories/grade-management.repository";
import { BulletinBrandingService, BulletinBrandingConfig, DEFAULT_BULLETIN_BRANDING_CONFIG } from "@features/grades/infrastructure/services";
import { BulletinMapper } from "@features/grades/application/mappers";
import { BulletinDTO } from "@features/grades/application/dtos";
import { BulletinCombinePdfService } from "@features/grades/infrastructure/services/bulletin-combine-pdf.service";
import { BulletinSheetComponent } from "@features/grades/presentation/bulletin/bulletin-sheet.component";
import { ExcelExportService } from "@features/grades/infrastructure/services/excel-export.service";
import { GradeFileExportService } from "@features/grades/infrastructure/grade-file-export.service";
import {
  buildPeriodOptions,
  resolveSelectedPeriod,
} from "@features/grades/period-utils";

interface BulletinRow {
  studentId: number;
  name: string;
  average: number;
  mention: string;
  rank: number | null;
  totalStudents: number;
  isSuccessful: boolean;
  bulletin: Bulletin;
}

@Component({
  selector: "app-bulletin-selector",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    PageLayoutComponent,
    PageHeaderComponent,
    SelectComponent,
    InputComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    BulletinSheetComponent,
  ],
  templateUrl: "./bulletin-selector.component.html",
})
export class BulletinSelectorComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly repository = inject<GradeManagementRepository>(GRADE_MANAGEMENT_REPOSITORY);
  private readonly notificationService = inject(NotificationService);
  private readonly mapper = inject(BulletinMapper);
  private readonly combinePdf = inject(BulletinCombinePdfService);
  private readonly excelExport = inject(ExcelExportService);
  private readonly fileExport = inject(GradeFileExportService);
  private readonly brandingService = inject(BulletinBrandingService);

  readonly classes = signal<Class[]>([]);
  readonly sequences = signal<Sequence[]>([]);
  readonly selectedClassId = signal<number | null>(null);
  readonly selectedPeriod = signal("");
  readonly searchQuery = signal("");
  readonly selectedIds = signal<Set<number>>(new Set());
  readonly bulletins = signal<Bulletin[]>([]);
  readonly loadingBulletins = signal(false);
  readonly exporting = signal(false);
  readonly menuOpen = signal(false);
  readonly previewOpen = signal(false);
  readonly previewBulletins = signal<Bulletin[]>([]);
  readonly branding = signal<BulletinBrandingConfig>(DEFAULT_BULLETIN_BRANDING_CONFIG);

  readonly periodOptions = computed<SelectOption<string>[]>(() =>
    buildPeriodOptions(this.sequences()).map((option) => ({
      value: option.value,
      label: option.label,
    })),
  );

  readonly classOptions = computed<SelectOption<number>[]>(() =>
    (this.classes() ?? [])
      .filter((entry) => Number(entry.id))
      .map((entry) => ({
        value: Number(entry.id),
        label: entry.nameClasse ?? `Classe ${entry.id}`,
      })),
  );

  readonly selectedPeriodKind = computed(() => {
    const option = buildPeriodOptions(this.sequences()).find((entry) => entry.value === this.selectedPeriod());
    return option?.kind ?? "sequence";
  });

  readonly filteredRows = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.bulletins()
      .map((bulletin) => this.toRow(bulletin))
      .filter((row) => !query || row.name.toLowerCase().includes(query))
      .sort((left, right) => (left.rank ?? Infinity) - (right.rank ?? Infinity));
  });

  readonly allVisibleSelected = computed(() => {
    const rows = this.filteredRows();
    return rows.length > 0 && rows.every((row) => this.selectedIds().has(row.studentId));
  });

  readonly someVisibleSelected = computed(() => {
    const rows = this.filteredRows();
    const selected = this.selectedIds();
    return rows.some((row) => selected.has(row.studentId)) && !this.allVisibleSelected();
  });

  readonly downloadDisabled = computed(() => this.selectedIds().size === 0 || this.exporting());

  readonly previewDtos = computed<BulletinDTO[]>(() =>
    this.previewBulletins().map((bulletin) => this.mapper.toDTO(bulletin)),
  );

  @ViewChild("selectAllInput")
  selectAllInput?: ElementRef<HTMLInputElement>;

  ngAfterViewChecked(): void {
    if (this.selectAllInput) {
      this.selectAllInput.nativeElement.indeterminate = this.someVisibleSelected();
    }
  }

  ngOnInit(): void {
    this.loadBranding();
    this.loadClasses();
    this.loadSequences();
  }

  onClassChange(classId: number | null): void {
    this.selectedClassId.set(classId);
    this.selectedIds.set(new Set());
    this.bulletins.set([]);
    this.loadBulletins();
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod.set(period);
    this.selectedIds.set(new Set());
    this.loadBulletins();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query ?? "");
  }

  toggleSelectAll(): void {
    const rows = this.filteredRows();
    const selected = new Set(this.selectedIds());

    if (this.allVisibleSelected()) {
      rows.forEach((row) => selected.delete(row.studentId));
    } else {
      rows.forEach((row) => selected.add(row.studentId));
    }

    this.selectedIds.set(selected);
  }

  toggle(studentId: number): void {
    const selected = new Set(this.selectedIds());

    if (selected.has(studentId)) {
      selected.delete(studentId);
    } else {
      selected.add(studentId);
    }

    this.selectedIds.set(selected);
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  downloadCombinedPdf(): void {
    const selectedBulletins = this.getSelectedBulletins();

    if (!selectedBulletins.length) {
      return;
    }

    this.closeMenu();
    this.runCombinedPdf(selectedBulletins);
  }

  openPreview(studentId?: number): void {
    let bulletins: Bulletin[];

    if (typeof studentId === "number") {
      bulletins = this.bulletins().filter(
        (bulletin) => bulletin.studentHeader.studentId === studentId,
      );
    } else {
      bulletins = this.getSelectedBulletins();
    }

    if (!bulletins.length) {
      return;
    }

    this.closeMenu();
    this.previewBulletins.set(bulletins.sort((left, right) => (left.studentRank ?? Infinity) - (right.studentRank ?? Infinity)));
    this.previewOpen.set(true);
  }

  closePreview(): void {
    this.previewOpen.set(false);
    this.previewBulletins.set([]);
  }

  downloadFromPreview(): void {
    const bulletins = this.previewBulletins();

    if (!bulletins.length) {
      this.closePreview();
      return;
    }

    this.closePreview();
    this.runCombinedPdf(bulletins);
  }

  private runCombinedPdf(bulletins: Bulletin[]): void {
    this.exporting.set(true);

    this.combinePdf
      .combineToPdf(
        bulletins.map((bulletin) => this.mapper.toDTO(bulletin)),
        this.branding(),
        this.buildFileName("bulletins", "pdf"),
      )
      .subscribe({
        next: () => {
          this.notificationService.success("PDF combiné téléchargé.", 0);
          this.exporting.set(false);
        },
        error: (error) => {
          console.error("Error combined PDF:", error);
          this.notificationService.error("Échec du téléchargement.", 0);
          this.exporting.set(false);
        },
      });
  }

  downloadZip(): void {
    const classId = this.selectedClassId();

    if (!classId) {
      return;
    }

    const resolution = this.currentResolution();
    const studentIds = this.getSelectedStudentIds();
    this.exporting.set(true);
    this.closeMenu();

    this.repository
      .generateClassBulletinsZip(
        classId,
        resolution.displayLabel,
        studentIds.length ? studentIds : undefined,
        resolution.windowPeriod,
      )
      .subscribe({
        next: (blob) => {
          this.fileExport.downloadBlob(blob, this.buildFileName("bulletins", "zip"));
          this.notificationService.success("Archive ZIP téléchargée.", 0);
          this.exporting.set(false);
        },
        error: (error) => {
          console.error("Error ZIP:", error);
          this.notificationService.error("Échec du téléchargement.", 0);
          this.exporting.set(false);
        },
      });
  }

  downloadExcel(): void {
    const bulletins = this.getSelectedBulletins();

    if (!bulletins.length) {
      return;
    }

    this.exporting.set(true);
    this.closeMenu();

    this.excelExport
      .generateExcelFile(bulletins)
      .then((blob) => {
        this.fileExport.downloadBlob(blob, this.buildFileName("bulletins", "xlsx"));
        this.notificationService.success("Excel téléchargé.", 0);
        this.exporting.set(false);
      })
      .catch((error) => {
        console.error("Error Excel:", error);
        this.notificationService.error("Échec du téléchargement.", 0);
        this.exporting.set(false);
      });
  }

  private loadClasses(): void {
    this.repository.getClasses().subscribe({
      next: (classes) => this.classes.set(classes ?? []),
      error: () => this.notificationService.error("Impossible de charger les classes.", 0),
    });
  }

  private loadSequences(): void {
    this.repository.getSequences().subscribe({
      next: (sequences) => {
        this.sequences.set(sequences ?? []);
        if (!this.selectedPeriod() && this.periodOptions().length) {
          const latest = this.periodOptions()[this.periodOptions().length - 1];
          this.selectedPeriod.set(latest.value);
          this.loadBulletins();
        }
      },
      error: () => this.notificationService.error("Impossible de charger les périodes.", 0),
    });
  }

  private loadBulletins(): void {
    const classId = this.selectedClassId();
    const period = this.selectedPeriod();

    if (!classId || !period) {
      return;
    }

    this.loadingBulletins.set(true);
    const resolution = this.currentResolution();

    this.repository
      .getBulletinsByClassAndPeriodWindow(classId, resolution.windowPeriod, resolution.displayLabel)
      .subscribe({
        next: (bulletins) => {
          this.bulletins.set(bulletins ?? []);
          this.loadingBulletins.set(false);
        },
        error: (error) => {
          console.error("Error loading bulletins:", error);
          this.notificationService.error("Erreur au chargement des bulletins.", 0);
          this.loadingBulletins.set(false);
        },
      });
  }

  private loadBranding(): void {
    this.brandingService.getConfig().subscribe({
      next: (config) => this.branding.set(config),
    });
  }

  private toRow(bulletin: Bulletin): BulletinRow {
    return {
      studentId: bulletin.studentHeader.studentId,
      name: `${bulletin.studentHeader.lastName} ${bulletin.studentHeader.firstName}`.trim(),
      average: Number(bulletin.getGeneralAverage().value?.toFixed(2) ?? 0),
      mention: bulletin.getGeneralMention().label,
      rank: bulletin.studentRank ?? null,
      totalStudents: bulletin.totalStudentsInClass ?? 0,
      isSuccessful: bulletin.isSuccessful(),
      bulletin,
    };
  }

  currentResolution() {
    return resolveSelectedPeriod(this.sequences(), this.selectedPeriod());
  }

  private getSelectedStudentIds(): number[] {
    return Array.from(this.selectedIds());
  }

  private getSelectedBulletins(): Bulletin[] {
    const selected = this.selectedIds();
    return this.bulletins().filter((bulletin) => selected.has(bulletin.studentHeader.studentId));
  }

  private buildFileName(base: string, ext: string): string {
    const classId = this.selectedClassId() ?? "classe";
    const period = this.currentResolution().displayLabel.replace(/\s+/g, "-");
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${base}-${classId}-${period}-${timestamp}.${ext}`;
  }
}