import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { CardComponent } from '@app/shared/ui/card/card.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { ToastComponent } from '@app/shared/ui/toast/toast.component';
import { FinancialReportUseCase } from '@features/reports/application/use-cases/financial-report.use-case';
import { REPORT_REPOSITORY } from '@features/reports/domain/repositories/report.repository';
import { ReportDomainService } from '@features/reports/domain/services/report-domain.service';
import { ReportRepositoryAdapter } from '@features/reports/infrastructure/report.repository';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    TableComponent,
    ToastComponent,
    TranslateModule,
  ],
  templateUrl: './financial-report.component.html',
  styleUrls: ['./financial-report.component.scss'],
  providers: [
    ReportRepositoryAdapter,
    {
      provide: REPORT_REPOSITORY,
      useExisting: ReportRepositoryAdapter,
    },
    ReportDomainService,
    FinancialReportUseCase,
  ],
})
export class FinancialReportComponent implements OnInit {
  readonly useCase = inject(FinancialReportUseCase);

  ngOnInit(): void {
    this.useCase.initialize();
  }
}
