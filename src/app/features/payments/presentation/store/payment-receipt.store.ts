import { inject, Injectable } from '@angular/core';
import { PaymentReceiptViewModel } from '../../domain/models/payment-receipt.model';
import { PaymentReceiptFacade } from '../../application/facades/payment-receipt.facade';

@Injectable()
export class PaymentReceiptStore {
  private readonly facade = inject(PaymentReceiptFacade);

  readonly receipts = this.facade.receipts;
  readonly isLoading = this.facade.isLoading;
  readonly downloadingReceiptId = this.facade.downloadingReceiptId;
  readonly previewingReceiptId = this.facade.previewingReceiptId;
  readonly printingReceiptId = this.facade.printingReceiptId;
  readonly toast = this.facade.toast;
  readonly filterForm = this.facade.filterForm;
  readonly statusOptions = this.facade.statusOptions;
  readonly typeOptions = this.facade.typeOptions;
  readonly summary = this.facade.summary;

  initialize(): void {
    this.facade.initialize();
  }

  loadReceipts(): Promise<void> {
    return this.facade.loadReceipts();
  }

  resetFilters(): void {
    this.facade.resetFilters();
  }

  goToNewPayment(): Promise<void> {
    return this.facade.goToNewPayment();
  }

  editReceipt(paymentId: number): Promise<void> {
    return this.facade.editReceipt(paymentId);
  }

  downloadReceipt(receipt: PaymentReceiptViewModel): void {
    this.facade.downloadReceipt(receipt);
  }

  previewReceipt(receipt: PaymentReceiptViewModel): void {
    this.facade.previewReceipt(receipt);
  }

  printReceipt(receipt: PaymentReceiptViewModel): void {
    this.facade.printReceipt(receipt);
  }

  deleteReceipt(paymentId: number): void {
    this.facade.deleteReceipt(paymentId);
  }

  hideToast(): void {
    this.facade.hideToast();
  }

  receiptActionTooltip(
    receipt: PaymentReceiptViewModel,
    action: 'preview' | 'print' | 'download',
  ): string {
    return this.facade.receiptActionTooltip(receipt, action);
  }
}
