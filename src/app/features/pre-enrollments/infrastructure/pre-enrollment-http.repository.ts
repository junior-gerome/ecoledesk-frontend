import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  AddPreEnrollmentDocumentRequest,
  AddPreEnrollmentGuardianRequest,
  CreateEnrollmentFromPreEnrollmentRequest,
  CreatePreEnrollmentRequest,
  DecisionRequest,
  EnrollmentResponse,
  PreEnrollment,
  PreEnrollmentStatus,
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

@Injectable({
  providedIn: 'root',
})
export class PreEnrollmentHttpRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pre-enrollments`;
  private readonly enrollmentUrl = `${environment.apiUrl}/enrollments`;

  getAll(page: number = 0, size: number = 20): Observable<PageResponse<PreEnrollment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'creationDate,desc');
    return this.http.get<PageResponse<PreEnrollment>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<PreEnrollment> {
    return this.http.get<PreEnrollment>(`${this.baseUrl}/${id}`);
  }

  getByStatus(status: PreEnrollmentStatus): Observable<PreEnrollment[]> {
    return this.http.get<PreEnrollment[]>(`${this.baseUrl}/by-status/${status}`);
  }

  createDraft(request: CreatePreEnrollmentRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(this.baseUrl, request);
  }

  addGuardian(id: number, request: AddPreEnrollmentGuardianRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(`${this.baseUrl}/${id}/guardians`, request);
  }

  addDocument(id: number, request: AddPreEnrollmentDocumentRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(`${this.baseUrl}/${id}/documents`, request);
  }

  reviewDocument(
    id: number,
    documentId: number,
    request: ReviewPreEnrollmentDocumentRequest
  ): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(
      `${this.baseUrl}/${id}/documents/${documentId}/review`,
      request
    );
  }

  submit(id: number): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(`${this.baseUrl}/${id}/submit`, {});
  }

  startReview(id: number, request?: DecisionRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(`${this.baseUrl}/${id}/start-review`, request || {});
  }

  approve(id: number, request?: DecisionRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(`${this.baseUrl}/${id}/approve`, request || {});
  }

  reject(id: number, request: DecisionRequest): Observable<PreEnrollment> {
    return this.http.post<PreEnrollment>(`${this.baseUrl}/${id}/reject`, request);
  }

  createEnrollmentFromPreEnrollment(
    preEnrollmentId: number,
    request: CreateEnrollmentFromPreEnrollmentRequest
  ): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(
      `${this.enrollmentUrl}/from-pre-enrollment/${preEnrollmentId}`,
      request
    );
  }

  confirmEnrollment(enrollmentId: number): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(
      `${this.enrollmentUrl}/${enrollmentId}/confirm`,
      {}
    );
  }
}
