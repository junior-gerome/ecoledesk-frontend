import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  FinancialReport,
  StudentPerformanceReport,
} from '@app/features/reports/domain/models';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  FinancialReportFilters,
  PerformanceReportFilters,
  ReportRepository,
} from '../domain/repositories/report.repository';

@Injectable()
export class ReportRepositoryAdapter implements ReportRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  getPerformanceReport(
    filters?: PerformanceReportFilters,
  ): Observable<StudentPerformanceReport> {
    let params = new HttpParams();

    if (filters?.classId) {
      params = params.set('classId', String(filters.classId));
    }
    if (filters?.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<StudentPerformanceReport>(`${this.apiUrl}/performance`, {
      params,
    });
  }

  getFinancialReport(filters?: FinancialReportFilters): Observable<FinancialReport> {
    let params = new HttpParams();

    if (filters?.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<FinancialReport>(`${this.apiUrl}/financial`, {
      params,
    });
  }
}
