export interface StudentPerformanceRow {
  studentId: number;
  studentName: string;
  className: string;
  averageGrade: number;
  attendanceRate: number;
  rank?: number;
}

export interface StudentPerformanceSummary {
  totalStudents: number;
  averageGrade: number;
  attendanceRate: number;
  atRiskCount: number;
}

export interface StudentPerformanceReport {
  generatedAt: string;
  periodLabel?: string;
  summary: StudentPerformanceSummary;
  topStudents: StudentPerformanceRow[];
  riskStudents: StudentPerformanceRow[];
}

export interface FinancialSummary {
  totalRevenue: number;
  totalOutstanding: number;
  paidCount: number;
  unpaidCount: number;
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export interface FinancialReport {
  generatedAt: string;
  periodLabel?: string;
  summary: FinancialSummary;
  revenueByMonth: MonthlyRevenue[];
  topOutstanding: Array<{
    studentName: string;
    className: string;
    amount: number;
  }>;
}
