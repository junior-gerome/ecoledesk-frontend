export interface DateRange {
  start: Date;
  end: Date;
}

export interface GradeRange {
  min: number;
  max: number;
}

export interface AmountRange {
  min: number;
  max: number;
}

export interface SearchFilters {
  keywords?: string;
  section?: "FRANCOPHONE" | "ANGLOPHONE";
  level?: string;
  dateRange?: DateRange;
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  size?: number;

  age?: number;
  gender?: "M" | "F";
  enrollmentYear?: number;
  classId?: string;
  hasUnpaidFees?: boolean;
  parentPhone?: string;
  address?: string;
  transportSubscribed?: boolean;
  canteenSubscribed?: boolean;

  speciality?: string;
  experience?: number;
  contractType?: string;
  availability?: string;
  qualification?: string;

  subject?: string;
  gradeRange?: GradeRange;
  evaluationType?: string;
  period?: string;
  isValidated?: boolean;

  paymentType?: string;
  paymentMethod?: string;
  amountRange?: AmountRange;
  paymentStatus?: "PAID" | "PENDING" | "OVERDUE";
  isRecurring?: boolean;

  capacity?: number;
  hasAvailableSeats?: boolean;
  schedule?: string;
  academicYear?: string;

  absenceType?: string;
  isJustified?: boolean;
  duration?: number;

  eventType?: string;
  location?: string;
  isPublic?: boolean;
  requiresRegistration?: boolean;

  documentType?: string;
  fileFormat?: string;
  isConfidential?: boolean;
  uploadedBy?: string;

  hasAttachments?: boolean;
  isArchived?: boolean;
  tags?: string[];
  categories?: string[];
  priority?: "LOW" | "MEDIUM" | "HIGH";
}
