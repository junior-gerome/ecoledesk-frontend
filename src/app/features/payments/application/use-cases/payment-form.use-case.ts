import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Payment } from '@app/features/payments/domain/models';
import { NotificationService } from '@app/core/notification/notification.service';
import { PaymentFormRepository } from '../../infrastructure/payment-form.repository';

export interface StudentOption {
  id: number;
  firstName: string;
  lastName: string;
}

@Injectable()
export class PaymentFormUseCase {
  private readonly repository = inject(PaymentFormRepository);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly studentsSignal = signal<StudentOption[]>([]);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  loadStudents(): void {
    this.repository
      .getStudents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => {
          this.studentsSignal.set(
            (students ?? [])
              .filter((student) => Number(student.id))
              .map((student) => ({
                id: Number(student.id),
                firstName: student.firstNameStudent ?? '',
                lastName: student.lastNameStudent ?? '',
              })),
          );
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.notificationService.warning(
            'Impossible de charger la liste des eleves.',
            0,
          );
        },
      });
  }

  getPayment(id: number, onSuccess: (payment: Payment) => void): void {
    this.repository
      .getPayment(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payment) => onSuccess(payment),
        error: (error) => {
          console.error('Error loading payment:', error);
          this.notificationService.error(
            'Impossible de charger le paiement selectionne.',
            0,
          );
        },
      });
  }

  savePayment(paymentId: number | null, payload: Payment, onSuccess: () => void): void {
    this.isSubmitting.set(true);

    const request$ = paymentId
      ? this.repository.updatePayment(paymentId, payload)
      : this.repository.createPayment(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success(
          paymentId
            ? 'Paiement modifie avec succes.'
            : 'Paiement enregistre avec succes.',
          0,
        );
        this.isSubmitting.set(false);
        onSuccess();
      },
      error: (error) => {
        console.error('Error saving payment:', error);
        this.notificationService.error(
          "Une erreur est survenue lors de l'enregistrement du paiement.",
          0,
        );
        this.isSubmitting.set(false);
      },
    });
  }
}
