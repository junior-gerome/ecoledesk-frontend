import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ClassroomEntity } from '../models/classroom.entity';
import {
  EnrollmentEntity,
  EnrollmentStatusDecisionEntity,
} from '../models/enrollment.entity';
import { PaymentEntity } from '../models/payment.entity';
import { SchoolYearEntity } from '../models/school-year.entity';
import { SectionEntity } from '../models/section.entity';
import { StudentEntity } from '../models/student.entity';

export interface EnrollmentRepository {
  getStudents(): Observable<StudentEntity[]>;
  getStudent(studentId: string): Observable<StudentEntity>;
  getEnrollments(): Observable<EnrollmentEntity[]>;
  getSections(): Observable<SectionEntity[]>;
  getAllClasses(): Observable<ClassroomEntity[]>;
  getClassesBySection(sectionId: string, academicYearId?: string | null): Observable<ClassroomEntity[]>;
  getActiveSchoolYear(): Observable<SchoolYearEntity | null>;
  getRegistrationPayment(classId: string): Observable<PaymentEntity | null>;
  createEnrollment(enrollment: EnrollmentEntity): Observable<EnrollmentEntity>;
  updateEnrollment(
    enrollmentId: string,
    enrollment: EnrollmentEntity,
  ): Observable<EnrollmentEntity>;
  validatePreinscription(
    enrollmentId: string,
  ): Observable<EnrollmentStatusDecisionEntity>;
  rejectPreinscription(
    enrollmentId: string,
    justification: string,
  ): Observable<EnrollmentStatusDecisionEntity>;
  cancelPreinscription(
    enrollmentId: string,
    justification: string,
  ): Observable<EnrollmentStatusDecisionEntity>;
  updateStudent(studentId: string, student: StudentEntity): Observable<StudentEntity>;
  deleteStudent(studentId: string): Observable<void>;
}

export const ENROLLMENT_REPOSITORY = new InjectionToken<EnrollmentRepository>(
  'ENROLLMENT_REPOSITORY',
);
