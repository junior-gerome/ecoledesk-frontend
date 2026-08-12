import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Payment } from '@app/features/payments/domain/models';
import { NotificationService } from '@app/core/notification/notification.service';
import { SelectOption } from '@app/shared/ui/select/select.component';
import { finalize, from, switchMap } from 'rxjs';
import {
  PaymentReceiptRepository,
  PAYMENT_RECEIPT_REPOSITORY,
} from '../../domain/repositories/payment-receipt.repository';
import { ReceiptDocumentGateway } from '../../infrastructure/receipt-document.gateway';
import { PaymentReceiptPdfExportService } from '../../infrastructure/payment-receipt-pdf-export.service';
import {
  PAYMENT_LIST_REPOSITORY,
  PaymentListFilters,
  PaymentListRepository,
  PaymentSummary,
} from '../../domain/repositories/payment-list.repository';
import { PaymentListDomainService } from '../../domain/services/payment-list-domain.service';

@Injectable()
export class PaymentListUseCase {
  private readonly destroyRef = inject(DestroyRef);
  private readonly repository = inject<PaymentListRepository>(PAYMENT_LIST_REPOSITORY);
  private readonly notificationService = inject(NotificationService);
  private readonly domain = inject(PaymentListDomainService);
  private readonly documentGateway = inject(ReceiptDocumentGateway);
  private readonly receiptRepository = inject<PaymentReceiptRepository>(
    PAYMENT_RECEIPT_REPOSITORY,
  );
  private readonly receiptPdfExportService = inject(PaymentReceiptPdfExportService);

  payments: Payment[] = [];
  summary: PaymentSummary | null = null;
  isGeneratingReceipt = false;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filterForm: FormGroup;

  readonly statusOptions: SelectOption<string>[] = [
    { label: 'Tous', value: '' },
    { label: 'En attente', value: 'PENDING' },
    { label: 'Paye', value: 'PAID' },
    { label: 'En retard', value: 'LATE' },
    { label: 'Annule', value: 'CANCELLED' },
  ];

  readonly typeOptions: SelectOption<string>[] = [
    { label: 'Tous', value: '' },
    { label: 'Frais inscription', value: 'FRAIS_INSCRIPTION' },
    { label: 'Frais scolaire', value: 'FRAIS_SCOLAIRE' },
    { label: 'Frais cantine', value: 'FRAIS_CANTINE' },
    { label: 'Frais transport', value: 'FRAIS_TRANSPORT' },
    { label: 'Frais autres', value: 'FRAIS_AUTRES' },
  ];

  constructor(private readonly fb: FormBuilder) {
    this.filterForm = this.fb.group({
      status: [''],
      type: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  initialize(): void {
    this.loadPayments();
    this.loadSummary();

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadPayments();
      });
  }

  loadPayments(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository
      .getPayments(this.currentFilters())
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payments) => {
          this.payments = payments ?? [];
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          this.error.set('Impossible de charger les paiements.');
},
      });
  }

  loadSummary(): void {
    this.repository
      .getGlobalSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
        },
        error: (error) => {
          console.error('Error loading payment summary:', error);
},
      });
  }

  deletePayment(id: number): void {
    this.repository
      .deletePayment(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.payments = this.payments.filter((payment) => payment.id !== id);
          this.notificationService.success('Paiement supprime avec succes.');
          this.loadSummary();
        },
        error: (error) => {
          console.error('Error deleting payment:', error);
          this.notificationService.error(
            'Une erreur est survenue lors de la suppression du paiement.',
          );
        },
      });
  }

  generateReceipt(id: number): void {
    if (!id || this.isGeneratingReceipt) {
      return;
    }

    this.isGeneratingReceipt = true;
    this.receiptRepository
      .getReceiptDocument(id)
      .pipe(
        switchMap((receiptDocument) =>
          from(this.receiptPdfExportService.generateBlob(receiptDocument)),
        ),
        finalize(() => {
          this.isGeneratingReceipt = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (blob) => {
          this.documentGateway.downloadBlob(
            blob,
            this.receiptRepository.buildReceiptFileName({
              id,
              receiptNumber:
                this.payments.find((payment) => payment.id === id)?.receiptNumber ?? null,
            }),
          );
          this.notificationService.success('Le recu PDF a ete telecharge avec succes.');
        },
        error: (error) => {
          console.error('Error generating receipt:', error);
          this.notificationService.error(
            "Une erreur est survenue lors de la generation du recu.",
          );
        },
      });
  }

  getStatusClass(status: string): string {
    return this.domain.statusClass(status);
  }

  private currentFilters(): PaymentListFilters {
    return this.filterForm.getRawValue() as PaymentListFilters;
  }
}





