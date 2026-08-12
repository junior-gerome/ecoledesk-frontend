import { DestroyRef, Injectable, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Section } from "@app/features/section/domain/models";
import { Teacher } from "@app/features/teachers/domain/models";
import { NotificationService } from "@app/core/notification/notification.service";
import { SelectOption } from "@app/shared/ui/select/select.component";
import { finalize, forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { ClassFormRepository } from "../../domain/repositories/class-form.repository";
import {
  ClassFormDomainService,
  ClassFormValue,
} from "../../domain/services/class-form-domain.service";

@Injectable()
export class ClassFormUseCase {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly repository = inject(ClassFormRepository);
  private readonly notificationService = inject(NotificationService);
  private readonly domain = inject(ClassFormDomainService);

  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  readonly activeAcademicYear = signal<AnneeScolaire | null>(null);
  readonly classId = signal<number | null>(null);
  readonly sections = signal<Section[]>([]);
  readonly teachers = signal<Teacher[]>([]);
  readonly error = signal<string | null>(null);

  readonly sectionOptions = computed<SelectOption<number>[]>(() =>
    this.sections()
      .filter((section) => Number(section.id))
      .map((section) => ({
        value: Number(section.id),
        label: section.libelle ?? `Section ${section.id}`,
      })),
  );

  readonly teacherOptions = computed<SelectOption<number>[]>(() =>
    this.teachers()
      .filter((teacher) => Number(teacher.id))
      .map((teacher) => ({
        value: Number(teacher.id),
        label: `${teacher.firstnameTeacher ?? ""} ${
          teacher.lastnameTeacher ?? ""
        }`.trim(),
      })),
  );

  readonly classForm: FormGroup = this.fb.group({
    nameClasse: ["", Validators.required],
    level: ["", Validators.required],
    capacity: ["", [Validators.required, Validators.min(1)]],
    sectionId: [null, Validators.required],
    teacherId: [null, Validators.required],
    anneeScolaireId: [null],
    description: [""],
  });

  initialize(): void {
    this.checkEditMode();
    this.loadRequiredData();
  }

  save(): void {
    if (this.classForm.invalid || this.isSubmitting()) {
      this.classForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.isSubmitting.set(true);

    const payload = this.domain.buildClassPayload({
      classId: this.classId(),
      isEditMode: this.isEditMode(),
      formValue: this.classForm.getRawValue() as ClassFormValue,
    });

    const request$ =
      this.isEditMode() && this.classId()
        ? this.repository.updateClass(this.classId()!, payload)
        : this.repository.createClass(payload);

    request$
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            this.isEditMode()
              ? "Classe mise a jour avec succes."
              : "Classe creee avec succes.",
            0,
          );
          void this.router.navigate(["/classes"]);
        },
        error: (error: { status?: number }) => {
          const message = this.domain.createSaveErrorMessage(error?.status);
          this.error.set(message);
          this.notificationService.error(message, 0);
        },
      });
  }

  cancel(): void {
    void this.router.navigate(["/classes"]);
  }

  private loadRequiredData(): void {
    forkJoin({
      sections: this.repository.getSections().pipe(
        catchError((error) => {
          console.error("Error loading sections:", error);
          this.notificationService.error("Impossible de charger les sections.", 0);
          return of([]);
        }),
      ),
      teachers: this.repository.getTeachers().pipe(
        catchError((error) => {
          console.error("Error loading teachers:", error);
          this.notificationService.error(
            "Impossible de charger les enseignants.",
            0,
          );
          return of([]);
        }),
      ),
      academicYear: this.repository.getActiveAcademicYear().pipe(
        catchError((error) => {
          console.error("Error loading active academic year:", error);
          this.notificationService.warning(
            "Impossible de charger l'annee scolaire active.",
            0,
          );
          return of(null);
        }),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ sections, teachers, academicYear }) => {
        this.sections.set(sections);
        this.teachers.set(teachers);
        this.activeAcademicYear.set(academicYear);

        if (academicYear && !this.classForm.value.anneeScolaireId) {
          this.classForm.patchValue({
            anneeScolaireId: academicYear.id,
          });
        }
      });
  }

  private checkEditMode(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get("id");
        if (!idParam || idParam === "new") {
          return;
        }

        const id = Number(idParam);
        if (!Number.isFinite(id) || id <= 0) {
          return;
        }

        this.isEditMode.set(true);
        this.classId.set(id);
        this.loadClassData(id);
      });
  }

  private loadClassData(id: number): void {
    this.repository
      .getClassById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (classroom) => {
          this.classForm.patchValue(this.domain.toFormValue(classroom));
          if (classroom.anneeScolaire) {
            this.activeAcademicYear.set(classroom.anneeScolaire);
          }
        },
        error: (error) => {
          console.error("Error loading class:", error);
          this.notificationService.error(
            "Impossible de charger la classe selectionnee.",
            0,
          );
          void this.router.navigate(["/classes"]);
        },
      });
  }
}
