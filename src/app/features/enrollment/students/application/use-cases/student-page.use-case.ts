import { Injectable, inject } from '@angular/core';
import { NotificationService } from '@app/core/notification/notification.service';
import { Email } from '@shared/domains/value-objects/email';
import { EnrollmentFormValue } from '../../domain/models/enrollment-form-value.model';
import { EnrollmentStore, StoreActionResult } from '../../presentation/store/enrollment.store';

@Injectable()
export class StudentPageUseCase {
  private readonly store = inject(EnrollmentStore);
  private readonly notificationService = inject(NotificationService);

  readonly students = this.store.students;
  readonly studentClasses = this.store.studentClasses;
  readonly sections = this.store.sections;
  readonly classes = this.store.classes;
  readonly selectedMontant = this.store.selectedMontant;
  readonly montantLoading = this.store.montantLoading;
  readonly activeAnneeScolaire = this.store.activeAnneeScolaire;
  readonly isSubmitting = this.store.isSubmitting;
  readonly error = this.store.error;

  loadListPage(): Promise<void> {
    return this.store.loadListPage();
  }

  loadStudentForm(studentId?: string): Promise<EnrollmentFormValue | null> {
    return this.store.loadStudentForm(studentId);
  }

  loadClassesForSection(sectionId: string | null): Promise<void> {
    return this.store.loadClassesForSection(sectionId);
  }

  loadMontantForClass(classId: string | null): Promise<void> {
    return this.store.loadMontantForClass(classId);
  }

  validateBeforeSubmit(formValue: EnrollmentFormValue): string | null {
    if (!formValue.lastNameStudent.trim() || !formValue.firstNameStudent.trim()) {
      return "Le nom et le prenom de l'eleve sont obligatoires.";
    }

    if (!formValue.dateOfBirth) {
      return "La date de naissance de l'eleve est obligatoire.";
    }

    if (!formValue.gender) {
      return "Le genre de l'eleve est obligatoire.";
    }

    if (!formValue.sectionId) {
      return 'Veuillez selectionner une section avant de continuer.';
    }

    if (!formValue.classId) {
      return "Veuillez selectionner une classe pour cet eleve.";
    }

    if (!formValue.TypeParent) {
      return 'Le type de parent ou responsable est obligatoire.';
    }

    if (!formValue.lastNameParent.trim() || !formValue.firstNameParent.trim()) {
      return 'Les informations du parent responsable sont obligatoires.';
    }

    if (!formValue.phoneNumber.trim()) {
      return 'Le numero de telephone du parent responsable est obligatoire.';
    }

    if (formValue.email.trim()) {
      try {
        Email.create(formValue.email);
      } catch {
        return "L'adresse email du parent responsable n'est pas valide.";
      }
    }

    if (!this.activeAnneeScolaire()?.id) {
      return "Aucune annee scolaire active n'est disponible pour enregistrer l'eleve.";
    }

    if (!this.selectedMontant()?.id) {
      return "Les frais de preinscription sont introuvables pour la classe selectionnee.";
    }

    return null;
  }

  createStudent(formValue: EnrollmentFormValue): Promise<StoreActionResult> {
    return this.executeSubmit(
      'creation',
      formValue,
      () => this.store.createEnrollment(formValue),
    );
  }

  updateStudent(formValue: EnrollmentFormValue): Promise<StoreActionResult> {
    return this.executeSubmit(
      'mise a jour',
      formValue,
      () => this.store.saveStudentChanges(formValue),
    );
  }

  async deleteStudent(studentId: string): Promise<StoreActionResult> {
    const result = await this.store.deleteStudent(studentId);

    if (result.success) {
      this.notificationService.success(result.message, 0);
    }

    return result;
  }

  resetEditionContext(): void {
    this.store.closeStudentEdition();
  }

  private async executeSubmit(
    actionLabel: 'creation' | 'mise a jour',
    formValue: EnrollmentFormValue,
    handler: () => Promise<StoreActionResult>,
  ): Promise<StoreActionResult> {
    const validationMessage = this.validateBeforeSubmit(formValue);
    if (validationMessage) {
      return {
        success: false,
        kind: 'error',
        message: validationMessage,
      };
    }

    const result = await handler();
    if (result.success) {
      this.notificationService.success(result.message, 0);
      return result;
    }

    return {
      ...result,
      message: result.message || `La ${actionLabel} de l'eleve a echoue.`,
    };
  }
}
