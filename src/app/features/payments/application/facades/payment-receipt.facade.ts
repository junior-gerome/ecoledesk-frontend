import { inject, Injectable } from '@angular/core';
import { PaymentReceiptViewModel } from '../../domain/models/payment-receipt.model';
import { PaymentReceiptManagementUseCase } from '../use-cases/payment-receipt-management.use-case';

@Injectable()
export class PaymentReceiptFacade {
  private readonly useCase = inject(PaymentReceiptManagementUseCase);

  readonly receipts = this.useCase.receipts;
  readonly isLoading = this.useCase.isLoading;
  readonly downloadingReceiptId = this.useCase.downloadingReceiptId;
  readonly previewingReceiptId = this.useCase.previewingReceiptId;
  readonly printingReceiptId = this.useCase.printingReceiptId;
  readonly toast = this.useCase.toast;
  readonly filterForm = this.useCase.filterForm;
  readonly statusOptions = this.useCase.statusOptions;
  readonly typeOptions = this.useCase.typeOptions;
  readonly summary = this.useCase.summary;

  initialize(): void {
    this.useCase.initialize();
  }

  loadReceipts(): Promise<void> {
    return this.useCase.loadReceipts();
  }

  resetFilters(): void {
    this.useCase.resetFilters();
  }

  goToNewPayment(): Promise<void> {
    return this.useCase.goToNewPayment();
  }

  editReceipt(paymentId: number): Promise<void> {
    return this.useCase.editReceipt(paymentId);
  }

  downloadReceipt(receipt: PaymentReceiptViewModel): void {
    this.useCase.downloadReceipt(receipt);
  }

  previewReceipt(receipt: PaymentReceiptViewModel): void {
    this.useCase.previewReceipt(receipt);
  }

  printReceipt(receipt: PaymentReceiptViewModel): void {
    this.useCase.printReceipt(receipt);
  }

  deleteReceipt(paymentId: number): void {
    this.useCase.deleteReceipt(paymentId);
  }

  hideToast(): void {
    this.useCase.hideToast();
  }

  receiptActionTooltip(
    receipt: PaymentReceiptViewModel,
    action: 'preview' | 'print' | 'download',
  ): string {
    return this.useCase.receiptActionTooltip(receipt, action);
  }
}
