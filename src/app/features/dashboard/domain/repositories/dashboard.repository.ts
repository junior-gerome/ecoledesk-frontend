import { InjectionToken } from "@angular/core";
import { StudentByClasseDTO } from "@app/features/students/domain/models";
import { StudentStatistics } from "@app/features/students/domain/models";
import { StudentBySectionCountDto } from "@app/features/students/domain/models";
import { Observable } from "rxjs";
import { DirectionDashboardSummary } from "../models/dashboard-metrics.model";

export interface DashboardRepository {
  getStudentStatistics(): Observable<StudentStatistics>;
  getTotalTeachers(): Observable<number>;
  getTotalClasses(): Observable<number>;
  getTotalStudents(): Observable<number>;
  getStudentsByClass(): Observable<StudentByClasseDTO[]>;
  getStudentsBySection(): Observable<StudentBySectionCountDto[]>;
  getDirectionSummary(): Observable<DirectionDashboardSummary>;
}

export const DASHBOARD_REPOSITORY =
  new InjectionToken<DashboardRepository>("DASHBOARD_REPOSITORY");
