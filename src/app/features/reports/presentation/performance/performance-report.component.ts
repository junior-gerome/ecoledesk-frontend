import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { CardComponent } from '@app/shared/ui/card/card.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent } from '@app/shared/ui/select/select.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { ToastComponent } from '@app/shared/ui/toast/toast.component';
import { PerformanceReportUseCase } from '@features/reports/application/use-cases/performance-report.use-case';
import { REPORT_REPOSITORY } from '@features/reports/domain/repositories/report.repository';
import { ReportDomainService } from '@features/reports/domain/services/report-domain.service';
import { ReportRepositoryAdapter } from '@features/reports/infrastructure/report.repository';

@Component({
  selector: 'app-performance-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    SelectComponent,
    TableComponent,
    ToastComponent,
    TranslateModule,
  ],
  templateUrl: './performance-report.component.html',
  styleUrls: ['./performance-report.component.scss'],
  providers: [
    ReportRepositoryAdapter,
    {
      provide: REPORT_REPOSITORY,
      useExisting: ReportRepositoryAdapter,
    },
    ReportDomainService,
    PerformanceReportUseCase,
  ],
})
export class PerformanceReportComponent implements OnInit {
  readonly useCase = inject(PerformanceReportUseCase);

  ngOnInit(): void {
    this.useCase.initialize();
  }
}
