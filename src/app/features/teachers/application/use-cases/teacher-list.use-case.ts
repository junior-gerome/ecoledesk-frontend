import { Injectable, inject, signal } from '@angular/core';
import { NotificationService } from '@app/core/notification/notification.service';
import { TeacherEntity } from '../../domain/models/teacher.entity';
import { TEACHER_REPOSITORY } from '../../domain/repositories/teacher.repository';

@Injectable()
export class TeacherListUseCase {
  private readonly repository = inject(TEACHER_REPOSITORY);
  private readonly notificationService = inject(NotificationService);

  readonly teachers = signal<TeacherEntity[]>([]);
  readonly error = signal<string | null>(null);

  loadTeachers(): void {
    this.repository.getAll().subscribe({
      next: (teachers) => {
        this.teachers.set(teachers);
      },
      error: (error) => {
        console.error('Error fetching teachers:', error);
        this.error.set("Une erreur est survenue lors du chargement des enseignants.");
        this.notificationService.error('Impossible de charger les enseignants.', 0);
      },
    });
  }

  deleteTeacher(id: number, onSuccess: () => void): void {
    this.repository.delete(id).subscribe({
      next: () => {
        this.notificationService.success('Enseignant supprime avec succes', 0);
        onSuccess();
      },
      error: (error) => {
        console.error('Error deleting teacher:', error);
        this.error.set(
          "Une erreur est survenue lors de la suppression de l'enseignant.",
        );
        this.notificationService.error(
          'Impossible de supprimer cet enseignant.',
          0,
        );
      },
    });
  }
}
