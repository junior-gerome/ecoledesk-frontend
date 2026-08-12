import { inject, Injectable } from '@angular/core';
import { EnrollmentFormValue } from '../../domain/models/enrollment-form-value.model';
import { StudentEnrollmentFacade } from '../../application/facades/student-enrollment.facade';
import { StoreActionResult } from './enrollment.store';

@Injectable()
export class StudentPageStore {
  private readonly facade = inject(StudentEnrollmentFacade);

  readonly students = this.facade.students;
  readonly studentClasses = this.facade.studentClasses;
  readonly sections = this.facade.sections;
  readonly classes = this.facade.classes;
  readonly selectedMontant = this.facade.selectedMontant;
  readonly montantLoading = this.facade.montantLoading;
  readonly activeAnneeScolaire = this.facade.activeAnneeScolaire;
  readonly isSubmitting = this.facade.isSubmitting;
  readonly error = this.facade.error;

  loadListPage(): Promise<void> {
    return this.facade.loadListPage();
  }

  loadStudentForm(studentId?: string): Promise<EnrollmentFormValue | null> {
    return this.facade.loadStudentForm(studentId);
  }

  loadClassesForSection(sectionId: string | null): Promise<void> {
    return this.facade.loadClassesForSection(sectionId);
  }

  loadMontantForClass(classId: string | null): Promise<void> {
    return this.facade.loadMontantForClass(classId);
  }

  validateBeforeSubmit(formValue: EnrollmentFormValue): string | null {
    return this.facade.validateBeforeSubmit(formValue);
  }

  createStudent(formValue: EnrollmentFormValue): Promise<StoreActionResult> {
    return this.facade.createStudent(formValue);
  }

  updateStudent(formValue: EnrollmentFormValue): Promise<StoreActionResult> {
    return this.facade.updateStudent(formValue);
  }

  deleteStudent(studentId: string): Promise<StoreActionResult> {
    return this.facade.deleteStudent(studentId);
  }

  resetEditionContext(): void {
    this.facade.resetEditionContext();
  }
}
