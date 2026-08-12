import { Injectable, inject, signal } from '@angular/core';
import { NotificationService } from '@app/core/notification/notification.service';
import { StaffAssignmentCreateRequest, StaffAssignmentFull, StaffMemberFull, StaffPositionOption } from '../../domain/models/staff.model';
import { STAFF_REPOSITORY } from '../../domain/repositories/staff.repository';

@Injectable()
export class StaffDetailUseCase {
  private readonly repository = inject(STAFF_REPOSITORY);
  private readonly notificationService = inject(NotificationService);

  readonly member = signal<StaffMemberFull | null>(null);
  readonly assignments = signal<StaffAssignmentFull[]>([]);
  readonly positions = signal<StaffPositionOption[]>([]);
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);

  load(id: number): void {
    this.isLoading.set(true);
    this.repository.getById(id).subscribe({
      next: (member) => {
        this.member.set(member);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le membre du personnel.');
        this.notificationService.error('Impossible de charger le membre du personnel.', 0);
        this.isLoading.set(false);
      },
    });
    this.repository.getAssignmentsByMember(id).subscribe({
      next: (list) => this.assignments.set(list as unknown as StaffAssignmentFull[]),
      error: () => {},
    });
    this.repository.getPositions().subscribe({
      next: (pos) => this.positions.set(pos),
      error: () => {},
    });
  }

  createAssignment(request: StaffAssignmentCreateRequest, onSuccess: () => void): void {
    this.repository.createAssignment(request).subscribe({
      next: (a) => {
        this.assignments.update((list) => [...list, a]);
        this.notificationService.success('Affectation créée avec succès.', 0);
        onSuccess();
      },
      error: () => this.notificationService.error("Impossible de créer l'affectation.", 0),
    });
  }

  closeAssignment(id: number): void {
    this.repository.closeAssignment(id).subscribe({
      next: (updated) => {
        this.assignments.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
        this.notificationService.success('Affectation clôturée.', 0);
      },
      error: () => this.notificationService.error("Impossible de clôturer l'affectation.", 0),
    });
  }
}
