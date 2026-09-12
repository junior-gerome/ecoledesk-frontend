/**
 * Frontend interfaces aligned with backend DTOs (PreEnrollmentFullDTO, PreEnrollmentResponse).
 * Source of truth: PreEnrollmentController → POST /pre-enrollments and workflow actions.
 */

/** Maps to backend PreEnrollmentStatus enum */
export type PreEnrollmentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

/** Maps to backend DocumentReviewStatus enum */
export type DocumentReviewStatus =
  | 'REQUIRED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REPLACEMENT_REQUIRED';

/** Maps to backend Gender enum */
export type Gender = 'MASCULIN' | 'FEMININ';

/** Maps to backend RelationshipType enum */
export type RelationshipType =
  | 'FATHER'
  | 'MOTHER'
  | 'GUARDIAN'
  | 'TUTOR'
  | 'OTHER';

/**
 * Nested guardian DTO — maps to PreEnrollmentFullDTO.PreEnrollmentGuardianDTO.
 */
export interface PreEnrollmentGuardianDTO {
  id: number | null;
  relationshipType: RelationshipType | null;
  relationshipDetails: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  primaryContact: boolean;
  financialResponsible: boolean;
  emergencyContact: boolean;
}

/**
 * Nested document DTO — maps to PreEnrollmentFullDTO.PreEnrollmentDocumentDTO.
 */
export interface PreEnrollmentDocumentDTO {
  id: number | null;
  documentType: string | null;
  storageReference: string | null;
  reviewStatus: DocumentReviewStatus | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

/**
 * Full pre-enrollment — maps to backend PreEnrollmentFullDTO.
 * Returned by GET /pre-enrollments/{id} (when the query endpoint is exposed).
 */
export interface PreEnrollmentFullDTO {
  id: number | null;
  number: string | null;
  status: PreEnrollmentStatus | null;
  applicantFirstName: string | null;
  applicantLastName: string | null;
  applicantBirthDate: string | null;   // ISO date YYYY-MM-DD
  applicantGender: Gender | null;
  applicantBirthPlace: string | null;
  requestedLevel: string | null;
  academicYearId: number | null;
  academicYearLabel: string | null;
  requiredFee: number | null;
  feePaymentReference: string | null;
  rejectionReason: string | null;
  administrativeComment: string | null;
  submittedAt: string | null;          // ISO datetime
  reviewedAt: string | null;
  reviewedBy: number | null;
  active: boolean | null;
  creationDate: string | null;
  updateDate: string | null;
  guardians: PreEnrollmentGuardianDTO[];
  documents: PreEnrollmentDocumentDTO[];
}

/**
 * Command response — maps to backend PreEnrollmentResponse.
 * Returned by POST /pre-enrollments and workflow action endpoints.
 */
export interface PreEnrollmentResponse {
  id: number | null;
  number: string | null;
  status: PreEnrollmentStatus | null;
  academicYearId: number | null;
  requestedLevel: string | null;
  submittedAt: string | null;
}

/**
 * Request body — maps to backend CreatePreEnrollmentRequest.
 * Sent to POST /pre-enrollments.
 */
export interface CreatePreEnrollmentRequest {
  firstName: string;
  lastName: string;
  birthDate: string | null;   // ISO date YYYY-MM-DD
  gender: Gender | null;
  birthPlace: string | null;
  academicYearId: number | null;
  requestedLevel: string | null;
  requiredFee: number | null;
}

/**
 * Request body for workflow decisions — maps to backend DecisionRequest.
 * Sent to POST /pre-enrollments/{id}/start-review, /approve, /reject.
 * The reviewer identity is resolved server-side from Spring Security (no reviewedBy).
 */
export interface PreEnrollmentDecisionRequest {
  reason?: string | null;
}

/**
 * Request body for adding a guardian — maps to backend AddPreEnrollmentGuardianRequest.
 * Sent to POST /pre-enrollments/{id}/guardians.
 */
export interface AddPreEnrollmentGuardianRequest {
  relationshipType: RelationshipType;
  relationshipDetails?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  primaryContact: boolean;
  financialResponsible: boolean;
  emergencyContact: boolean;
}
