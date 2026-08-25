import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '@app/shared/ui/select/select.component';
import { StaffDetailUseCase } from '@features/staff/application/use-cases/staff-detail.use-case';
import {
  AssignmentStatus,
  StaffAssignmentCreateRequest,
  StaffPosition,
  getPositionLabel,
} from '@features/staff/domain/models/staff.model';

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
export class StaffDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly useCase = inject(StaffDetailUseCase);

  readonly showAssignmentModal = signal(false);
  readonly memberId = signal<number>(0);
  readonly getPositionLabel = getPositionLabel;

  private readonly subscriptions = new Subscription();

  readonly assignmentForm: FormGroup = this.fb.group({
    position: [null, Validators.required],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    endDate: [''],
    assignmentStatus: ['ACTIVE', Validators.required],
  });

  readonly assignmentStatusOptions: SelectOption<AssignmentStatus>[] = [
    { value: 'ACTIVE', label: 'Actif (En fonction)' },
    { value: 'INACTIVE', label: 'Inactif (Clôturé)' },
  ];

  get positionOptions(): SelectOption<StaffPosition>[] {
    return this.useCase.positions().map((p) => ({ value: p.code, label: p.label }));
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.memberId.set(id);
    this.useCase.load(id);
    this.setupStatusAndDateSynchronization();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupStatusAndDateSynchronization(): void {
    // When assignmentStatus changes, synchronize endDate
    const statusSub = this.assignmentForm.get('assignmentStatus')?.valueChanges.subscribe((status: AssignmentStatus) => {
      const endDateCtrl = this.assignmentForm.get('endDate');
      if (status === 'INACTIVE') {
        if (!endDateCtrl?.value) {
          endDateCtrl?.setValue(new Date().toISOString().split('T')[0], { emitEvent: false });
        }
      } else if (status === 'ACTIVE') {
        if (endDateCtrl?.value) {
          endDateCtrl?.setValue('', { emitEvent: false });
        }
      }
    });

    // When endDate changes manually, synchronize assignmentStatus
    const endDateSub = this.assignmentForm.get('endDate')?.valueChanges.subscribe((endDate: string) => {
      const statusCtrl = this.assignmentForm.get('assignmentStatus');
      if (endDate && endDate.trim() !== '') {
        if (statusCtrl?.value !== 'INACTIVE') {
          statusCtrl?.setValue('INACTIVE', { emitEvent: false });
        }
      } else {
        if (statusCtrl?.value !== 'ACTIVE') {
          statusCtrl?.setValue('ACTIVE', { emitEvent: false });
        }
      }
    });

    if (statusSub) this.subscriptions.add(statusSub);
    if (endDateSub) this.subscriptions.add(endDateSub);
  }

  openAssignmentModal(): void {
    this.assignmentForm.reset({
      position: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      assignmentStatus: 'ACTIVE',
    });
    this.showAssignmentModal.set(true);
  }

  submitAssignment(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }
    const raw = this.assignmentForm.getRawValue();

    let computedEndDate: string | undefined = raw['endDate'] || undefined;
    if (raw['assignmentStatus'] === 'INACTIVE' && !computedEndDate) {
      computedEndDate = new Date().toISOString().split('T')[0];
    } else if (raw['assignmentStatus'] === 'ACTIVE') {
      computedEndDate = undefined;
    }

    const request: StaffAssignmentCreateRequest = {
      staffMemberId: this.memberId(),
      position: raw['position'],
      startDate: raw['startDate'],
      endDate: computedEndDate,
    };
    this.useCase.createAssignment(request, () => this.showAssignmentModal.set(false));
  }
}
