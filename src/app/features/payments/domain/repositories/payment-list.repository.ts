import { InjectionToken } from '@angular/core';
import {
  Payment,
  PaymentStatus,
  PaymentType,
} from '@app/features/payments/domain/models';
import { Observable } from 'rxjs';

export interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  lateAmount: number;
}

export interface PaymentListFilters {
  status?: PaymentStatus | '';
  type?: PaymentType | '';
  startDate?: string;
  endDate?: string;
}

export interface PaymentListRepository {
  getPayments(filters: PaymentListFilters): Observable<Payment[]>;
  getPayment(id: number): Observable<Payment>;
  getGlobalSummary(): Observable<PaymentSummary>;
  deletePayment(id: number): Observable<void>;
  generateReceipt(id: number): Observable<Blob>;
}

export const PAYMENT_LIST_REPOSITORY = new InjectionToken<PaymentListRepository>(
  'PAYMENT_LIST_REPOSITORY',
);
