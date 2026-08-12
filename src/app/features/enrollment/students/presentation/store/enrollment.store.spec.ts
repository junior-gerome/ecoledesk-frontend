import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import {
  createClassroomEntity,
  createEnrollmentEntity,
  createEnrollmentFormValue,
  createPaymentEntity,
  createSchoolYearEntity,
  createSectionEntity,
  createStudentEntity,
} from '../../testing/students-test.fixtures';
import {
  ENROLLMENT_REPOSITORY,
  EnrollmentRepository,
} from '../../domain/repositories/enrollment.repository';
import { EnrollmentStore } from './enrollment.store';

describe('EnrollmentStore', () => {
  let store: EnrollmentStore;
  let repository: jasmine.SpyObj<EnrollmentRepository>;

  beforeEach(() => {
    repository = jasmine.createSpyObj<EnrollmentRepository>(
      'EnrollmentRepository',
      [
        'getStudents',
        'getStudent',
        'getEnrollments',
        'getSections',
        'getAllClasses',
        'getClassesBySection',
        'getActiveSchoolYear',
        'getRegistrationPayment',
        'createEnrollment',
        'updateEnrollment',
        'updateStudent',
        'deleteStudent',
      ],
    );

    TestBed.configureTestingModule({
      providers: [
        EnrollmentStore,
        EnrollmentDomainService,
        { provide: ENROLLMENT_REPOSITORY, useValue: repository },
      ],
    });

    store = TestBed.inject(EnrollmentStore);
  });

  function seedListState(options?: { activeSchoolYear?: ReturnType<typeof createSchoolYearEntity> | null }): void {
    const activeSchoolYear =
      options && 'activeSchoolYear' in options
        ? options.activeSchoolYear
        : createSchoolYearEntity();

    repository.getStudents.and.returnValue(of([createStudentEntity()]));
    repository.getEnrollments.and.returnValue(of([createEnrollmentEntity()]));
    repository.getSections.and.returnValue(of([createSectionEntity()]));
    repository.getAllClasses.and.returnValue(of([createClassroomEntity()]));
    repository.getClassesBySection.and.returnValue(of([createClassroomEntity()]));
    repository.getActiveSchoolYear.and.returnValue(of(activeSchoolYear ?? null));
    repository.getRegistrationPayment.and.returnValue(of(createPaymentEntity()));
    repository.createEnrollment.and.returnValue(of(createEnrollmentEntity({ id: '99' })));
    repository.updateStudent.and.returnValue(of(createStudentEntity({ lastNameStudent: 'Updated' })));
    repository.updateEnrollment.and.returnValue(of(createEnrollmentEntity({ id: '10' })));
    repository.deleteStudent.and.returnValue(of(void 0));
    repository.getStudent.and.returnValue(of(createStudentEntity()));
  }

  it('should load the list page and expose computed student classes', async () => {
    seedListState();

    await store.loadListPage();

    expect(store.students().length).toBe(1);
    expect(store.studentClasses()['1']).toBe('CM1');
    expect(store.activeAnneeScolaire()?.id).toBe('3');
  });

  it('should load a student form in edit mode and keep the current enrollment context', async () => {
    seedListState();

    const formValue = await store.loadStudentForm('1');

    expect(formValue?.studentId).toBe('1');
    expect(formValue?.classId).toBe('5');
    expect(store.studentToEdit()?.enrollment?.id).toBe('10');
  });

  it('should reject enrollment creation when no active school year exists', async () => {
    seedListState({ activeSchoolYear: null });
    await store.loadListPage();
    await store.loadMontantForClass('5');

    const result = await store.createEnrollment(createEnrollmentFormValue());

    expect(result.success).toBeFalse();
    expect(result.message).toContain('Aucune annee scolaire active');
  });

  it('should create an enrollment successfully when required state is available', async () => {
    seedListState();
    await store.loadListPage();
    await store.loadMontantForClass('5');

    const result = await store.createEnrollment(createEnrollmentFormValue());

    expect(result.success).toBeTrue();
    expect(repository.createEnrollment).toHaveBeenCalled();
    expect(store.isSubmitting()).toBeFalse();
  });

  it('should return a warning when student update succeeds but enrollment sync fails', async () => {
    seedListState();
    spyOn(console, 'error');
    repository.updateEnrollment.and.returnValue(
      throwError(() => new Error('sync failure')),
    );
    await store.loadListPage();
    const formValue = await store.openStudentForEdit(createStudentEntity());

    const result = await store.saveStudentChanges({
      ...formValue,
      lastNameStudent: 'Updated',
    });

    expect(result.success).toBeFalse();
    expect(result.kind).toBe('warning');
    expect(store.error()).toBe(
      "L'eleve a bien ete modifie, mais la preinscription n'a pas pu etre synchronisee.",
    );
  });

  it('should remove students and enrollments from the state after deletion', async () => {
    seedListState();
    await store.loadListPage();

    const result = await store.deleteStudent('1');

    expect(result.success).toBeTrue();
    expect(store.students().length).toBe(0);
    expect(store.enrollments().length).toBe(0);
  });
});
