import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormBodyComponent } from '@app/shared/form-body/form-body.component';
import { PageFormBodyComponent } from '@app/shared/page-form-body/page-form-body.component';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '@app/shared/ui/select/select.component';
import { PhotoUploadComponent } from '@app/shared/components/photo-upload/photo-upload.component';
import { StaffFormUseCase } from '@features/staff/application/use-cases/staff-form.use-case';
import {
  AssignmentStatus,
  Gender,
  StaffMemberFormData,
  StaffPosition,
} from '@features/staff/domain/models/staff.model';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    FormBodyComponent,
    PageFormBodyComponent,
    PhotoUploadComponent,
  ],
  providers: [StaffFormUseCase],
  templateUrl: './staff-form.component.html',
})
export class StaffFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly useCase = inject(StaffFormUseCase);

  readonly isEditMode = signal(false);
  readonly memberId = signal<number | undefined>(undefined);

  private readonly subscriptions = new Subscription();

  readonly form: FormGroup = this.fb.group({
    employeeNumber: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.email],
    phone: [''],
    gender: [null, Validators.required],
    employmentDate: [new Date().toISOString().split('T')[0], Validators.required],
    birthDate: [''],
    speciality: [''],
    level: [''],
    address: [''],
    city: [''],
    country: [''],
    photoUrl: [''],
    cniNumber: [''],
    cniPhotoUrl: [''],
    position: [null, Validators.required],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    endDate: [''],
    assignmentStatus: ['ACTIVE', Validators.required],
  });

  readonly genderOptions: SelectOption<Gender>[] = [
    { value: 'MASCULIN', label: 'Masculin' },
    { value: 'FEMININ', label: 'Féminin' },
  ];

  readonly assignmentStatusOptions: SelectOption<AssignmentStatus>[] = [
    { value: 'ACTIVE', label: 'Actif (En fonction)' },
    { value: 'INACTIVE', label: 'Inactif (Clôturé)' },
  ];

  get positionOptions(): SelectOption<StaffPosition>[] {
    return this.useCase.positions().map((p) => ({ value: p.code, label: p.label }));
  }

  get ctrl() {
    return this.form.controls;
  }

  get isSubmitting() {
    return this.useCase.isSubmitting;
  }

  get error() {
    return this.useCase.error;
  }

  ngOnInit(): void {
    this.useCase.loadPositions();
    this.setupStatusAndDateSynchronization();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !isNaN(Number(idParam))) {
      const id = Number(idParam);
      this.isEditMode.set(true);
      this.memberId.set(id);

      this.useCase.getById(id, (member, activeAssignment) => {
        const isClosed = !!activeAssignment?.endDate || activeAssignment?.active === false;
        this.form.patchValue({
          employeeNumber: member.employeeNumber,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          gender: member.gender,
          employmentDate: member.employmentDate,
          birthDate: member.birthDate ?? '',
          speciality: member.speciality,
          level: member.level,
          address: member.address,
          city: member.city,
          country: member.country,
          photoUrl: member.photoUrl,
          cniNumber: member.cniNumber,
          cniPhotoUrl: member.cniPhotoUrl,
          position: activeAssignment?.position ?? null,
          startDate: activeAssignment?.startDate ?? member.employmentDate,
          endDate: activeAssignment?.endDate ?? '',
          assignmentStatus: isClosed ? 'INACTIVE' : 'ACTIVE',
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupStatusAndDateSynchronization(): void {
    // When assignmentStatus changes, synchronize endDate
    const statusSub = this.form.get('assignmentStatus')?.valueChanges.subscribe((status: AssignmentStatus) => {
      const endDateCtrl = this.form.get('endDate');
      if (status === 'INACTIVE') {
        // If status is set to INACTIVE and endDate is empty, default to today
        if (!endDateCtrl?.value) {
          endDateCtrl?.setValue(new Date().toISOString().split('T')[0], { emitEvent: false });
        }
      } else if (status === 'ACTIVE') {
        // If status is set to ACTIVE, clear endDate
        if (endDateCtrl?.value) {
          endDateCtrl?.setValue('', { emitEvent: false });
        }
      }
    });

    // When endDate changes manually, synchronize assignmentStatus
    const endDateSub = this.form.get('endDate')?.valueChanges.subscribe((endDate: string) => {
      const statusCtrl = this.form.get('assignmentStatus');
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData: StaffMemberFormData = this.form.getRawValue();

    // Ensure date consistency based on assignmentStatus
    if (formData.assignmentStatus === 'INACTIVE' && !formData.endDate) {
      formData.endDate = new Date().toISOString().split('T')[0];
    } else if (formData.assignmentStatus === 'ACTIVE') {
      formData.endDate = undefined;
    }

    this.useCase.save(this.memberId(), formData, () => {
      void this.router.navigate(['/staff']);
    });
  }

  cancel(): void {
    void this.router.navigate(['/staff']);
  }
}
