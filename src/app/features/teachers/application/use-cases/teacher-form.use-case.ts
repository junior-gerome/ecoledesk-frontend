import { Injectable, inject, signal } from '@angular/core';
import { NotificationService } from '@app/core/notification/notification.service';
import { TeacherEntity } from '../../domain/models/teacher.entity';
import { TEACHER_REPOSITORY } from '../../domain/repositories/teacher.repository';

@Injectable()
export class TeacherFormUseCase {
  private readonly repository = inject(TEACHER_REPOSITORY);
  private readonly notificationService = inject(NotificationService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  getTeacher(id: number, onSuccess: (teacher: TeacherEntity) => void): void {
    this.repository.getTeacher(id).subscribe({
      next: (teacher) => onSuccess(teacher),
      error: (error) => {
        console.error('Error loading teacher:', error);
        this.error.set("Une erreur est survenue lors du chargement.");
        this.notificationService.error("Impossible de charger l'enseignant.", 0);
      },
    });
  }

  saveTeacher(
    teacherId: number | undefined,
    teacherToSave: TeacherEntity,
    onSuccess: () => void,
  ): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    const request$ = teacherId
      ? this.repository.update(teacherId, teacherToSave)
      : this.repository.create(teacherToSave);

    request$.subscribe({
      next: () => {
        this.notificationService.success(
          teacherId
            ? 'Enseignant mis a jour avec succes.'
            : 'Enseignant cree avec succes.',
          0,
        );
        this.isSubmitting.set(false);
        onSuccess();
      },
      error: (error: unknown) => {
        console.error("Erreur lors de l'enregistrement de l'enseignant:", error);
        const message = this.saveErrorMessage(error);
        this.error.set(message);
        this.notificationService.error(message, 0);
        this.isSubmitting.set(false);
      },
    });
  }

private saveErrorMessage(error: unknown): string {
    const payload = (error as { error?: unknown })?.error;
    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const messages = Object.values(payload)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
      if (messages.length) {
        return messages.join(' ');
      }
    }

    return "Une erreur est survenue lors de l'enregistrement.";
  }
}
