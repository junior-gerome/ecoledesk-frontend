import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { StaffListUseCase } from '@features/staff/application/use-cases/staff-list.use-case';
import { StaffMemberMedium } from '@features/staff/domain/models/staff.model';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    TableComponent,
  ],
  providers: [StaffListUseCase],
  templateUrl: './staff-list.component.html',
})
export class StaffListComponent implements OnInit {
  readonly useCase = inject(StaffListUseCase);
  readonly memberPendingDeactivation = signal<StaffMemberMedium | null>(null);

  ngOnInit(): void {
    this.useCase.load();
  }

  requestDeactivate(member: StaffMemberMedium): void {
    this.memberPendingDeactivation.set(member);
  }

  closeModal(): void {
    this.memberPendingDeactivation.set(null);
  }

  confirmDeactivate(): void {
    const member = this.memberPendingDeactivation();
    if (!member?.id) { this.closeModal(); return; }
    this.useCase.deactivate(member.id, () => {
      this.closeModal();
      this.useCase.load();
    });
  }
}
