import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { Gender, StaffMemberCreateRequest } from '@features/staff/domain/models/staff.model';

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
export class StaffFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly useCase = inject(StaffFormUseCase);

  readonly isEditMode = signal(false);
  readonly memberId = signal<number | undefined>(undefined);

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
  });

  readonly genderOptions: SelectOption<Gender>[] = [
    { value: 'MASCULIN', label: 'Masculin' },
    { value: 'FEMININ', label: 'Féminin' },
  ];

  get ctrl() { return this.form.controls; }
  get isSubmitting() { return this.useCase.isSubmitting; }
  get error() { return this.useCase.error; }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !isNaN(Number(idParam))) {
      const id = Number(idParam);
      this.isEditMode.set(true);
      this.memberId.set(id);
      this.useCase.getById(id, (member) => {
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
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const request: StaffMemberCreateRequest = this.form.getRawValue();
    this.useCase.save(this.memberId(), request, () => {
      void this.router.navigate(['/staff']);
    });
  }

  cancel(): void {
    void this.router.navigate(['/staff']);
  }
}
