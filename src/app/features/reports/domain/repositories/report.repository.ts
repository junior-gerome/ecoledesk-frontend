import { InjectionToken } from '@angular/core';
import {
  FinancialReport,
  StudentPerformanceReport,
} from '@app/features/reports/domain/models';
import { Observable } from 'rxjs';

export interface PerformanceReportFilters {
  classId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface FinancialReportFilters {
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportRepository {
  getPerformanceReport(
    filters?: PerformanceReportFilters,
  ): Observable<StudentPerformanceReport>;
  getFinancialReport(filters?: FinancialReportFilters): Observable<FinancialReport>;
}

export const REPORT_REPOSITORY = new InjectionToken<ReportRepository>(
  'REPORT_REPOSITORY',
);
