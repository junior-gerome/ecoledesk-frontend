import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { NotificationService } from '@app/core/notification/notification.service';
import { StaffMemberCreateRequest, StaffMemberFull } from '../../domain/models/staff.model';
import { STAFF_REPOSITORY } from '../../domain/repositories/staff.repository';

@Injectable()
export class StaffFormUseCase {
  private readonly repository = inject(STAFF_REPOSITORY);
  private readonly notificationService = inject(NotificationService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  getById(id: number, onSuccess: (member: StaffMemberFull) => void): void {
    this.repository.getById(id).subscribe({
      next: onSuccess,
      error: () => {
        this.error.set('Impossible de charger le membre du personnel.');
        this.notificationService.error('Impossible de charger le membre du personnel.', 0);
      },
    });
  }

  save(id: number | undefined, request: StaffMemberCreateRequest, onSuccess: () => void): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    const request$ = id
      ? this.repository.update(id, request)
      : this.repository.create(request);

    request$.subscribe({
      next: () => {
        this.notificationService.success(
          id ? 'Membre mis à jour avec succès.' : 'Membre créé avec succès.',
          0,
        );
        this.isSubmitting.set(false);
        onSuccess();
      },
      error: (err: unknown) => {
        const message = this.extractError(err);
        this.error.set(message);
        this.notificationService.error(message, 0);
        this.isSubmitting.set(false);
      },
    });
  }

  private extractError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string' && err.error.trim()) return err.error;
      if (err.error && typeof err.error === 'object') {
        const msgs = Object.values(err.error).filter((v): v is string => typeof v === 'string');
        if (msgs.length) return msgs.join(' ');
      }
    }
    return "Une erreur est survenue lors de l'enregistrement.";
  }
}
