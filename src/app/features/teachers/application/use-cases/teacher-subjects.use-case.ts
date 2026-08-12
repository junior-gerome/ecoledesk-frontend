import { Injectable, inject, signal } from "@angular/core";
import {
  TeacherEntity,
  TeacherSubjectAssignment,
} from "@features/teachers/domain/models";
import { TEACHER_REPOSITORY } from "@features/teachers/domain/repositories/teacher.repository";

@Injectable()
export class TeacherSubjectsUseCase {
  private readonly repository = inject(TEACHER_REPOSITORY);

  readonly teachers = signal<TeacherEntity[]>([]);
  readonly rows = signal<TeacherSubjectAssignment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadTeachers(): void {
    this.repository.getAll().subscribe({
      next: (teachers) => this.teachers.set(teachers || []),
      error: () => this.error.set("Impossible de charger les enseignants."),
    });
  }

  loadSubjects(teacherId?: number | null): void {
    this.loading.set(true);
    this.error.set(null);

    this.repository.getSubjects(teacherId).subscribe({
      next: (rows) => {
        this.rows.set(rows || []);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.loading.set(false);
        this.error.set("Impossible de charger les matieres enseignees.");
      },
    });
  }
}
