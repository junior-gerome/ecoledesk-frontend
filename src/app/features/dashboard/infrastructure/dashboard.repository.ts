import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@environments/environment";
import { DashboardRepository } from "../domain/repositories/dashboard.repository";
import { StudentStatistics } from "@app/features/students/domain/models";
import { StudentByClasseDTO } from "@app/features/students/domain/models";
import { StudentBySectionCountDto } from "@app/features/students/domain/models";
import { Observable } from "rxjs";
import { DirectionDashboardSummary } from "../domain/models/dashboard-metrics.model";

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

  getStudentsByClass(): Observable<StudentByClasseDTO[]> {
    return this.http.get<StudentByClasseDTO[]>(`${environment.apiUrl}/inscription/count-by-classeRoom`);
  }

  getStudentsBySection(): Observable<StudentBySectionCountDto[]> {
    return this.http.get<StudentBySectionCountDto[]>(`${environment.apiUrl}/inscription/count-by-section`);
  }

  getDirectionSummary(): Observable<DirectionDashboardSummary> {
    return this.http.get<DirectionDashboardSummary>(`${environment.apiUrl}/dashboard/direction`);
  }
}
