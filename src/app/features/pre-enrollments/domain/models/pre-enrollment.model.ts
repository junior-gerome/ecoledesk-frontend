export type PreEnrollmentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type DocumentReviewStatus =
  | 'REQUIRED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REPLACEMENT_REQUIRED';

export type RelationshipType =
  | 'FATHER'
  | 'MOTHER'
  | 'GUARDIAN'
  | 'TUTOR'
  | 'OTHER';

export type Gender = 'MASCULIN' | 'FEMININ' | 'MALE' | 'FEMALE';

/** Maps to backend EnrollmentStatus enum (EnrollmentController /enrollments). */
export type EnrollmentStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'WITHDRAWN'
  | 'COMPLETED';

/** Lightweight classroom option returned by GET /classes (ClasseRoomDTO). */
export interface ClassRoomOption {
  id?: number;
  nameClasse: string;
  level: string;
  capacity: number;
}

export interface PreEnrollmentGuardian {
  id?: number;
  relationshipType: RelationshipType;
  relationshipDetails?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  primaryContact: boolean;
  financialResponsible: boolean;
  emergencyContact: boolean;
}

export interface PreEnrollmentDocument {
  id?: number;
  documentType: string;
  storageReference: string;
  reviewStatus: DocumentReviewStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface PreEnrollment {
  id: number;
  number: string;
  status: PreEnrollmentStatus;
  applicantFirstName: string;
  applicantLastName: string;
  applicantBirthDate: string;
  applicantGender: Gender;
  applicantBirthPlace?: string;
  requestedLevel: string;
  academicYearId: number;
  academicYearLabel?: string;
  requiredFee?: number;
  feePaymentReference?: string;
  rejectionReason?: string;
  administrativeComment?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: number;
  active?: boolean;
  creationDate?: string;
  updateDate?: string;
  guardians?: PreEnrollmentGuardian[];
  documents?: PreEnrollmentDocument[];
}

export interface CreatePreEnrollmentRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  birthPlace?: string;
  academicYearId: number;
  requestedLevel: string;
  requiredFee?: number;
}

export interface AddPreEnrollmentGuardianRequest {
  relationshipType: RelationshipType;
  relationshipDetails?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  primaryContact: boolean;
  financialResponsible: boolean;
  emergencyContact: boolean;
}

export interface AddPreEnrollmentDocumentRequest {
  documentType: string;
  storageReference: string;
}

/** Maps to backend RecordPreEnrollmentFeePaymentRequest (POST /enrollment-finance/pre-enrollments/{id}/fee-payments). */
export interface RecordPreEnrollmentFeePaymentRequest {
  amount: number;
  paymentDate: string;
  transactionReference?: string;
  receiptNumber?: string;
}

/** Maps to backend PreEnrollmentFeePaymentResponse. */
export interface PreEnrollmentFeePaymentResponse {
  id: number;
  preEnrollmentId: number;
  amount: number;
  paymentDate: string;
  transactionReference?: string;
  receiptNumber?: string;
  verified: boolean;
}

export interface ReviewPreEnrollmentDocumentRequest {
  status: DocumentReviewStatus;
  reason?: string;
}

export interface DecisionRequest {
  reason?: string;
}

export interface CreateEnrollmentFromPreEnrollmentRequest {
  classroomId: number;
}

export interface EnrollmentResponse {
  id: number;
  number: string;
  preEnrollmentId: number;
  studentId?: number;
  classroomId?: number;
  status: EnrollmentStatus;
}
