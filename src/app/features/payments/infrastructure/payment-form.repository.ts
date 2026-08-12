import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Payment } from '@app/features/payments/domain/models';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

export interface PaymentStudentApiModel {
  id: number;
  firstNameStudent: string;
  lastNameStudent: string;
}

const SILENT_ERROR_HEADERS = new HttpHeaders({
  'X-Silent-Error': '1',
});

@Injectable()
export class PaymentFormRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.billingApiUrl}/payments`;
  private readonly fallbackApiUrl = `${environment.apiUrl}/payments`;

  getPayment(id: number): Observable<Payment> {
    return this.withBackendFallback(
      this.http.get<Payment>(`${this.apiUrl}/${id}`, {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.get<Payment>(`${this.fallbackApiUrl}/${id}`),
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
      this.http.put<Payment>(`${this.apiUrl}/${id}`, payment, {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.put<Payment>(`${this.fallbackApiUrl}/${id}`, payment),
    );
  }

  getStudents(): Observable<PaymentStudentApiModel[]> {
    return this.http.get<PaymentStudentApiModel[]>(`${environment.apiUrl}/students`);
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
