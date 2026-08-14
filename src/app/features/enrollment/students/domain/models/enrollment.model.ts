/**
 * Frontend interfaces aligned with backend DTOs (EnrollmentFullDTO, EnrollmentResponse).
 * Source of truth: EnrollmentController → /enrollments
 */

/** Maps to backend EnrollmentStatus enum */
export type EnrollmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'WITHDRAWN';

/** Maps to backend EnrollmentType enum */
export type EnrollmentType = 'NEW' | 'RENEWAL' | 'TRANSFER';

/**
 * Full enrollment — maps to backend EnrollmentFullDTO.
 * Returned when the GET /enrollments/{id} query endpoint is exposed.
 */
export interface EnrollmentFullDTO {
  id: number | null;
  number: string | null;
  status: EnrollmentStatus | null;
  type: EnrollmentType | null;
  enrollmentDate: string | null;       // ISO date YYYY-MM-DD
  confirmationDate: string | null;
  withdrawalDate: string | null;
  cancellationReason: string | null;
  /** Populated from backend StudentFullDTO */
  student: EnrollmentStudentDTO | null;
  preEnrollmentId: number | null;
  preEnrollmentNumber: string | null;
  classroomId: number | null;
  classroomName: string | null;
  academicYearId: number | null;
  academicYearLabel: string | null;
  active: boolean | null;
  creationDate: string | null;
  updateDate: string | null;
}

/**
 * Lightweight student info embedded in EnrollmentFullDTO.
 * Sourced from backend StudentFullDTO / StudentBasicDTO.
 */
export interface EnrollmentStudentDTO {
  id: number | null;
  studentNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  currentLevel: string | null;
  active: boolean | null;
}

/**
 * Command response — maps to backend EnrollmentResponse.
 * Returned by POST /enrollments/from-pre-enrollment/{id},
 * POST /enrollments/{id}/confirm, /cancel, /withdraw.
 */
export interface EnrollmentResponse {
  id: number | null;
  number: string | null;
  preEnrollmentId: number | null;
  studentId: number | null;
  classroomId: number | null;
  status: EnrollmentStatus | null;
}

/**
 * Request body — maps to backend CreateEnrollmentFromPreEnrollmentRequest.
 * Sent to POST /enrollments/from-pre-enrollment/{preEnrollmentId}.
 */
export interface CreateEnrollmentFromPreEnrollmentRequest {
  classroomId: number;
}
