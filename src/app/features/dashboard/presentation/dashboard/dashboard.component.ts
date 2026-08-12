import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from "@app/shared/ui/card/card.component";
import { DashboardUseCase } from "@features/dashboard/application/use-cases/dashboard.use-case";
import { DASHBOARD_REPOSITORY } from "@features/dashboard/domain/repositories/dashboard.repository";
import { DashboardRepositoryAdapter } from "@features/dashboard/infrastructure/dashboard.repository";

import { DashboardChartsComponent } from "./dashboard-charts.component";
@Component({
  selector: "app-dashboard",
  imports: [CommonModule, RouterModule, TranslateModule, CardComponent, DashboardChartsComponent],
  standalone: true,
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DashboardRepositoryAdapter,
    {
      provide: DASHBOARD_REPOSITORY,
      useExisting: DashboardRepositoryAdapter,
    },
    DashboardUseCase,
  ],
})
export class DashboardComponent implements OnInit {
  readonly useCase = inject(DashboardUseCase);

  readonly isLoading = this.useCase.isLoading;
  readonly totalStudents = this.useCase.totalStudents;
  readonly francophoneStudents = this.useCase.francophoneStudents;
  readonly anglophoneStudents = this.useCase.anglophoneStudents;
  readonly newFrancophoneStudents = this.useCase.newFrancophoneStudents;
  readonly newAnglophoneStudents = this.useCase.newAnglophoneStudents;
  readonly totalTeachers = this.useCase.totalTeachers;
  readonly totalClasses = this.useCase.totalClasses;
  readonly directionSummary = this.useCase.directionSummary;

  ngOnInit(): void {
    this.useCase.initialize();
  }
}
