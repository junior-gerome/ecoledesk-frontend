import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SchoolContextService } from '@app/core/context/school-context.service';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import {
  AddPreEnrollmentDocumentRequest,
  AddPreEnrollmentGuardianRequest,
  CreatePreEnrollmentRequest,
  Gender,
  PreEnrollment,
  RelationshipType,
} from '../../domain/models/pre-enrollment.model';
import { PreEnrollmentHttpRepository } from '../../infrastructure/pre-enrollment-http.repository';

@Component({
  selector: 'app-pre-enrollment-wizard-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PageLayoutComponent,
    PageHeaderComponent,
    ButtonComponent,
  ],
  templateUrl: './pre-enrollment-wizard-page.component.html',
})
export class PreEnrollmentWizardPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly repository = inject(PreEnrollmentHttpRepository);
  private readonly router = inject(Router);
  readonly schoolContext = inject(SchoolContextService);

  readonly currentStep = signal<number>(1);
  readonly preEnrollment = signal<PreEnrollment | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Formulaire Étape 1 : Candidat
  candidateForm!: FormGroup;

  // Formulaire Étape 2 : Responsable
  guardianForm!: FormGroup;

  // Formulaire Étape 3 : Document
  documentForm!: FormGroup;

  readonly relationshipTypes: { value: RelationshipType; label: string }[] = [
    { value: 'FATHER', label: 'Père' },
    { value: 'MOTHER', label: 'Mère' },
    { value: 'GUARDIAN', label: 'Tuteur légal' },
    { value: 'TUTOR', label: 'Tuteur' },
    { value: 'OTHER', label: 'Autre' },
  ];

  readonly documentTypes: { value: string; label: string }[] = [
    { value: 'BIRTH_CERTIFICATE', label: 'Acte de naissance' },
    { value: 'REPORT_CARD', label: 'Bulletin de notes précédent' },
    { value: 'HEALTH_RECORD', label: 'Carnet de santé / vaccinations' },
    { value: 'CERTIFICATE_OF_SCHOOLING', label: 'Certificat de scolarité' },
    { value: 'ID_PHOTO', label: 'Photo d’identité' },
    { value: 'OTHER', label: 'Autre document' },
  ];

  ngOnInit(): void {
    this.initForms();
    const defaultYear = this.schoolContext.selectedSchoolYear();
    if (defaultYear?.id) {
      this.candidateForm.patchValue({ academicYearId: defaultYear.id });
    }
  }

  private initForms(): void {
    this.candidateForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthDate: ['', [Validators.required]],
      gender: ['MASCULIN', [Validators.required]],
      birthPlace: [''],
      academicYearId: [null, [Validators.required]],
      requestedLevel: ['', [Validators.required]],
      requiredFee: [0, [Validators.min(0)]],
    });

    this.guardianForm = this.fb.group({
      relationshipType: ['FATHER', [Validators.required]],
      relationshipDetails: [''],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      phoneNumber: ['', [Validators.required]],
      address: [''],
      primaryContact: [true],
      financialResponsible: [true],
      emergencyContact: [true],
    });

    this.documentForm = this.fb.group({
      documentType: ['BIRTH_CERTIFICATE', [Validators.required]],
      storageReference: ['', [Validators.required]],
    });
  }

  // Étape 1 : Créer le brouillon
  submitCandidateStep(): void {
    if (this.candidateForm.invalid) {
      this.candidateForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formVal = this.candidateForm.value;
    const request: CreatePreEnrollmentRequest = {
      firstName: formVal.firstName,
      lastName: formVal.lastName,
      birthDate: formVal.birthDate,
      gender: formVal.gender as Gender,
      birthPlace: formVal.birthPlace || undefined,
      academicYearId: Number(formVal.academicYearId),
      requestedLevel: formVal.requestedLevel,
      requiredFee: formVal.requiredFee ? Number(formVal.requiredFee) : 0,
    };

    this.repository.createDraft(request).subscribe({
      next: (created) => {
        this.preEnrollment.set(created);
        this.isLoading.set(false);
        this.currentStep.set(2);
      },
      error: (err) => {
        console.error('Error creating draft', err);
        this.error.set(err?.error?.message || 'Erreur lors de la création du brouillon.');
        this.isLoading.set(false);
      },
    });
  }

  // Étape 2 : Ajouter un responsable
  addGuardian(): void {
    if (this.guardianForm.invalid) {
      this.guardianForm.markAllAsTouched();
      return;
    }

    const currentPre = this.preEnrollment();
    if (!currentPre) return;

    this.isLoading.set(true);
    this.error.set(null);

    const gVal = this.guardianForm.value;
    const request: AddPreEnrollmentGuardianRequest = {
      relationshipType: gVal.relationshipType,
      relationshipDetails: gVal.relationshipDetails || undefined,
      firstName: gVal.firstName,
      lastName: gVal.lastName,
      email: gVal.email || undefined,
      phoneNumber: gVal.phoneNumber,
      address: gVal.address || undefined,
      primaryContact: !!gVal.primaryContact,
      financialResponsible: !!gVal.financialResponsible,
      emergencyContact: !!gVal.emergencyContact,
    };

    this.repository.addGuardian(currentPre.id, request).subscribe({
      next: (updated) => {
        this.preEnrollment.set(updated);
        this.isLoading.set(false);
        this.guardianForm.reset({
          relationshipType: 'MOTHER',
          primaryContact: false,
          financialResponsible: false,
          emergencyContact: true,
        });
      },
      error: (err) => {
        console.error('Error adding guardian', err);
        this.error.set(err?.error?.message || 'Erreur lors de l’ajout du responsable.');
        this.isLoading.set(false);
      },
    });
  }

  // Étape 3 : Ajouter un document
  addDocument(): void {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }

    const currentPre = this.preEnrollment();
    if (!currentPre) return;

    this.isLoading.set(true);
    this.error.set(null);

    const dVal = this.documentForm.value;
    const request: AddPreEnrollmentDocumentRequest = {
      documentType: dVal.documentType,
      storageReference: dVal.storageReference,
    };

    this.repository.addDocument(currentPre.id, request).subscribe({
      next: (updated) => {
        this.preEnrollment.set(updated);
        this.isLoading.set(false);
        this.documentForm.reset({
          documentType: 'REPORT_CARD',
          storageReference: '',
        });
      },
      error: (err) => {
        console.error('Error adding document', err);
        this.error.set(err?.error?.message || 'Erreur lors de l’ajout du document.');
        this.isLoading.set(false);
      },
    });
  }

  // Étape 4 : Soumettre le dossier
  submitPreEnrollment(): void {
    const currentPre = this.preEnrollment();
    if (!currentPre) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.repository.submit(currentPre.id).subscribe({
      next: (submitted) => {
        this.isLoading.set(false);
        this.router.navigate(['/pre-enrollments', submitted.id]);
      },
      error: (err) => {
        console.error('Error submitting pre-enrollment', err);
        this.error.set(err?.error?.message || 'Erreur lors de la soumission du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  goToStep(step: number): void {
    if (step > 1 && !this.preEnrollment()) {
      return;
    }
    this.currentStep.set(step);
  }
}
