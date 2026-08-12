import { DestroyRef, Injectable, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { StudentStatistics } from "@app/features/students/domain/models";
import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";
import { catchError, forkJoin, of } from "rxjs";
import { DirectionDashboardSummary } from "../../domain/models/dashboard-metrics.model";
import { DASHBOARD_REPOSITORY, DashboardRepository } from "../../domain/repositories/dashboard.repository";
import { DashboardDomainService } from "../../domain/services/dashboard-domain.service";

type ChartData<T extends ChartType> = ChartConfiguration<T>["data"];

@Injectable()
export class DashboardUseCase {
  private readonly destroyRef = inject(DestroyRef);
  private readonly repository = inject<DashboardRepository>(DASHBOARD_REPOSITORY);
  private readonly domain = inject(DashboardDomainService);

  readonly isLoading = signal(true);

  readonly totalStudents = signal(0);
  readonly francophoneStudents = signal(0);
  readonly anglophoneStudents = signal(0);
  readonly newFrancophoneStudents = signal(0);
  readonly newAnglophoneStudents = signal(0);
  readonly totalTeachers = signal(0);
  readonly totalClasses = signal(0);
  readonly directionSummary = signal<DirectionDashboardSummary>(
    this.emptyDirectionSummary(),
  );

  readonly studentsByClasseData = signal<ChartData<"bar">>(
    this.domain.classBarChartData([]),
  );
  readonly studentsBySectionData = signal<ChartData<"doughnut">>(
    this.domain.sectionDoughnutData([]),
  );
  readonly newStudentsBySectionData = signal<ChartData<"pie">>(
    this.domain.newStudentsPieData(0, 0),
  );
  readonly newStudentsByClasseData = signal<ChartData<"bar">>(
    this.domain.newStudentsByClassData([]),
  );
  readonly studentsByClasseDoughnutData = signal<ChartData<"doughnut">>(
    this.domain.classDoughnutData([]),
  );

  readonly studentsByClasseOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  readonly studentsBySectionOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  readonly newStudentsBySectionOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  readonly newStudentsByClasseOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  readonly studentsByClasseDoughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  readonly studentsByClasseType = "bar" as const;
  readonly studentsBySectionType = "doughnut" as const;
  readonly newStudentsBySectionType = "pie" as const;
  readonly newStudentsByClasseType = "bar" as const;
  readonly studentsByClasseDoughnutType = "doughnut" as const;

  initialize(): void {
    this.loadDashboardMetrics();
  }

  private loadDashboardMetrics(): void {
    this.isLoading.set(true);

    forkJoin({
      stats: this.repository.getStudentStatistics().pipe(
        catchError((error) => {
          console.error("Error loading student statistics:", error);
          return of(this.emptyStats());
        }),
      ),
      totalTeachers: this.repository.getTotalTeachers().pipe(
        catchError((error) => {
          console.error("Error loading teachers count:", error);
          return of(0);
        }),
      ),
      totalClasses: this.repository.getTotalClasses().pipe(
        catchError((error) => {
          console.error("Error loading classes count:", error);
          return of(0);
        }),
      ),
      totalStudents: this.repository.getTotalStudents().pipe(
        catchError((error) => {
          console.error("Error loading students count:", error);
          return of(0);
        }),
      ),
      byClass: this.repository.getStudentsByClass().pipe(
        catchError((error) => {
          console.error("Error loading students by class:", error);
          return of([]);
        }),
      ),
      bySection: this.repository.getStudentsBySection().pipe(
        catchError((error) => {
          console.error("Error loading students by section:", error);
          return of([]);
        }),
      ),
      direction: this.repository.getDirectionSummary().pipe(
        catchError((error) => {
          console.error("Error loading direction summary:", error);
          return of(this.emptyDirectionSummary());
        }),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (metrics) => {
          this.totalStudents.set(
            Number(metrics.totalStudents || metrics.stats.totalStudents || 0),
          );
          this.francophoneStudents.set(
            Number(metrics.stats.francophoneStudents || 0),
          );
          this.anglophoneStudents.set(Number(metrics.stats.anglophoneStudents || 0));
          this.newFrancophoneStudents.set(
            Number(metrics.stats.newFrancophoneStudents || 0),
          );
          this.newAnglophoneStudents.set(
            Number(metrics.stats.newAnglophoneStudents || 0),
          );
          this.totalTeachers.set(Number(metrics.totalTeachers || 0));
          this.totalClasses.set(Number(metrics.totalClasses || 0));
          this.directionSummary.set(metrics.direction);

          this.studentsByClasseData.set(this.domain.classBarChartData(metrics.byClass));
          this.studentsByClasseDoughnutData.set(
            this.domain.classDoughnutData(metrics.byClass),
          );
          this.studentsBySectionData.set(
            this.domain.sectionDoughnutData(metrics.bySection),
          );
          this.newStudentsBySectionData.set(
            this.domain.newStudentsPieData(
              metrics.stats.newFrancophoneStudents || 0,
              metrics.stats.newAnglophoneStudents || 0,
            ),
          );
          this.newStudentsByClasseData.set(
            this.domain.newStudentsByClassData(metrics.byClass),
          );
          this.isLoading.set(false);
        },
      });
  }

  private emptyStats(): StudentStatistics {
    return {
      totalStudents: 0,
      francophoneStudents: 0,
      anglophoneStudents: 0,
      newFrancophoneStudents: 0,
      newAnglophoneStudents: 0,
      monthlyTrend: [],
    };
  }

  private emptyDirectionSummary(): DirectionDashboardSummary {
    return {
      todayAbsences: 0,
      overduePayments: 0,
      overdueAmount: 0,
      excellentResults: 0,
      weakResults: 0,
      overloadedClasses: 0,
      pendingPreRegistrations: 0,
      recentAuditEntries: 0,
    };
  }
}
