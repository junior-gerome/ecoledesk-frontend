import { inject, Injectable } from '@angular/core';
import { EnrollmentFormValue } from '../../domain/models/enrollment-form-value.model';
import { StudentPageUseCase } from '../use-cases/student-page.use-case';
import { StoreActionResult } from '../../presentation/store/enrollment.store';

@Injectable()
export class StudentEnrollmentFacade {
  private readonly useCase = inject(StudentPageUseCase);

  readonly students = this.useCase.students;
  readonly studentClasses = this.useCase.studentClasses;
  readonly sections = this.useCase.sections;
  readonly classes = this.useCase.classes;
  readonly selectedMontant = this.useCase.selectedMontant;
  readonly montantLoading = this.useCase.montantLoading;
  readonly activeAnneeScolaire = this.useCase.activeAnneeScolaire;
  readonly isSubmitting = this.useCase.isSubmitting;
  readonly error = this.useCase.error;

  loadListPage(): Promise<void> {
    return this.useCase.loadListPage();
  }

  loadStudentForm(studentId?: string): Promise<EnrollmentFormValue | null> {
    return this.useCase.loadStudentForm(studentId);
  }

  loadClassesForSection(sectionId: string | null): Promise<void> {
    return this.useCase.loadClassesForSection(sectionId);
  }

  loadMontantForClass(classId: string | null): Promise<void> {
    return this.useCase.loadMontantForClass(classId);
  }

  validateBeforeSubmit(formValue: EnrollmentFormValue): string | null {
    return this.useCase.validateBeforeSubmit(formValue);
  }

  createStudent(formValue: EnrollmentFormValue): Promise<StoreActionResult> {
    return this.useCase.createStudent(formValue);
  }

  updateStudent(formValue: EnrollmentFormValue): Promise<StoreActionResult> {
    return this.useCase.updateStudent(formValue);
  }

  deleteStudent(studentId: string): Promise<StoreActionResult> {
    return this.useCase.deleteStudent(studentId);
  }

  resetEditionContext(): void {
    this.useCase.resetEditionContext();
  }
}
