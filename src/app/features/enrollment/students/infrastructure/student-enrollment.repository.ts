import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { SILENT_REQUEST } from '@app/core/interceptors/http-context-tokens';
import { Class } from '@app/features/classes/domain/models';
import { Montant } from '@app/features/montant/domain/models';
import { Section } from '@app/features/section/domain/models';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { EnrollmentMapper } from '../domain/mappers/enrollment.mapper';
import { BackendStudentApi, StudentApi, StudentMapper } from '../domain/mappers/student.mapper';
import { ClassroomEntity } from '../domain/models/classroom.entity';
import {
  EnrollmentEntity,
  EnrollmentStatusDecisionEntity,
} from '../domain/models/enrollment.entity';
import { PaymentEntity } from '../domain/models/payment.entity';
import { SchoolYearEntity } from '../domain/models/school-year.entity';
import { SectionEntity } from '../domain/models/section.entity';
import { StudentEntity } from '../domain/models/student.entity';
import { EnrollmentRepository } from '../domain/repositories/enrollment.repository';

// ─── Request / Response shapes aligned with backend DTOs ──────────────────────

/** POST /pre-enrollments — CreatePreEnrollmentRequest */
interface CreatePreEnrollmentPayload {
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: string | null;
  birthPlace: string | null;
  academicYearId: number | null;
  requestedLevel: string | null;
  requiredFee: number | null;
}

/** Response from POST /pre-enrollments and workflow actions — PreEnrollmentResponse */
interface PreEnrollmentResponse {
  id?: number | string | null;
  number?: string | null;
  status?: string | null;
  academicYearId?: number | string | null;
  requestedLevel?: string | null;
  submittedAt?: string | null;
}

/** Response from enrollment workflow actions — EnrollmentResponse */
interface EnrollmentCommandResponse {
  id?: number | string | null;
  number?: string | null;
  preEnrollmentId?: number | string | null;
  studentId?: number | string | null;
  classroomId?: number | string | null;
  status?: string | null;
}

/**
 * EnrollmentMediumDTO shape from GET /enrollments (EnrollmentQueryController).
 * Maps to EnrollmentEntity for use in the student page store.
 */
interface EnrollmentMediumApiResponse {
  id?: number | string | null;
  number?: string | null;
  status?: string | null;
  type?: string | null;
  enrollmentDate?: string | null;
  confirmationDate?: string | null;
  student?: {
    id?: number | string | null;
    studentNumber?: string | null;
    person?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
    /** Legacy fields still present on some endpoints */
    firstNameStudent?: string | null;
    lastNameStudent?: string | null;
  } | null;
  classroomId?: number | string | null;
  classroomName?: string | null;
  academicYearId?: number | string | null;
  academicYearLabel?: string | null;
}

@Injectable()
export class StudentEnrollmentRepository implements EnrollmentRepository {
  private readonly http = inject(HttpClient);

  getStudents(): Observable<StudentEntity[]> {
    return this.http
      .get<StudentApi[]>(`${environment.apiUrl}/students`)
      .pipe(map((students) => (students ?? []).map((student) => StudentMapper.fromApi(student))));
  }

  getStudent(studentId: string): Observable<StudentEntity> {
    return this.http
      .get<StudentApi>(`${environment.apiUrl}/students/${studentId}`)
      .pipe(map((student) => StudentMapper.fromApi(student)));
  }

  /**
   * Returns the list of enrollments via GET /enrollments (now exposed by EnrollmentQueryController).
   * Maps EnrollmentMediumDTO → EnrollmentEntity for use in the student page store.
   */
  getEnrollments(): Observable<EnrollmentEntity[]> {
    return this.http
      .get<{ content?: EnrollmentMediumApiResponse[] }>(`${environment.apiUrl}/enrollments?size=500`)
      .pipe(
        map((response) => (response?.content ?? []).map((item) => this.fromEnrollmentMedium(item))),
        catchError(() => of([] as EnrollmentEntity[])),
      );
  }

  getSections(): Observable<SectionEntity[]> {
    return this.http
      .get<Section[]>(`${environment.apiUrl}/section`)
      .pipe(map((sections) => (sections ?? []).map((section) => EnrollmentMapper.sectionFromApi(section))));
  }

  getAllClasses(): Observable<ClassroomEntity[]> {
    return this.http
      .get<Class[]>(`${environment.apiUrl}/classes`)
      .pipe(map((classes) => (classes ?? []).map((classroom) => EnrollmentMapper.classroomFromApi(classroom))));
  }

  getClassesBySection(sectionId: string, academicYearId?: string | null): Observable<ClassroomEntity[]> {
    const params = academicYearId ? new HttpParams().set('academicYearId', academicYearId) : undefined;
    return this.http
      .get<Class[]>(`${environment.apiUrl}/classes/by-section/${sectionId}`, { params })
      .pipe(map((classes) => (classes ?? []).map((classroom) => EnrollmentMapper.classroomFromApi(classroom))));
  }

  getActiveSchoolYear(): Observable<SchoolYearEntity | null> {
    return this.http
      .get<AnneeScolaire>(`${environment.apiUrl}/academic-year/active`, {
        // Use HttpContext (client-side only) — avoids CORS preflight for custom headers
        context: new HttpContext().set(SILENT_REQUEST, true),
      })
      .pipe(
        map((schoolYear) => EnrollmentMapper.schoolYearFromApi(schoolYear)),
        catchError(() => of(null)),
      );
  }

  getRegistrationPayment(classId: string): Observable<PaymentEntity | null> {
    return this.http
      .get<Montant>(`${environment.apiUrl}/montant/preinscription/class/${classId}`)
      .pipe(
        map((payment) => EnrollmentMapper.paymentFromApi(payment)),
        catchError(() => of(null)),
      );
  }

  /**
   * Creates a pre-enrollment draft via POST /pre-enrollments.
   * Maps EnrollmentEntity → CreatePreEnrollmentRequest.
   */
  createEnrollment(enrollment: EnrollmentEntity): Observable<EnrollmentEntity> {
    const payload = this.toCreatePreEnrollmentPayload(enrollment);
    return this.http
      .post<PreEnrollmentResponse>(`${environment.apiUrl}/pre-enrollments`, payload)
      .pipe(map((response) => this.fromPreEnrollmentResponse(response, enrollment)));
  }

  /**
   * Submits a pre-enrollment for review via POST /pre-enrollments/{id}/submit.
   * The legacy PUT /preinscription/{id} (update) has no equivalent on the new backend.
   */
  updateEnrollment(
    enrollmentId: string,
    enrollment: EnrollmentEntity,
  ): Observable<EnrollmentEntity> {
    return this.http
      .post<PreEnrollmentResponse>(
        `${environment.apiUrl}/pre-enrollments/${enrollmentId}/submit`,
        {},
      )
      .pipe(map((response) => this.fromPreEnrollmentResponse(response, enrollment)));
  }

  /**
   * Approves a pre-enrollment via POST /pre-enrollments/{id}/approve.
   * Maps to the backend DecisionRequest (reviewedBy extracted from context — defaults to 0).
   */
  validatePreinscription(
    enrollmentId: string,
  ): Observable<EnrollmentStatusDecisionEntity> {
    return this.http
      .post<PreEnrollmentResponse>(
        `${environment.apiUrl}/pre-enrollments/${enrollmentId}/approve`,
        { reviewedBy: null },
      )
      .pipe(map((response) => this.toStatusDecisionFromPreEnrollment(response)));
  }

  /**
   * Rejects a pre-enrollment via POST /pre-enrollments/{id}/reject.
   */
  rejectPreinscription(
    enrollmentId: string,
    justification: string,
  ): Observable<EnrollmentStatusDecisionEntity> {
    return this.http
      .post<PreEnrollmentResponse>(
        `${environment.apiUrl}/pre-enrollments/${enrollmentId}/reject`,
        { reviewedBy: null, reason: justification },
      )
      .pipe(map((response) => this.toStatusDecisionFromPreEnrollment(response)));
  }

  /**
   * Cancels an enrollment via POST /enrollments/{id}/cancel.
   */
  cancelPreinscription(
    enrollmentId: string,
    justification: string,
  ): Observable<EnrollmentStatusDecisionEntity> {
    return this.http
      .post<EnrollmentCommandResponse>(
        `${environment.apiUrl}/enrollments/${enrollmentId}/cancel?reason=${encodeURIComponent(justification)}`,
        {},
      )
      .pipe(map((response) => this.toStatusDecisionFromEnrollment(response)));
  }

  updateStudent(studentId: string, student: StudentEntity): Observable<StudentEntity> {
    return this.http
      .put<BackendStudentApi>(
        `${environment.apiUrl}/students/${studentId}`,
        StudentMapper.toBackendApi(student),
      )
      .pipe(map((updated) => StudentMapper.fromApi(updated)));
  }

  deleteStudent(studentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/students/${studentId}`);
  }

  // ─── Private mapping helpers ──────────────────────────────────────────────

  /**
   * Maps EnrollmentMediumApiResponse → EnrollmentEntity.
   * EnrollmentMediumDTO (backend) uses a StudentBasicDTO which embeds PersonBasicDTO.
   */
  private fromEnrollmentMedium(item: EnrollmentMediumApiResponse): EnrollmentEntity {
    const studentId = item.student?.id != null ? String(item.student.id) : null;
    // PersonBasicDTO nests name in person.firstName/lastName; legacy StudentDTO uses firstNameStudent/lastNameStudent
    const firstName = item.student?.person?.firstName ?? item.student?.firstNameStudent ?? '';
    const lastName = item.student?.person?.lastName ?? item.student?.lastNameStudent ?? '';
    const studentNumber = item.student?.studentNumber ?? null;

    return {
      id: item.id != null ? String(item.id) : null,
      number: item.number ?? null,
      studentId,
      student: studentId
        ? {
            id: studentId,
            studentNumber,
            firstNameStudent: firstName,
            lastNameStudent: lastName,
            dateOfBirth: null,
            ecolePrecedente: '',
          }
        : null,
      classeRoomId: item.classroomId != null ? String(item.classroomId) : null,
      classeRoom: item.classroomId != null
        ? { id: String(item.classroomId), nameClasse: item.classroomName ?? null }
        : null,
      anneeScolaireId: item.academicYearId != null ? String(item.academicYearId) : null,
      anneescolaire: item.academicYearId != null
        ? {
            id: String(item.academicYearId),
            libelleAcademicYear: item.academicYearLabel ?? null,
            libelleAnneeScolaire: item.academicYearLabel ?? null,
          }
        : null,
      dateInscription: item.enrollmentDate ?? null,
      statutPreinscription: this.mapEnrollmentStatus(item.status),
    };
  }

  private toCreatePreEnrollmentPayload(enrollment: EnrollmentEntity): CreatePreEnrollmentPayload {
    const student = enrollment.student;
    return {
      firstName: student?.firstNameStudent ?? '',
      lastName: student?.lastNameStudent ?? '',
      birthDate: student?.dateOfBirth
        ? String(student.dateOfBirth).substring(0, 10)
        : null,
      gender: student?.gender ?? null,
      birthPlace: null,
      academicYearId: this.toApiId(enrollment.anneeScolaireId),
      requestedLevel: enrollment.classeRoom?.level ?? null,
      requiredFee: null,
    };
  }

  private fromPreEnrollmentResponse(
    response: PreEnrollmentResponse,
    original: EnrollmentEntity,
  ): EnrollmentEntity {
    return {
      ...original,
      id: response.id != null ? String(response.id) : original.id,
      statutPreinscription: this.mapPreEnrollmentStatus(response.status),
    };
  }

  private toStatusDecisionFromPreEnrollment(
    response: PreEnrollmentResponse,
  ): EnrollmentStatusDecisionEntity {
    return {
      id: response.id != null ? String(response.id) : '',
      studentId: null,
      status: this.mapPreEnrollmentStatus(response.status) ?? 'EN_ATTENTE',
      reason: null,
      changedBy: null,
      changedAt: response.submittedAt ?? null,
    };
  }

  private toStatusDecisionFromEnrollment(
    response: EnrollmentCommandResponse,
  ): EnrollmentStatusDecisionEntity {
    return {
      id: response.id != null ? String(response.id) : '',
      studentId: response.studentId != null ? String(response.studentId) : null,
      status: this.mapEnrollmentStatus(response.status) ?? 'ANNULEE',
      reason: null,
      changedBy: null,
      changedAt: null,
    };
  }

  private mapPreEnrollmentStatus(status: string | null | undefined): import('../domain/models/enrollment.entity').EnrollmentPreRegistrationStatus | null {
    const map: Record<string, import('../domain/models/enrollment.entity').EnrollmentPreRegistrationStatus> = {
      DRAFT: 'BROUILLON',
      SUBMITTED: 'EN_ATTENTE',
      UNDER_REVIEW: 'EN_ATTENTE',
      APPROVED: 'VALIDEE',
      REJECTED: 'REFUSEE',
      REJETEE: 'REFUSEE',
      CANCELLED: 'ANNULEE',
      EXPIRED: 'ANNULEE',
    };
    return (status && map[status]) ? map[status] : null;
  }

  private mapEnrollmentStatus(status: string | null | undefined): import('../domain/models/enrollment.entity').EnrollmentPreRegistrationStatus | null {
    const map: Record<string, import('../domain/models/enrollment.entity').EnrollmentPreRegistrationStatus> = {
      PENDING_CONFIRMATION: 'EN_ATTENTE',
      PENDING: 'EN_ATTENTE',
      CONFIRMED: 'VALIDEE',
      CANCELLED: 'ANNULEE',
      WITHDRAWN: 'ANNULEE',
      COMPLETED: 'INSCRITE',
    };
    return (status && map[status]) ? map[status] : null;
  }

  private toApiId(id: string | null | undefined): number | null {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
}
