import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '@app/shared/ui/select/select.component';
import { StaffDetailUseCase } from '@features/staff/application/use-cases/staff-detail.use-case';
import { StaffAssignmentCreateRequest, StaffPosition } from '@features/staff/domain/models/staff.model';

@Component({
  selector: 'app-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    PageLayoutComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
  ],
  providers: [StaffDetailUseCase],
  templateUrl: './staff-detail.component.html',
})
export class StaffDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly useCase = inject(StaffDetailUseCase);

  readonly showAssignmentModal = signal(false);
  readonly memberId = signal<number>(0);

  readonly assignmentForm: FormGroup = this.fb.group({
    position: [null, Validators.required],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    endDate: [''],
  });

  get positionOptions(): SelectOption<StaffPosition>[] {
    return this.useCase.positions().map((p) => ({ value: p.code, label: p.label }));
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.memberId.set(id);
    this.useCase.load(id);
  }

  openAssignmentModal(): void {
    this.assignmentForm.reset({ startDate: new Date().toISOString().split('T')[0] });
    this.showAssignmentModal.set(true);
  }

  submitAssignment(): void {
    if (this.assignmentForm.invalid) { this.assignmentForm.markAllAsTouched(); return; }
    const raw = this.assignmentForm.getRawValue();
    const request: StaffAssignmentCreateRequest = {
      staffMemberId: this.memberId(),
      position: raw['position'],
      startDate: raw['startDate'],
      endDate: raw['endDate'] || undefined,
    };
    this.useCase.createAssignment(request, () => this.showAssignmentModal.set(false));
  }
}
