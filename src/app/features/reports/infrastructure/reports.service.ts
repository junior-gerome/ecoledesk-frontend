import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {
  FinancialReport,
  StudentPerformanceReport,
} from "@app/features/reports/domain/models";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReportsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  getStudentPerformance(params?: {
    classId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<StudentPerformanceReport> {
    let httpParams = new HttpParams();

    if (params?.classId) {
      httpParams = httpParams.set("classId", String(params.classId));
    }
    if (params?.dateFrom) {
      httpParams = httpParams.set("dateFrom", params.dateFrom);
    }
    if (params?.dateTo) {
      httpParams = httpParams.set("dateTo", params.dateTo);
    }

    return this.http.get<StudentPerformanceReport>(
      `${this.apiUrl}/performance`,
      { params: httpParams },
    );
  }

  getFinancialStats(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Observable<FinancialReport> {
    let httpParams = new HttpParams();

    if (params?.dateFrom) {
      httpParams = httpParams.set("dateFrom", params.dateFrom);
    }
    if (params?.dateTo) {
      httpParams = httpParams.set("dateTo", params.dateTo);
    }

    return this.http.get<FinancialReport>(
      `${this.apiUrl}/financial`,
      { params: httpParams },
    );
  }
}
