import { TypePaiement } from '@app/enums/typePaiement.enum';

export type PaymentStatus = 'PENDING' | 'PAID' | 'LATE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CHEQUE' | 'VIREMENT' | 'MOBILE_MONEY';
export type PaymentType = TypePaiement;

export interface Payment {
  id?: number;
  studentId: number;
  /** Matricule de l'étudiant (ex: GSBP-000001) — renvoyé par le backend dans studentNumber */
  studentNumber?: string | null;
  studentName?: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  type: PaymentType;
  status: PaymentStatus;
  description?: string;
  paymentMethod?: PaymentMethod;
  receiptNumber?: string;
}
