import { DestroyRef, Injectable, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  AttendanceRecord,
  AttendanceStatus,
} from "@app/features/attendance/domain/models";
import { Class } from "@app/features/classes/domain/models";
import { Section } from "@app/features/section/domain/models";
import { SelectOption } from "@app/shared/ui/select/select.component";
import { ToastVariant } from "@app/shared/ui/toast/toast.component";
import { catchError, map, of, switchMap } from "rxjs";
import {
  DailyAttendanceStats,
  StudentAttendanceRow,
} from "../../domain/models/student-attendance-row.model";
import { DailyAttendanceRepository } from "../../domain/repositories/daily-attendance.repository";
import { DailyAttendanceDomainService } from "../../domain/services/daily-attendance-domain.service";

@Injectable()
export class DailyAttendanceUseCase {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly repository = inject(DailyAttendanceRepository);
  private readonly domain = inject(DailyAttendanceDomainService);

  readonly sections = signal<Section[]>([]);
  readonly classes = signal<Class[]>([]);
  readonly students = signal<StudentAttendanceRow[]>([]);
  readonly existingRecordsCount = signal(0);
  readonly loadingSections = signal(false);
  readonly loadingClasses = signal(false);
  readonly loadingStudents = signal(false);
  readonly loadingRecords = signal(false);
  readonly saving = signal(false);
  readonly selectedDateLabel = signal("");
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

  readonly today = new Date().toISOString().split("T")[0];
  readonly form: FormGroup = this.fb.group({
    sectionId: [null, Validators.required],
    classId: [null, Validators.required],
    date: [this.today, Validators.required],
  });

  readonly stats = computed<DailyAttendanceStats>(() =>
    this.domain.computeDailyStats(this.students()),
  );

  get sectionOptions(): SelectOption<number>[] {
    return (this.sections() ?? [])
      .filter((section) => Number(section.id))
      .map((section) => ({
        value: Number(section.id),
        label: section.libelle?.trim() || `Section ${section.id}`,
      }));
  }

  get classOptions(): SelectOption<number>[] {
    return (this.classes() ?? [])
      .filter((classroom) => Number(classroom.id))
      .map((classroom) => ({
        value: Number(classroom.id),
        label: classroom.nameClasse?.trim() || `Classe ${classroom.id}`,
      }));
  }

  initialize(): void {
    this.loadSections();
    this.watchFormChanges();
    this.updateDateLabel();
  }

  setStatus(row: StudentAttendanceRow, status: AttendanceStatus): void {
    this.students.update((rows) =>
      this.domain.updateRowStatus(rows, row.studentId, status),
    );
  }

  updateHours(row: StudentAttendanceRow, hours: number | null): void {
    this.students.update((rows) =>
      this.domain.updateRowHours(rows, row.studentId, hours),
    );
  }

  setAllStatuses(status: AttendanceStatus): void {
    this.students.update((rows) => this.domain.setAllStatuses(rows, status));
  }

  markAttendance(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const classId = Number(this.form.value.classId);
    const date = String(this.form.value.date || "");
    const students = this.students();

    if (!classId || !date || students.length === 0) {
      this.showToast(
        "Veuillez selectionner une classe et charger les eleves avant validation.",
        "warning",
        "Pointage incomplet",
      );
      return;
    }

    const payload = this.domain.buildSavePayload({
      classId,
      classes: this.classes(),
      date,
      rows: students,
    });

    this.saving.set(true);
    this.repository
      .saveDailyAttendance(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showToast(
            "Pointage journalier enregistre avec succes.",
            "success",
            "Pointage valide",
          );
          this.saving.set(false);
          void this.refreshStudents();
        },
        error: () => {
          this.showToast(
            "Echec d'enregistrement du pointage.",
            "danger",
            "Enregistrement impossible",
          );
          this.saving.set(false);
        },
      });
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  private watchFormChanges(): void {
    this.form
      .get("sectionId")
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sectionId) => {
        const parsedSectionId = Number(sectionId);
        this.form.patchValue({ classId: null }, { emitEvent: false });
        this.classes.set([]);
        this.students.set([]);
        this.existingRecordsCount.set(0);

        if (!parsedSectionId) {
          return;
        }

        this.loadClassesBySection(parsedSectionId);
      });

    this.form
      .get("classId")
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.refreshStudents();
      });

    this.form
      .get("date")
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateDateLabel();
        void this.refreshStudents();
      });
  }

  private loadSections(): void {
    this.loadingSections.set(true);
    this.repository
      .getSections()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sections) => {
          this.sections.set(sections ?? []);
          this.loadingSections.set(false);
          this.selectFirstSectionIfNeeded(sections ?? []);
        },
        error: () => {
          this.loadingSections.set(false);
          this.showToast(
            "Impossible de charger les sections.",
            "danger",
            "Chargement impossible",
          );
        },
      });
  }

  private loadClassesBySection(sectionId: number): void {
    this.loadingClasses.set(true);
    this.repository
      .getClassesBySection(sectionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (classes) => {
          this.classes.set(classes ?? []);
          this.loadingClasses.set(false);
          this.selectFirstClassIfNeeded(classes ?? []);
        },
        error: () => {
          this.loadingClasses.set(false);
          this.showToast(
            "Impossible de charger les classes.",
            "danger",
            "Chargement impossible",
          );
        },
      });
  }

  private async refreshStudents(): Promise<void> {
    const classId = Number(this.form.value.classId);
    const date = String(this.form.value.date || "");

    this.students.set([]);
    this.existingRecordsCount.set(0);

    if (!classId || !date) {
      return;
    }

    this.loadingStudents.set(true);
    this.loadingRecords.set(true);

    this.repository
      .getActiveSchoolYear()
      .pipe(
        catchError(() => of(null)),
        switchMap((activeSchoolYear) => {
          const activeSchoolYearId = Number(activeSchoolYear?.id) || null;

          return this.repository.getDailyRecords(classId, date, activeSchoolYearId).pipe(
            switchMap((records) => {
              if ((records ?? []).length > 0) {
                return of({
                  roster: this.domain.mapRecordsToStudentRows(records),
                  records,
                  failed: false,
                });
              }

              return this.loadRosterFromInscriptions(
                classId,
                activeSchoolYearId,
                records,
                false,
              );
            }),
            catchError(() =>
              this.loadRosterFromInscriptions(
                classId,
                activeSchoolYearId,
                [],
                true,
              ),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ roster, records, failed }) => {
          const mergedRows = this.domain.mergeRosterWithRecords(roster, records);
          const savedRecords = (records ?? []).filter(
            (record) => record.id > 0 && record.status !== "PRESENT",
          );

          this.students.set(mergedRows);
          this.existingRecordsCount.set(savedRecords.length);
          this.loadingStudents.set(false);
          this.loadingRecords.set(false);

          if (failed) {
            this.showToast(
              "Le pointage existant n'a pas pu etre recharge, les eleves ont ete initialises par defaut.",
              "warning",
              "Pointage partiel",
            );
          }
        },
        error: () => {
          this.loadingStudents.set(false);
          this.loadingRecords.set(false);
          this.showToast(
            "Impossible de charger les eleves de la classe selectionnee.",
            "danger",
            "Chargement impossible",
          );
        },
      });
  }

  private loadRosterFromInscriptions(
    classId: number,
    activeSchoolYearId: number | null,
    records: AttendanceRecord[],
    failed: boolean,
  ) {
    return this.repository.getInscriptionsByClass(classId, activeSchoolYearId).pipe(
      map((inscriptions) => ({
        roster: this.domain.buildStudentRoster(
          inscriptions,
          classId,
          activeSchoolYearId,
        ),
        records,
        failed,
      })),
      catchError(() =>
        of({
          roster: [] as StudentAttendanceRow[],
          records,
          failed: true,
        }),
      ),
    );
  }

  private selectFirstSectionIfNeeded(sections: Section[]): void {
    if (Number(this.form.value.sectionId) || sections.length === 0) {
      return;
    }

    const firstSectionId = Number(sections.find((section) => Number(section.id))?.id);
    if (firstSectionId) {
      this.form.patchValue({ sectionId: firstSectionId });
    }
  }

  private selectFirstClassIfNeeded(classes: Class[]): void {
    if (Number(this.form.value.classId) || classes.length === 0) {
      return;
    }

    const firstClassId = Number(classes.find((classroom) => Number(classroom.id))?.id);
    if (firstClassId) {
      this.form.patchValue({ classId: firstClassId });
    }
  }

  private updateDateLabel(): void {
    this.selectedDateLabel.set(
      this.domain.formatDateLabel(String(this.form.get("date")?.value ?? "")),
    );
  }

  private showToast(
    message: string,
    variant: ToastVariant,
    title: string,
  ): void {
    this.toast.set({
      visible: true,
      title,
      message,
      variant,
    });
  }
}
