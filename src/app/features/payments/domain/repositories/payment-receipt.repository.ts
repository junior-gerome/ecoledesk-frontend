import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PaymentReceiptDocumentViewModel,
  PaymentReceiptFilters,
  PaymentReceiptViewModel,
} from '../models/payment-receipt.model';

export interface PaymentReceiptRepository {
  getReceipts(filters: PaymentReceiptFilters): Observable<PaymentReceiptViewModel[]>;
  getReceiptDocument(paymentId: number): Observable<PaymentReceiptDocumentViewModel>;
  generateReceipt(paymentId: number): Observable<Blob>;
  deletePayment(paymentId: number): Observable<void>;
  buildReceiptFileName(
    receipt: Pick<
      PaymentReceiptViewModel | PaymentReceiptDocumentViewModel,
      'id' | 'receiptNumber'
    >,
  ): string;
}

export const PAYMENT_RECEIPT_REPOSITORY =
  new InjectionToken<PaymentReceiptRepository>('PAYMENT_RECEIPT_REPOSITORY');
