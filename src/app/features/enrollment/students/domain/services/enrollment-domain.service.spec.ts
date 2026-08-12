import { EnrollmentDomainService } from './enrollment-domain.service';
import {
  createEnrollmentEntity,
  createEnrollmentFormValue,
  createPaymentEntity,
  createSchoolYearEntity,
  createStudentEntity,
} from '../../testing/students-test.fixtures';

describe('EnrollmentDomainService', () => {
  let service: EnrollmentDomainService;

  beforeEach(() => {
    service = new EnrollmentDomainService();
  });

  it('should resolve the first valid positive id', () => {
    expect(service.resolveId(null, '', 0, 'NaN', '7', 9)).toBe('7');
  });

  it('should keep only the latest enrollment for the active school year', () => {
    const older = createEnrollmentEntity({ id: '10', dateInscription: '2026-09-10T08:00:00.000Z' });
    const newer = createEnrollmentEntity({ id: '11', dateInscription: '2026-09-11T08:00:00.000Z' });
    const otherYear = createEnrollmentEntity({
      id: '12',
      anneeScolaireId: '4',
      anneescolaire: createSchoolYearEntity({ id: '4', libelleAnneeScolaire: '2025-2026' }),
    });

    const index = service.buildLatestEnrollmentIndex([older, newer, otherYear], '3');

    expect(index.size).toBe(1);
    expect(index.get('1')?.id).toBe('11');
  });

  it('should build student class labels with fallback to Non inscrit', () => {
    const students = [
      createStudentEntity({ id: '1' }),
      createStudentEntity({ id: '2', lastNameStudent: 'Smith' }),
    ];
    const latestIndex = service.buildLatestEnrollmentIndex([createEnrollmentEntity()], '3');

    const result = service.buildStudentClasses(students, latestIndex, { '5': 'CM1' });

    expect(result['1']).toBe('CM1');
    expect(result['2']).toBe('Non inscrit');
  });

  it('should flatten student and enrollment data into a form value', () => {
    const formValue = service.buildFormValue(createStudentEntity(), createEnrollmentEntity());

    expect(formValue.lastNameStudent).toBe('Doe');
    expect(formValue.lastNameParent).toBe('Doe');
    expect(formValue.classId).toBe('5');
    expect(formValue.sectionId).toBe('2');
    expect(formValue.montantId).toBe('8');
  });

  it('should build a trimmed student entity and keep the existing registration date', () => {
    const entity = service.buildStudentEntity(
      createEnrollmentFormValue({
        lastNameStudent: '  Doe  ',
        firstNameStudent: '  Jane  ',
        lastNameParent: '  Doe  ',
        firstNameParent: '  Maria  ',
      }),
      createStudentEntity({ registrationDate: '2026-09-01T00:00:00.000Z' }),
    );

    expect(entity.lastNameStudent).toBe('Doe');
    expect(entity.firstNameStudent).toBe('Jane');
    expect(entity.parent?.lastNameParent).toBe('Doe');
    expect(entity.registrationDate).toBe('2026-09-01T00:00:00.000Z');
  });

  it('should build an enrollment entity with merged ids and selected payment', () => {
    const enrollment = service.buildEnrollmentEntity({
      formValue: createEnrollmentFormValue({ classId: '5', sectionId: '2', montantId: null }),
      student: createStudentEntity(),
      currentEnrollment: createEnrollmentEntity({ id: '10', montantId: '8' }),
      activeSchoolYear: createSchoolYearEntity(),
      payment: createPaymentEntity({ id: '15', count: 22000 }),
    });

    expect(enrollment.id).toBe('10');
    expect(enrollment.classeRoomId).toBe('5');
    expect(enrollment.sectionId).toBe('2');
    expect(enrollment.montantId).toBe('15');
    expect(enrollment.anneeScolaireId).toBe('3');
  });
});
