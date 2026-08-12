import { Injectable, inject, signal } from '@angular/core';
import { NotificationService } from '@app/core/notification/notification.service';
import { StaffMemberMedium } from '../../domain/models/staff.model';
import { STAFF_REPOSITORY } from '../../domain/repositories/staff.repository';

@Injectable()
export class StaffListUseCase {
  private readonly repository = inject(STAFF_REPOSITORY);
  private readonly notificationService = inject(NotificationService);

  readonly members = signal<StaffMemberMedium[]>([]);
  readonly error = signal<string | null>(null);

  load(): void {
    this.repository.getAllMedium().subscribe({
      next: (members) => this.members.set(members),
      error: () => {
        this.error.set('Impossible de charger le personnel.');
        this.notificationService.error('Impossible de charger le personnel.', 0);
      },
    });
  }

  deactivate(id: number, onSuccess: () => void): void {
    this.repository.deactivate(id).subscribe({
      next: () => {
        this.notificationService.success('Membre désactivé avec succès.', 0);
        onSuccess();
      },
      error: () => {
        this.notificationService.error('Impossible de désactiver ce membre.', 0);
      },
    });
  }
}
