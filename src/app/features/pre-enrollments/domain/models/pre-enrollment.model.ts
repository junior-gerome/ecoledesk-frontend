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

export interface ReviewPreEnrollmentDocumentRequest {
  status: DocumentReviewStatus;
  reviewedBy?: number;
  reason?: string;
}

export interface DecisionRequest {
  reviewedBy?: number;
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
  status: string;
}
