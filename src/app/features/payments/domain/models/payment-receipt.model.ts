import { BadgeVariant } from '@app/shared/ui/badge/badge.component';
import { PaymentStatus } from '@app/features/payments/domain/models';

export interface PaymentReceiptFilters {
  search: string;
  receiptNumber: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
}

export interface PaymentReceiptViewModel {
  id: number;
  studentId: number;
  studentName: string;
  paymentDate: string;
  dueDate: string;
  amount: number;
  type: string;
  typeLabel: string;
  status: 'PAID' | 'PENDING' | 'LATE' | 'CANCELLED';
  statusLabel: string;
  statusVariant: BadgeVariant;
  paymentMethodLabel: string;
  receiptNumber: string | null;
  canGenerateReceipt: boolean;
}

export interface PaymentReceiptDocumentViewModel {
  id: number;
  studentId: number;
  studentName: string;
  paymentDate: string;
  dueDate: string;
  amount: number;
  type: string;
  typeLabel: string;
  status: PaymentStatus;
  statusLabel: string;
  paymentMethodLabel: string;
  receiptNumber: string | null;
  description: string;
  generatedAt: string;
}

export interface PaymentReceiptSummary {
  totalReceipts: number;
  totalPaidAmount: number;
  numberedReceipts: number;
  pendingReceiptGeneration: number;
}
