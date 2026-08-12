import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent } from '@app/shared/ui/select/select.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { ToastComponent } from '@app/shared/ui/toast/toast.component';
import { AttendanceDailyFacade } from '@features/attendance/application/facades/attendance-daily.facade';
import { DailyAttendanceUseCase } from '@features/attendance/application/use-cases/daily-attendance.use-case';
import { DailyAttendanceRepository } from '@features/attendance/domain/repositories/daily-attendance.repository';
import { DailyAttendanceDomainService } from '@features/attendance/domain/services/daily-attendance-domain.service';
import { DailyAttendanceRepositoryAdapter } from '@features/attendance/infrastructure/daily-attendance.repository';
import { AttendanceDailyStore } from '@features/attendance/presentation/store/attendance-daily.store';

@Component({
  selector: 'app-daily-attendance',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    PageLayoutComponent,
    PageHeaderComponent,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TableComponent,
    ToastComponent,
  ],
  templateUrl: './daily-attendance.component.html',
  styleUrls: ['./daily-attendance.component.scss'],
  providers: [
    DailyAttendanceRepositoryAdapter,
    {
      provide: DailyAttendanceRepository,
      useExisting: DailyAttendanceRepositoryAdapter,
    },
    DailyAttendanceDomainService,
    DailyAttendanceUseCase,
    AttendanceDailyFacade,
    AttendanceDailyStore,
  ],
})
export class DailyAttendanceComponent implements OnInit {
  protected readonly store = inject(AttendanceDailyStore);

  ngOnInit(): void {
    this.store.initialize();
  }
}
