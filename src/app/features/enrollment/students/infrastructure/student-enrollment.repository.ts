import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { Class } from '@app/features/classes/domain/models';
import { Inscription } from '@app/features/inscriptionstudent/domain/models';
import { Montant } from '@app/features/montant/domain/models';
import { Section } from '@app/features/section/domain/models';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { EnrollmentMapper } from '../domain/mappers/enrollment.mapper';
import { BackendStudentApi, StudentApi, StudentMapper } from '../domain/mappers/student.mapper';
import { ClassroomEntity } from '../domain/models/classroom.entity';
import {
  EnrollmentEntity,
  EnrollmentStatusDecisionEntity,
} from '../domain/models/enrollment.entity';
import { PaymentEntity } from '../domain/models/payment.entity';
import { SchoolYearEntity } from '../domain/models/school-year.entity';
import { SectionEntity } from '../domain/models/section.entity';
import { StudentEntity } from '../domain/models/student.entity';
import { EnrollmentRepository } from '../domain/repositories/enrollment.repository';

interface EnrollmentPayload {
  student: Omit<StudentApi, 'registrationDate'>;
  dateInscription: Inscription['dateInscription'];
  statutPreinscription?: Inscription['statutPreinscription'];
  datePreinscription?: Inscription['datePreinscription'];
  studentId?: number;
  classeRoomId?: number;
  sectionId?: number;
  montantId?: number;
  anneeScolaireId?: number;
}

interface PreinscriptionStatusResponse {
  id?: number | string | null;
  studentId?: number | string | null;
  status?: string | null;
  reason?: string | null;
  changedBy?: number | string | null;
  changedAt?: string | Date | null;
}

@Injectable()
export class StudentEnrollmentRepository implements EnrollmentRepository {
  private readonly http = inject(HttpClient);

  getStudents(): Observable<StudentEntity[]> {
    return this.http
      .get<StudentApi[]>(`${environment.apiUrl}/students`)
      .pipe(map((students) => (students ?? []).map((student) => StudentMapper.fromApi(student))));
  }

  getStudent(studentId: string): Observable<StudentEntity> {
    return this.http
      .get<StudentApi>(`${environment.apiUrl}/students/${studentId}`)
      .pipe(map((student) => StudentMapper.fromApi(student)));
  }

  getEnrollments(): Observable<EnrollmentEntity[]> {
    return this.http
      .get<Inscription[]>(`${environment.apiUrl}/preinscription`)
      .pipe(map((enrollments) => (enrollments ?? []).map((enrollment) => EnrollmentMapper.fromApi(enrollment))));
  }

  getSections(): Observable<SectionEntity[]> {
    return this.http
      .get<Section[]>(`${environment.apiUrl}/section`)
      .pipe(map((sections) => (sections ?? []).map((section) => EnrollmentMapper.sectionFromApi(section))));
  }

  getAllClasses(): Observable<ClassroomEntity[]> {
    return this.http
      .get<Class[]>(`${environment.apiUrl}/classes`)
      .pipe(map((classes) => (classes ?? []).map((classroom) => EnrollmentMapper.classroomFromApi(classroom))));
  }

  getClassesBySection(sectionId: string): Observable<ClassroomEntity[]> {
    return this.http
      .get<Class[]>(`${environment.apiUrl}/classes/by-section/${sectionId}`)
      .pipe(map((classes) => (classes ?? []).map((classroom) => EnrollmentMapper.classroomFromApi(classroom))));
  }

  getActiveSchoolYear(): Observable<SchoolYearEntity | null> {
    return this.http
      .get<AnneeScolaire>(`${environment.apiUrl}/annees-scolaires/active`)
      .pipe(
        map((schoolYear) => EnrollmentMapper.schoolYearFromApi(schoolYear)),
        catchError(() => of(null)),
      );
  }

  getRegistrationPayment(classId: string): Observable<PaymentEntity | null> {
    return this.http
      .get<Montant>(`${environment.apiUrl}/montant/preinscription/class/${classId}`)
      .pipe(
        map((payment) => EnrollmentMapper.paymentFromApi(payment)),
        catchError(() => of(null)),
      );
  }

  createEnrollment(enrollment: EnrollmentEntity): Observable<EnrollmentEntity> {
    return this.http
      .post<Inscription>(
        `${environment.apiUrl}/preinscription`,
        this.toEnrollmentPayload(enrollment),
      )
      .pipe(map((created) => EnrollmentMapper.fromApi(created)));
  }

  updateEnrollment(
    enrollmentId: string,
    enrollment: EnrollmentEntity,
  ): Observable<EnrollmentEntity> {
    return this.http
      .put<Inscription>(
        `${environment.apiUrl}/preinscription/${enrollmentId}`,
        this.toEnrollmentPayload(enrollment),
      )
      .pipe(map((updated) => EnrollmentMapper.fromApi(updated)));
  }

  validatePreinscription(
    enrollmentId: string,
  ): Observable<EnrollmentStatusDecisionEntity> {
    return this.http
      .post<PreinscriptionStatusResponse>(
        `${environment.apiUrl}/preinscription/${enrollmentId}/validate`,
        null,
      )
      .pipe(map((response) => EnrollmentMapper.statusDecisionFromApi(response)));
  }

  rejectPreinscription(
    enrollmentId: string,
    justification: string,
  ): Observable<EnrollmentStatusDecisionEntity> {
    return this.submitPreinscriptionDecision(
      enrollmentId,
      'reject',
      justification,
    );
  }

  cancelPreinscription(
    enrollmentId: string,
    justification: string,
  ): Observable<EnrollmentStatusDecisionEntity> {
    return this.submitPreinscriptionDecision(
      enrollmentId,
      'cancel',
      justification,
    );
  }

  updateStudent(studentId: string, student: StudentEntity): Observable<StudentEntity> {
    return this.http
      .put<BackendStudentApi>(`${environment.apiUrl}/students/${studentId}`, StudentMapper.toBackendApi(student))
      .pipe(map((updated) => StudentMapper.fromApi(updated)));
  }

  deleteStudent(studentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/students/${studentId}`);
  }

  private submitPreinscriptionDecision(
    enrollmentId: string,
    action: 'reject' | 'cancel',
    justification: string,
  ): Observable<EnrollmentStatusDecisionEntity> {
    return this.http
      .post<PreinscriptionStatusResponse>(
        `${environment.apiUrl}/preinscription/${enrollmentId}/${action}`,
        { justification },
      )
      .pipe(map((response) => EnrollmentMapper.statusDecisionFromApi(response)));
  }

  private toEnrollmentPayload(enrollment: EnrollmentEntity): EnrollmentPayload {
    const mapped = EnrollmentMapper.toApi(enrollment);
    const { registrationDate: _registrationDate, ...student } = mapped.student;
    const payload: EnrollmentPayload = {
      student,
      dateInscription: mapped.dateInscription,
      statutPreinscription: mapped.statutPreinscription,
      datePreinscription: mapped.datePreinscription,
    };

    const studentId = this.toApiId(enrollment.studentId);
    if (studentId) {
      payload.studentId = studentId;
    }

    const classId = this.toApiId(enrollment.classeRoomId);
    if (classId) {
      payload.classeRoomId = classId;
    }

    const sectionId = this.toApiId(enrollment.sectionId);
    if (sectionId) {
      payload.sectionId = sectionId;
    }

    const montantId = this.toApiId(enrollment.montantId);
    if (montantId) {
      payload.montantId = montantId;
    }

    const schoolYearId = this.toApiId(enrollment.anneeScolaireId);
    if (schoolYearId) {
      payload.anneeScolaireId = schoolYearId;
    }

    return payload;
  }

  private toApiId(id: string | null | undefined): number | null {
    if (!id) {
      return null;
    }

    const parsed = Number(id);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  }
}
