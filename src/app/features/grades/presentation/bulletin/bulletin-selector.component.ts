import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DestroyRef } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Class } from "@app/features/classes/domain/models";
import { Sequence } from "@app/features/sequence/domain/models";
import { NotificationService } from "@app/core/notification/notification.service";
import { EmptyStateComponent } from "@app/shared/ui/empty-state/empty-state.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { StudentEntity } from "@features/students/domain/models/student.entity";
import {
  GRADE_MANAGEMENT_REPOSITORY,
  GradeManagementRepository,
} from "@features/grades/domain/repositories/grade-management.repository";

@Component({
  selector: "app-bulletin-selector",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SelectComponent,
    ButtonComponent,
    EmptyStateComponent,
  ],
  templateUrl: "./bulletin-selector.component.html",
})
export class BulletinSelectorComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly repository = inject<GradeManagementRepository>(
    GRADE_MANAGEMENT_REPOSITORY,
  );

  readonly form = this.fb.group({
    classId: [null as number | null],
    studentId: [null as number | null],
    period: [""],
  });

  classes: Class[] = [];
  students: StudentEntity[] = [];
  sequences: Sequence[] = [];
  loadingStudents = false;

  get classOptions(): SelectOption<number>[] {
    return (this.classes ?? [])
      .filter((entry) => Number(entry.id))
      .map((entry) => ({
        value: Number(entry.id),
        label: entry.nameClasse ?? `Classe ${entry.id}`,
      }));
  }

  get studentOptions(): SelectOption<number>[] {
    return (this.students ?? [])
      .filter((entry) => Number(entry.id))
      .map((entry) => ({
        value: Number(entry.id),
        label: `${entry.lastNameStudent ?? ""} ${entry.firstNameStudent ?? ""}`.trim(),
      }));
  }

  get periodOptions(): SelectOption<string>[] {
    return (this.sequences ?? [])
      .filter((entry) => !!entry.libelleSequence)
      .map((entry) => ({
        value: entry.libelleSequence as string,
        label: entry.libelleSequence as string,
      }));
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadSequences();

    this.form
      .get("classId")
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((classId) => {
        this.form.patchValue({ studentId: null }, { emitEvent: false });
        this.students = [];

        if (!classId) {
          return;
        }

        this.loadStudentsByClass(classId);
      });
  }

  openBulletin(): void {
    const studentId = this.form.get("studentId")?.value;
    const period = this.form.get("period")?.value;

    if (!studentId) {
      this.notificationService.warning("Choisissez d'abord un eleve.", 0);
      return;
    }

    void this.router.navigate(["/grades/bulletin", studentId], {
      queryParams: period ? { period } : undefined,
    });
  }

  private loadClasses(): void {
    this.repository
      .getClasses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (classes) => {
          this.classes = classes ?? [];
        },
        error: (error) => {
          console.error("Error loading classes for bulletin selector:", error);
          this.notificationService.error(
            "Impossible de charger les classes.",
            0,
          );
        },
      });
  }

  private loadSequences(): void {
    this.repository
      .getSequences()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sequences) => {
          this.sequences = sequences ?? [];
          if (!this.form.get("period")?.value && this.sequences.length > 0) {
            this.form.patchValue({
              period: this.sequences[0].libelleSequence ?? "",
            });
          }
        },
        error: (error) => {
          console.error("Error loading sequences for bulletin selector:", error);
          this.notificationService.error(
            "Impossible de charger les sequences.",
            0,
          );
        },
      });
  }

  private loadStudentsByClass(classId: number): void {
    this.loadingStudents = true;

    this.repository
      .getStudentsByClass(classId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => {
          this.students = students ?? [];
          this.loadingStudents = false;
        },
        error: (error) => {
          console.error("Error loading students for bulletin selector:", error);
          this.loadingStudents = false;
          this.notificationService.error(
            "Impossible de charger les eleves de cette classe.",
            0,
          );
        },
      });
  }
}
