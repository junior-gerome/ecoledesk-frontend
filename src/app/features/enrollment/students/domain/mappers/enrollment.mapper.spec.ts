import { EnrollmentMapper } from './enrollment.mapper';
import {
  createApiEnrollment,
  createEnrollmentEntity,
} from '../../testing/students-test.fixtures';

describe('EnrollmentMapper', () => {
  it('should map API enrollments to domain entities', () => {
    const mapped = EnrollmentMapper.fromApi(
      createApiEnrollment({
        studentId: '1',
        classeRoomId: '5',
        sectionId: '2',
        montantId: '8',
        anneeScolaireId: '3',
        dateInscription: [2026, 9, 1] as unknown as Date,
      }),
    );

    expect(mapped.studentId).toBe('1');
    expect(mapped.classeRoomId).toBe('5');
    expect(mapped.sectionId).toBe('2');
    expect(mapped.montantId).toBe('8');
    expect(mapped.anneeScolaireId).toBe('3');
    expect(mapped.dateInscription instanceof Date).toBeTrue();
  });

  it('should map domain enrollments back to API payloads', () => {
    const payload = EnrollmentMapper.toApi(createEnrollmentEntity());

    expect(payload.student?.lastNameStudent).toBe('Doe');
    expect(payload.classeRoom?.nameClasse).toBe('CM1');
    expect(payload.montant?.count).toBe(15000);
    expect(payload.anneescolaire?.libelleAcademicYear).toBe('2026-2027');
  });
});
