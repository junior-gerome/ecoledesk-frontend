import { ClassroomEntity } from "./classroom.entity";
import { PaymentEntity } from "./payment.entity";
import { SchoolYearEntity } from "./school-year.entity";
import { StudentEntity } from "./student.entity";
import { ApiDateValue } from "./value-objects/api-date-value.type";

export type EnrollmentPreRegistrationStatus =
  | "BROUILLON"
  | "EN_ATTENTE"
  | "VALIDEE"
  | "REFUSEE"
  | "ANNULEE"
  | "INSCRITE";

export interface EnrollmentEntity {
  id?: string | null;
  student?: StudentEntity | null;
  studentId?: string | null;
  classeRoom?: ClassroomEntity | null;
  classeRoomId?: string | null;
  sectionId?: string | null;
  montant?: PaymentEntity | null;
  montantId?: string | null;
  anneescolaire?: SchoolYearEntity | null;
  anneeScolaireId?: string | null;
  dateInscription?: ApiDateValue;
  statutPreinscription?: EnrollmentPreRegistrationStatus | null;
  datePreinscription?: ApiDateValue;
}

export interface EnrollmentStatusDecisionEntity {
  id: string;
  studentId: string | null;
  status: EnrollmentPreRegistrationStatus;
  reason?: string | null;
  changedBy?: string | null;
  changedAt?: ApiDateValue;
}
