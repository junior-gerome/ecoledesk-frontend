import { Injectable, inject, signal } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { NotificationService } from '@app/core/notification/notification.service';
import {
  STAFF_POSITIONS,
  StaffAssignmentBasic,
  StaffAssignmentCreateRequest,
  StaffMemberFormData,
  StaffMemberFull,
  StaffPositionOption,
} from '../../domain/models/staff.model';
import { STAFF_REPOSITORY } from '../../domain/repositories/staff.repository';

@Injectable()
export class StaffFormUseCase {
  private readonly repository = inject(STAFF_REPOSITORY);
  private readonly notificationService = inject(NotificationService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly positions = signal<StaffPositionOption[]>(STAFF_POSITIONS);

  loadPositions(): void {
    this.repository.getPositions().subscribe({
      next: (serverPositions) => {
        if (serverPositions && serverPositions.length > 0) {
          // Merge labels from STAFF_POSITIONS if server position labels are raw keys
          const mapped = serverPositions.map((sp) => {
            const local = STAFF_POSITIONS.find((lp) => lp.code === sp.code);
            return {
              code: sp.code,
              label: local?.label ?? sp.label ?? sp.code,
            };
          });
          this.positions.set(mapped);
        }
      },
      error: () => {
        // Fallback to local STAFF_POSITIONS
        this.positions.set(STAFF_POSITIONS);
      },
    });
  }

  getById(
    id: number,
    onSuccess: (member: StaffMemberFull, activeAssignment?: StaffAssignmentBasic) => void,
  ): void {
    this.repository.getById(id).subscribe({
      next: (member) => {
        // Find active assignment if available
        let activeAssignment: StaffAssignmentBasic | undefined = member.assignments?.find(
          (a) => !a.endDate || a.active !== false,
        );

        if (!activeAssignment && (!member.assignments || member.assignments.length === 0)) {
          this.repository.getAssignmentsByMember(id).subscribe({
            next: (assignments) => {
              activeAssignment = assignments.find((a) => !a.endDate || a.active !== false);
              onSuccess(member, activeAssignment);
            },
            error: () => {
              onSuccess(member, undefined);
            },
          });
        } else {
          onSuccess(member, activeAssignment);
        }
      },
      error: () => {
        this.error.set('Impossible de charger le membre du personnel.');
        this.notificationService.error('Impossible de charger le membre du personnel.', 0);
      },
    });
  }

  save(
    id: number | undefined,
    formData: StaffMemberFormData,
    onSuccess: () => void,
  ): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    const { position, startDate, endDate, assignmentStatus, ...memberRequest } = formData;

    if (id) {
      // Update existing member
      this.repository.update(id, memberRequest).pipe(
        switchMap((updatedMember) => {
          if (position && startDate) {
            const assignmentReq: StaffAssignmentCreateRequest = {
              staffMemberId: id,
              position,
              startDate,
              endDate: endDate || undefined,
            };
            return this.repository.createAssignment(assignmentReq).pipe(
              switchMap(() => of(updatedMember)),
            );
          }
          return of(updatedMember);
        }),
      ).subscribe({
        next: () => {
          this.notificationService.success('Membre du personnel mis à jour avec succès.', 0);
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
    } else {
      // Create new member + initial assignment
      this.repository.create(memberRequest).pipe(
        switchMap((newMember: StaffMemberFull) => {
          if (newMember.id && position && startDate) {
            const assignmentReq: StaffAssignmentCreateRequest = {
              staffMemberId: newMember.id,
              position,
              startDate,
              endDate: endDate || undefined,
            };
            return this.repository.createAssignment(assignmentReq).pipe(
              switchMap(() => of(newMember)),
            );
          }
          return of(newMember);
        }),
      ).subscribe({
        next: () => {
          this.notificationService.success(
            'Membre du personnel et affectation créés avec succès.',
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
  }

  private extractError(err: unknown): string {
    const payload = (err as { error?: unknown })?.error;
    if (typeof payload === 'string' && payload.trim()) return payload;
    if (payload && typeof payload === 'object') {
      const msgs = Object.values(payload).filter((v): v is string => typeof v === 'string');
      if (msgs.length) return msgs.join(' ');
    }
    return "Une erreur est survenue lors de l'enregistrement.";
  }
}
