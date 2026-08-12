import { StudentStatistics } from "@app/features/students/domain/models";
import { StudentByClasseDTO } from "@app/features/students/domain/models";
import { StudentBySectionCountDto } from "@app/features/students/domain/models";

export interface DashboardMetrics {
  stats: StudentStatistics;
  totalTeachers: number;
  totalClasses: number;
  totalStudents: number;
  byClass: StudentByClasseDTO[];
  bySection: StudentBySectionCountDto[];
}

export interface DirectionDashboardSummary {
  todayAbsences: number;
  overduePayments: number;
  overdueAmount: number;
  excellentResults: number;
  weakResults: number;
  overloadedClasses: number;
  pendingPreRegistrations: number;
  recentAuditEntries: number;
}
