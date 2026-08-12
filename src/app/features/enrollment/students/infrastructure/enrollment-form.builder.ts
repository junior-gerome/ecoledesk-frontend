import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EnrollmentFormValue } from '../domain/models/enrollment-form-value.model';

export type EnrollmentFormGroup = FormGroup<{
  studentId: FormControl<string | null>;
  parentId: FormControl<string | null>;
  lastNameStudent: FormControl<string>;
  firstNameStudent: FormControl<string>;
  dateOfBirth: FormControl<string>;
  gender: FormControl<EnrollmentFormValue['gender']>;
  ecolePrecedente: FormControl<string>;
  photoUrl: FormControl<string>;
  sectionId: FormControl<string | null>;
  classId: FormControl<string | null>;
  montantId: FormControl<string | null>;
  TypeParent: FormControl<EnrollmentFormValue['TypeParent']>;
  lastNameParent: FormControl<string>;
  firstNameParent: FormControl<string>;
  professionParent: FormControl<string>;
  address: FormControl<string>;
  phoneNumber: FormControl<string>;
  email: FormControl<string>;
  photoUrlParent: FormControl<string>;
}>;

@Injectable()
export class EnrollmentFormBuilder {
  create(): EnrollmentFormGroup {
    return new FormGroup({
      studentId: new FormControl<string | null>(null),
      parentId: new FormControl<string | null>(null),
      lastNameStudent: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      firstNameStudent: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      dateOfBirth: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      gender: new FormControl<EnrollmentFormValue['gender']>(null, {
        validators: [Validators.required],
      }),
      ecolePrecedente: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      photoUrl: new FormControl('', {
        nonNullable: true,
      }),
      sectionId: new FormControl<string | null>(null, {
        validators: [Validators.required],
      }),
      classId: new FormControl<string | null>(null, {
        validators: [Validators.required],
      }),
      montantId: new FormControl<string | null>(null),
      TypeParent: new FormControl<EnrollmentFormValue['TypeParent']>(null, {
        validators: [Validators.required],
      }),
      lastNameParent: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      firstNameParent: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      professionParent: new FormControl('', {
        nonNullable: true,
      }),
      address: new FormControl('', {
        nonNullable: true,
      }),
      phoneNumber: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.email],
      }),
      photoUrlParent: new FormControl('', {
        nonNullable: true,
      }),
    });
  }
}
