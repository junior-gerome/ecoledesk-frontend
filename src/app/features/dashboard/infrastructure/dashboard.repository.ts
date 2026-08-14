import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@environments/environment";
import { DashboardRepository } from "../domain/repositories/dashboard.repository";
import { StudentStatistics } from "@app/features/students/domain/models";
import { StudentByClasseDTO } from "@app/features/students/domain/models";
import { StudentBySectionCountDto } from "@app/features/students/domain/models";
import { Observable, map, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { DirectionDashboardSummary } from "../domain/models/dashboard-metrics.model";

/** Shape returned by GET /classes */
interface ClassRoomApiResponse {
  id?: number;
  nameClasse?: string;
  capacity?: number;
  section?: { id?: number; libelle?: string } | null;
}

@Injectable()
export class DashboardRepositoryAdapter implements DashboardRepository {
  private readonly http = inject(HttpClient);

  getStudentStatistics(): Observable<StudentStatistics> {
    return this.http.get<StudentStatistics>(`${environment.apiUrl}/students/statistics`);
  }

  getTotalTeachers(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/teachers/count`);
  }

  getTotalClasses(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/classes/count`);
  }

  getTotalStudents(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/students/count`);
  }

  /**
   * Derives per-class student counts from GET /classes.
   * The backend does not expose a dedicated count-by-class enrollment endpoint yet.
   * Returns 0 for studentCount until GET /enrollments?classId= is available.
   */
  getStudentsByClass(): Observable<StudentByClasseDTO[]> {
    return this.http.get<ClassRoomApiResponse[]>(`${environment.apiUrl}/classes`).pipe(
      map((classes) =>
        (classes ?? []).map((c) => ({
          nameClasseRoom: c.nameClasse ?? `Classe ${c.id ?? ''}`,
          studentCount: 0,
          newStudentCount: 0,
        })),
      ),
      catchError(() => of([] as StudentByClasseDTO[])),
    );
  }

  /**
   * Derives per-section counts from GET /classes.
   * Aggregates classes by section until GET /enrollments?sectionId= is available.
   */
  getStudentsBySection(): Observable<StudentBySectionCountDto[]> {
    return this.http.get<ClassRoomApiResponse[]>(`${environment.apiUrl}/classes`).pipe(
      map((classes) => {
        const bySection = new Map<string, number>();
        (classes ?? []).forEach((c) => {
          const name = c.section?.libelle ?? 'Section inconnue';
          bySection.set(name, (bySection.get(name) ?? 0));
        });
        return Array.from(bySection.entries()).map(([sectionName, studentCount]) => ({
          sectionName,
          studentCount,
          newStudentCount: 0,
        }));
      }),
      catchError(() => of([] as StudentBySectionCountDto[])),
    );
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
