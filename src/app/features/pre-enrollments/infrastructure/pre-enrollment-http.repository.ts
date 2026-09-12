import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ENDPOINTS } from '@app/core/configuration/api-endpoints.config';
import { Observable, map } from 'rxjs';
import {
  AddPreEnrollmentDocumentRequest,
  AddPreEnrollmentGuardianRequest,
  ClassRoomOption,
  CreateEnrollmentFromPreEnrollmentRequest,
  CreatePreEnrollmentRequest,
  DecisionRequest,
  EnrollmentResponse,
  PreEnrollment,
  PreEnrollmentFeePaymentResponse,
  PreEnrollmentStatus,
  RecordPreEnrollmentFeePaymentRequest,
  ReviewPreEnrollmentDocumentRequest,
} from '../domain/models/pre-enrollment.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
}

interface ClassroomDto {
  id?: number;
  nameClasse: string;
  level: string;
  capacity: number;
}

@Injectable({
  providedIn: 'root',
})
export class PreEnrollmentHttpRepository {
  private readonly http = inject(HttpClient);

  getAll(page: number = 0, size: number = 20): Observable<PageResponse<PreEnrollment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'creationDate,desc');
    return this.http.get<PageResponse<PreEnrollment>>(API_ENDPOINTS.enrollments.preEnrollments, { params });
  }

  getById(id: number): Observable<PreEnrollment> {
    return this.http.get<PreEnrollment>(API_ENDPOINTS.enrollments.preEnrollmentDetail(id));
  }

  getByStatus(status: PreEnrollmentStatus): Observable<PreEnrollment[]> {
    return this.http.get<PreEnrollment[]>(API_ENDPOINTS.enrollments.byStatus(status));
  }

  getByAcademicYear(academicYearId: number): Observable<PreEnrollment[]> {
    return this.http.get<PreEnrollment[]>(API_ENDPOINTS.enrollments.byAcademicYear(academicYearId));
  }

  loadClasses(academicYearId?: number): Observable<ClassRoomOption[]> {
    const url = academicYearId
      ? API_ENDPOINTS.classes.byAcademicYear(academicYearId)
      : API_ENDPOINTS.classes.list;
    return this.http.get<ClassroomDto[]>(url).pipe(
      map((classes) =>
        (classes ?? []).map((classroom) => ({
          id: classroom.id,
          nameClasse: classroom.nameClasse,
          level: classroom.level,
          capacity: classroom.capacity ?? 0,
        })),
      ),
    );
  }

  /** Montant des frais de préinscription pour une classe donnée (mock data backend). */
  getPreInscriptionFee(classId: number): Observable<number> {
    return this.http.get<{ count?: number }>(API_ENDPOINTS.montant.preInscriptionByClass(classId)).pipe(
      map((montant) => Number(montant?.count ?? 0)),
    );
  }

  createDraft(request: CreatePreEnrollmentRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(API_ENDPOINTS.enrollments.preEnrollments, request);
  }

  addGuardian(id: number, request: AddPreEnrollmentGuardianRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(
      API_ENDPOINTS.enrollments.preEnrollmentGuardians(id),
      request,
    );
  }

  addDocument(id: number, request: AddPreEnrollmentDocumentRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(
      API_ENDPOINTS.enrollments.preEnrollmentDocuments(id),
      request,
    );
  }

  reviewDocument(
    id: number,
    documentId: number,
    request: ReviewPreEnrollmentDocumentRequest,
  ): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(
      API_ENDPOINTS.enrollments.preEnrollmentDocumentReview(id, documentId),
      request,
    );
  }

  submit(id: number): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(API_ENDPOINTS.enrollments.preEnrollmentSubmit(id), {});
  }

  startReview(id: number, request?: DecisionRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(
      API_ENDPOINTS.enrollments.preEnrollmentStartReview(id),
      request || {},
    );
  }

  approve(id: number, request?: DecisionRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(
      API_ENDPOINTS.enrollments.preEnrollmentApprove(id),
      request || {},
    );
  }

  reject(id: number, request: DecisionRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(API_ENDPOINTS.enrollments.preEnrollmentReject(id), request);
  }

  recordFeePayment(
    preEnrollmentId: number,
    request: RecordPreEnrollmentFeePaymentRequest,
  ): Observable<PreEnrollmentFeePaymentResponse> {
    return this.http.post<PreEnrollmentFeePaymentResponse>(
      API_ENDPOINTS.enrollmentFinance.recordPreEnrollmentFee(preEnrollmentId),
      request,
    );
  }

  verifyFeePayment(paymentId: number): Observable<PreEnrollmentFeePaymentResponse> {
    return this.http.post<PreEnrollmentFeePaymentResponse>(
      API_ENDPOINTS.enrollmentFinance.verifyPreEnrollmentFee(paymentId),
      {},
    );
  }

  createEnrollmentFromPreEnrollment(
    preEnrollmentId: number,
    request: CreateEnrollmentFromPreEnrollmentRequest,
  ): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(
      API_ENDPOINTS.enrollments.fromPreEnrollment(preEnrollmentId),
      request,
    );
  }

  confirmEnrollment(enrollmentId: number): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(
      API_ENDPOINTS.enrollments.confirm(enrollmentId),
      {},
    );
  }

  cancelEnrollment(enrollmentId: number, reason: string): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(
      `${API_ENDPOINTS.enrollments.cancel(enrollmentId)}?reason=${encodeURIComponent(reason)}`,
      {},
    );
  }
}