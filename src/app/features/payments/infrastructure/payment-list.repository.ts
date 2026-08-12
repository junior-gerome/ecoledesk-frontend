import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Payment,
  PaymentType,
} from '@app/features/payments/domain/models';
import { TypePaiement } from '@app/enums/typePaiement.enum';
import { environment } from '@environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  PaymentListFilters,
  PaymentListRepository,
  PaymentSummary,
} from '../domain/repositories/payment-list.repository';

type PaymentApiModel = Payment & { Type?: string };

const SILENT_ERROR_HEADERS = new HttpHeaders({
  'X-Silent-Error': '1',
});

@Injectable()
export class PaymentListRepositoryAdapter implements PaymentListRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.billingApiUrl}/payments`;
  private readonly fallbackApiUrl = `${environment.apiUrl}/payments`;

  private readonly legacyTypeMap: Record<string, PaymentType> = {
    INSCRIPTION: TypePaiement.FRAIS_INSCRIPTION,
    MENSUALITE: TypePaiement.FRAIS_SCOLAIRE,
    CANTINE: TypePaiement.FRAIS_CANTINE,
    TRANSPORT: TypePaiement.FRAIS_TRANSPORT,
    AUTRE: TypePaiement.FRAIS_AUTRES,
  };

  getPayments(filters: PaymentListFilters): Observable<Payment[]> {
    const params = this.toHttpParams(filters);

    return this.withBackendFallback(
      this.http.get<PaymentApiModel[]>(this.apiUrl, {
        headers: SILENT_ERROR_HEADERS,
        params,
      }),
      () => this.http.get<PaymentApiModel[]>(this.fallbackApiUrl, { params }),
    ).pipe(map((payments) => (payments ?? []).map((payment) => this.mapPayment(payment))));
  }

  getPayment(id: number): Observable<Payment> {
    return this.withBackendFallback(
      this.http.get<PaymentApiModel>(`${this.apiUrl}/${id}`, {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.get<PaymentApiModel>(`${this.fallbackApiUrl}/${id}`),
    ).pipe(map((payment) => this.mapPayment(payment)));
  }

  getGlobalSummary(): Observable<PaymentSummary> {
    return this.withBackendFallback(
      this.http.get<PaymentSummary>(`${this.apiUrl}/summary`, {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.get<PaymentSummary>(`${this.fallbackApiUrl}/summary`),
    );
  }

  deletePayment(id: number): Observable<void> {
    return this.withBackendFallback(
      this.http.delete<void>(`${this.apiUrl}/${id}`, {
        headers: SILENT_ERROR_HEADERS,
      }),
      () => this.http.delete<void>(`${this.fallbackApiUrl}/${id}`),
    );
  }

  generateReceipt(id: number): Observable<Blob> {
    return this.withBackendFallback(
      this.http.get(`${this.apiUrl}/${id}/receipt`, {
        headers: SILENT_ERROR_HEADERS,
        responseType: 'blob',
      }),
      () => this.http.get(`${this.fallbackApiUrl}/${id}/receipt`, {
        responseType: 'blob',
      }),
    );
  }

  private toHttpParams(filters?: PaymentListFilters): HttpParams {
    let params = new HttpParams();

    Object.entries(filters ?? {}).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      const stringValue = String(value).trim();
      if (!stringValue) {
        return;
      }

      params = params.set(key, stringValue);
    });

    return params;
  }

  private mapPayment(payment: PaymentApiModel): Payment {
    return {
      ...payment,
      type: this.normalizeType(payment.type ?? payment.Type),
    };
  }

  private normalizeType(type: unknown): PaymentType {
    const normalized = String(type ?? '').trim();
    if (!normalized) {
      return TypePaiement.FRAIS_AUTRES;
    }

    const enumValues = Object.values(TypePaiement);
    if (enumValues.includes(normalized as PaymentType)) {
      return normalized as PaymentType;
    }

    return this.legacyTypeMap[normalized] ?? TypePaiement.FRAIS_AUTRES;
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
