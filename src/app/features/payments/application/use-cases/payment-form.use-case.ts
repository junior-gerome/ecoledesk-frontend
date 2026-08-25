import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { Payment } from '@app/features/payments/domain/models';
import { NotificationService } from '@app/core/notification/notification.service';
import { PaymentFormRepository } from '../../infrastructure/payment-form.repository';

export interface StudentOption {
  id: number;
  firstName: string;
  lastName: string;
  /** Matricule de l'étudiant (ex: GSBP-000001) */
  studentNumber?: string | null;
}

@Injectable()
export class PaymentFormUseCase {
  private readonly repository = inject(PaymentFormRepository);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly studentsSignal = signal<StudentOption[]>([]);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isSearchingStudents = signal(false);

  private readonly searchKeyword$ = new Subject<string>();

  constructor() {
    // Search students with debounce — avoids loading all students at once
    this.searchKeyword$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((keyword) => {
        this.isSearchingStudents.set(true);
        return this.repository.searchStudents(keyword);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (students) => {
        this.studentsSignal.set(this.mapStudents(students));
        this.isSearchingStudents.set(false);
      },
      error: () => {
        this.isSearchingStudents.set(false);
        this.notificationService.warning('Impossible de charger la liste des eleves.', 0);
      },
    });
  }

  /**
   * Load students for the dropdown — loads all students (legacy behaviour).
   * Prefer searchStudentsByKeyword() for large datasets.
   */
  loadStudents(): void {
    this.repository
      .getStudents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => this.studentsSignal.set(this.mapStudents(students)),
        error: () => {
          this.notificationService.warning('Impossible de charger la liste des eleves.', 0);
        },
      });
  }

  /**
   * Trigger a debounced student search by keyword or matricule.
   */
  searchStudentsByKeyword(keyword: string): void {
    this.searchKeyword$.next(keyword);
  }

  getPayment(id: number, onSuccess: (payment: Payment) => void): void {
    this.repository
      .getPayment(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payment) => onSuccess(payment),
        error: () => {
          this.notificationService.error('Impossible de charger le paiement selectionne.', 0);
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
          paymentId ? 'Paiement modifie avec succes.' : 'Paiement enregistre avec succes.',
          0,
        );
        this.isSubmitting.set(false);
        onSuccess();
      },
      error: () => {
        this.notificationService.error("Une erreur est survenue lors de l'enregistrement du paiement.", 0);
        this.isSubmitting.set(false);
      },
    });
  }

  private mapStudents(students: { id: number; firstNameStudent: string; lastNameStudent: string; studentNumber?: string | null }[]): StudentOption[] {
    return (students ?? [])
      .filter((student) => Number(student.id))
      .map((student) => ({
        id: Number(student.id),
        firstName: student.firstNameStudent ?? '',
        lastName: student.lastNameStudent ?? '',
        studentNumber: student.studentNumber ?? null,
      }));
  }
}
