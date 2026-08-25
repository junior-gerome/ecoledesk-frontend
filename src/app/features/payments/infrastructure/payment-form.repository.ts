import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Payment } from '@app/features/payments/domain/models';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

export interface PaymentStudentApiModel {
  id: number;
  firstNameStudent: string;
  lastNameStudent: string;
  /** Matricule (studentNumber) from backend StudentDTO */
  studentNumber?: string | null;
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

  /**
   * @deprecated Use searchStudents() with a keyword instead to avoid loading all students.
   * Kept for backward compatibility with PaymentFormUseCase.loadStudents().
   */
  getStudents(): Observable<PaymentStudentApiModel[]> {
    return this.http.get<PaymentStudentApiModel[]>(`${environment.apiUrl}/students`);
  }

  /**
   * Search students by keyword (name, matricule) via GET /students?q={keyword}.
   * Uses the backend search to avoid loading all students.
   * Falls back to GET /students if no keyword provided.
   */
  searchStudents(keyword?: string): Observable<PaymentStudentApiModel[]> {
    const params = keyword?.trim()
      ? new HttpParams().set('q', keyword.trim())
      : new HttpParams();
    return this.http.get<PaymentStudentApiModel[]>(
      `${environment.apiUrl}/students`,
      { params },
    );
  }

  /**
   * Look up a single student by their matricule (studentNumber).
   * Uses GET /students?q={matricule} — returns the first match.
   */
  findStudentByMatricule(matricule: string): Observable<PaymentStudentApiModel[]> {
    const params = new HttpParams().set('q', matricule.trim());
    return this.http.get<PaymentStudentApiModel[]>(
      `${environment.apiUrl}/students`,
      { params },
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
