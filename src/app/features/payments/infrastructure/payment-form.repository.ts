import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Payment } from '@app/features/payments/domain/models';
import { environment } from '@environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface PaymentStudentApiModel {
  id: number;
  firstNameStudent: string;
  lastNameStudent: string;
  /** Matricule (studentNumber) from backend StudentDTO */
  studentNumber?: string | null;
}

/** PageResponse<T> shape from GET /students (StudentController.getAllStudents). */
interface PageResponseBody<T> {
  content?: T[] | null;
  page?: number | null;
  size?: number | null;
  totalElements?: number | null;
  totalPages?: number | null;
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
    const params = new HttpParams().set('size', '500');
    return this.http
      .get<PageResponseBody<PaymentStudentApiModel>>(
        `${environment.apiUrl}/students`,
        { params },
      )
      .pipe(map((response) => response?.content ?? []));
  }

  /**
   * Search students by keyword (name, matricule) via GET /students?q={keyword}.
   * Uses the backend search to avoid loading all students.
   * Falls back to the first page of students if no keyword provided.
   */
  searchStudents(keyword?: string): Observable<PaymentStudentApiModel[]> {
    let params = new HttpParams().set('size', '500');
    const search = keyword?.trim();
    if (search) {
      params = params.set('q', search);
    }
    return this.http
      .get<PageResponseBody<PaymentStudentApiModel>>(
        `${environment.apiUrl}/students`,
        { params },
      )
      .pipe(map((response) => response?.content ?? []));
  }

  /**
   * Look up a single student by their matricule (studentNumber).
   * Uses GET /students?q={matricule} — returns the first page of matches.
   */
  findStudentByMatricule(matricule: string): Observable<PaymentStudentApiModel[]> {
    const params = new HttpParams()
      .set('q', matricule.trim())
      .set('size', '50');
    return this.http
      .get<PageResponseBody<PaymentStudentApiModel>>(
        `${environment.apiUrl}/students`,
        { params },
      )
      .pipe(map((response) => response?.content ?? []));
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
