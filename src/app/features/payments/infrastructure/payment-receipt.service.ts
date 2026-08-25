import { Injectable, inject } from '@angular/core';
import {
  Payment,
  PaymentStatus,
  PaymentType,
} from '@app/features/payments/domain/models';
import { TypePaiement } from '@app/enums/typePaiement.enum';
import { BadgeVariant } from '@app/shared/ui/badge/badge.component';
import { Observable, map } from 'rxjs';
import {
  PaymentListFilters,
  PAYMENT_LIST_REPOSITORY,
} from '../domain/repositories/payment-list.repository';
import {
  PaymentReceiptDocumentViewModel,
  PaymentReceiptFilters,
  PaymentReceiptViewModel,
} from '../domain/models/payment-receipt.model';
import { PaymentReceiptRepository } from '../domain/repositories/payment-receipt.repository';

@Injectable()
export class PaymentReceiptService implements PaymentReceiptRepository {
  private readonly paymentsRepo = inject(PAYMENT_LIST_REPOSITORY);

  getReceipts(filters: PaymentReceiptFilters): Observable<PaymentReceiptViewModel[]> {
    const serverFilters: PaymentListFilters = {
      status: this.asPaymentStatus(filters.status),
      type: this.asPaymentType(filters.type),
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
    };

    return this.paymentsRepo.getPayments(serverFilters).pipe(
      map((payments) => (payments ?? []).map((payment) => this.toViewModel(payment))),
      map((receipts) => this.applyClientFilters(receipts, filters)),
      map((receipts) =>
        receipts.sort((left, right) => right.paymentDate.localeCompare(left.paymentDate)),
      ),
    );
  }

  getReceiptDocument(paymentId: number): Observable<PaymentReceiptDocumentViewModel> {
    return this.paymentsRepo.getPayment(paymentId).pipe(
      map((payment) => this.toDocumentViewModel(payment)),
    );
  }

  generateReceipt(paymentId: number): Observable<Blob> {
    return this.paymentsRepo.generateReceipt(paymentId);
  }

  buildReceiptFileName(
    receipt: Pick<PaymentReceiptViewModel, 'id' | 'receiptNumber'>,
  ): string {
    const baseName = receipt.receiptNumber?.trim() || `recu-paiement-${receipt.id}`;

    return `${baseName.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')}.pdf`;
  }

  deletePayment(paymentId: number): Observable<void> {
    return this.paymentsRepo.deletePayment(paymentId);
  }

  private toViewModel(payment: Payment): PaymentReceiptViewModel {
    const status = payment.status ?? 'PENDING';
    const studentName = payment.studentName?.trim() || `Eleve #${payment.studentId}`;

    return {
      id: Number(payment.id ?? 0),
      studentId: Number(payment.studentId),
      studentNumber: payment.studentNumber ?? null,
      studentName,
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      amount: Number(payment.amount ?? 0),
      type: String(payment.type ?? ''),
      typeLabel: this.formatType(payment.type),
      status,
      statusLabel: this.formatStatus(status),
      statusVariant: this.statusVariant(status),
      paymentMethodLabel: this.formatPaymentMethod(payment.paymentMethod),
      receiptNumber: payment.receiptNumber?.trim() || null,
      canGenerateReceipt: status === 'PAID',
    };
  }

  private toDocumentViewModel(payment: Payment): PaymentReceiptDocumentViewModel {
    const viewModel = this.toViewModel(payment);

    return {
      ...viewModel,
      description:
        String(payment.description ?? '').trim() ||
        `Paiement enregistre pour ${viewModel.typeLabel.toLowerCase()}.`,
      generatedAt: new Date().toISOString(),
    };
  }

  private applyClientFilters(
    receipts: PaymentReceiptViewModel[],
    filters: PaymentReceiptFilters,
  ): PaymentReceiptViewModel[] {
    const normalizedSearch = filters.search.trim().toLowerCase();
    const normalizedReceipt = filters.receiptNumber.trim().toLowerCase();

    return receipts.filter((receipt) => {
      const matchesSearch =
        !normalizedSearch ||
        receipt.studentName.toLowerCase().includes(normalizedSearch) ||
        String(receipt.studentId).includes(normalizedSearch) ||
        // Also search by matricule (studentNumber)
        (receipt.studentNumber ?? '').toLowerCase().includes(normalizedSearch);

      const matchesReceipt =
        !normalizedReceipt ||
        (receipt.receiptNumber ?? '').toLowerCase().includes(normalizedReceipt);

      return matchesSearch && matchesReceipt;
    });
  }

  private formatType(type: Payment['type'] | undefined): string {
    const label = String(type ?? 'FRAIS_AUTRES');

    return label
      .replace(/^FRAIS_/, '')
      .replace(/^SOUTIEN_/, 'SOUTIEN ')
      .replace(/_/g, ' ')
      .trim();
  }

  private formatStatus(status: Payment['status']): string {
    const labels: Record<Payment['status'], string> = {
      PAID: 'Paye',
      PENDING: 'En attente',
      LATE: 'En retard',
      CANCELLED: 'Annule',
    };

    return labels[status] ?? status;
  }

  private statusVariant(status: Payment['status']): BadgeVariant {
    const variants: Record<Payment['status'], BadgeVariant> = {
      PAID: 'success',
      PENDING: 'warning',
      LATE: 'danger',
      CANCELLED: 'neutral',
    };

    return variants[status] ?? 'neutral';
  }

  private formatPaymentMethod(method: Payment['paymentMethod'] | undefined): string {
    const labels: Record<NonNullable<Payment['paymentMethod']>, string> = {
      CASH: 'Especes',
      CHEQUE: 'Cheque',
      VIREMENT: 'Virement',
      MOBILE_MONEY: 'Mobile Money',
    };

    return method ? labels[method] ?? method : '-';
  }

  private asPaymentStatus(value: string): PaymentStatus | '' {
    const statuses: PaymentStatus[] = ['PENDING', 'PAID', 'LATE', 'CANCELLED'];
    return statuses.includes(value as PaymentStatus) ? (value as PaymentStatus) : '';
  }

  private asPaymentType(value: string): PaymentType | '' {
    const paymentTypes = new Set<string>(Object.values(TypePaiement));
    return paymentTypes.has(value) ? (value as PaymentType) : '';
  }
}
