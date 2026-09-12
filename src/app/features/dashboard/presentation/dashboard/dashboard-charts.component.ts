import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '@app/shared/ui/card/card.component';
import { DashboardUseCase } from '@features/dashboard/application/use-cases/dashboard.use-case';

@Component({
  selector: 'app-dashboard-charts',
  host: { class: 'block' },
  standalone: true,
  imports: [NgChartsModule, CardComponent, TranslateModule],
templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChartsComponent {
  private readonly useCase = inject(DashboardUseCase);

  readonly studentsByClasseData = this.useCase.studentsByClasseData;
  readonly studentsBySectionData = this.useCase.studentsBySectionData;
  readonly newStudentsBySectionData = this.useCase.newStudentsBySectionData;
  readonly newStudentsByClasseData = this.useCase.newStudentsByClasseData;
  readonly studentsByClasseDoughnutData = this.useCase.studentsByClasseDoughnutData;

  readonly studentsByClasseOptions = this.useCase.studentsByClasseOptions;
  readonly studentsBySectionOptions = this.useCase.studentsBySectionOptions;
  readonly newStudentsBySectionOptions = this.useCase.newStudentsBySectionOptions;
  readonly newStudentsByClasseOptions = this.useCase.newStudentsByClasseOptions;
  readonly studentsByClasseDoughnutOptions = this.useCase.studentsByClasseDoughnutOptions;

  readonly studentsByClasseType = this.useCase.studentsByClasseType;
  readonly studentsBySectionType = this.useCase.studentsBySectionType;
  readonly newStudentsBySectionType = this.useCase.newStudentsBySectionType;
  readonly newStudentsByClasseType = this.useCase.newStudentsByClasseType;
  readonly studentsByClasseDoughnutType = this.useCase.studentsByClasseDoughnutType;
}
