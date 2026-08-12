import { API_ENDPOINTS } from '@app/core/configuration/api-endpoints.config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Payment,
  PaymentStatus,
  PaymentType,
} from '@app/features/payments/domain/models/payment.model';

import { Observable, catchError, throwError } from 'rxjs';

export interface PaymentFilters {
  studentId?: number;
  status?: PaymentStatus;
  type?: PaymentType;
  startDate?: string;
  endDate?: string;
}

const SILENT_ERROR_HEADERS = new HttpHeaders({
  'X-Silent-Error': '1',
});

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_ENDPOINTS.billing.payments;
  private readonly fallbackApiUrl = API_ENDPOINTS.billing.fallbackPayments;

  getPayments(filters?: PaymentFilters): Observable<Payment[]> {
    let params = new HttpParams();

    Object.entries(filters ?? {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      params = params.set(key, String(value));
    });

    return this.withBackendFallback(
      this.http.get<Payment[]>(this.apiUrl, {
        headers: SILENT_ERROR_HEADERS,
        params,
      }),
      () => this.http.get<Payment[]>(this.fallbackApiUrl, { params }),
    );
  }

  getPayment(id: number): Observable<Payment> {
    return this.withBackendFallback(
      this.http.get<Payment>(API_ENDPOINTS.billing.payment(id), {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.get<Payment>(API_ENDPOINTS.billing.fallbackPayment(id)),
    );
  }

  createPayment(payment: Payment): Observable<Payment> {
    return this.withBackendFallback(
      this.http.post<Payment>(this.apiUrl, payment, {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.post<Payment>(this.fallbackApiUrl, payment),
    );
  }

  updatePayment(id: number, payment: Payment): Observable<Payment> {
    return this.withBackendFallback(
      this.http.put<Payment>(API_ENDPOINTS.billing.payment(id), payment, {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.put<Payment>(API_ENDPOINTS.billing.fallbackPayment(id), payment),
    );
  }

  deletePayment(id: number): Observable<void> {
    return this.withBackendFallback(
      this.http.delete<void>(API_ENDPOINTS.billing.payment(id), {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.delete<void>(API_ENDPOINTS.billing.fallbackPayment(id)),
    );
  }

  private withBackendFallback<T>(
    primary: Observable<T>,
    fallback: () => Observable<T>,
  ): Observable<T> {
    return primary.pipe(
      catchError((error) =>
        Number(error?.status ?? 0) === 0 ? fallback() : throwError(() => error),
      ),
    );
  }
}


