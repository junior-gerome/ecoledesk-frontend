import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@environments/environment";
import { DashboardRepository } from "../domain/repositories/dashboard.repository";
import { StudentStatistics } from "@app/features/students/domain/models";
import { StudentByClasseDTO } from "@app/features/students/domain/models";
import { StudentBySectionCountDto } from "@app/features/students/domain/models";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { DirectionDashboardSummary } from "../domain/models/dashboard-metrics.model";

@Injectable()
export class DashboardRepositoryAdapter implements DashboardRepository {
  private readonly http = inject(HttpClient);

  getStudentStatistics(): Observable<StudentStatistics> {
    return this.http.get<StudentStatistics>(`${environment.apiUrl}/students/statistics`);
  }

  getTotalTeachers(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/staff/members/teachers/count`);
  }

  getTotalClasses(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/classes/count`);
  }

  getTotalStudents(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/students/count`);
  }

  /**
   * Nombre d'eleves confirmes par classe — fourni par le backend
   * (GET /students/statistics/by-class). Chaque eleve compte une seule fois.
   */
  getStudentsByClass(): Observable<StudentByClasseDTO[]> {
    return this.http
      .get<StudentByClasseDTO[]>(`${environment.apiUrl}/students/statistics/by-class`)
      .pipe(catchError(() => of([] as StudentByClasseDTO[])));
  }

  /**
   * Nombre d'eleves confirmes par section — fourni par le backend
   * (GET /students/statistics/by-section).
   */
  getStudentsBySection(): Observable<StudentBySectionCountDto[]> {
    return this.http
      .get<StudentBySectionCountDto[]>(`${environment.apiUrl}/students/statistics/by-section`)
      .pipe(catchError(() => of([] as StudentBySectionCountDto[])));
  }

  /**
   * GET /dashboard/direction — DirectionDashboardDTO (backend source of truth).
   * Falls back to empty summary on error so the dashboard still renders.
   */
  getDirectionSummary(): Observable<DirectionDashboardSummary> {
    return this.http
      .get<DirectionDashboardSummary>(`${environment.apiUrl}/dashboard/direction`)
      .pipe(
        catchError(() =>
          of({
            todayAbsences: 0,
            overduePayments: 0,
            overdueAmount: 0,
            excellentResults: 0,
            weakResults: 0,
            overloadedClasses: 0,
            pendingPreRegistrations: 0,
            recentAuditEntries: 0,
          } as DirectionDashboardSummary),
        ),
      );
  }
}
