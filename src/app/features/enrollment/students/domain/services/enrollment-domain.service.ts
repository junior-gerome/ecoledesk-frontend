import { Injectable } from '@angular/core';
import { ClassroomEntity } from '../models/classroom.entity';
import { EnrollmentFormValue } from '../models/enrollment-form-value.model';
import { EnrollmentEntity } from '../models/enrollment.entity';
import { ParentEntity } from '../models/parent.entity';
import { PaymentEntity } from '../models/payment.entity';
import { SchoolYearEntity } from '../models/school-year.entity';
import { StudentEntity } from '../models/student.entity';
import { ApiDateValue } from '../models/value-objects/api-date-value.type';
import { StudentId } from '../models/value-objects/student-id.value-object';

@Injectable()
export class EnrollmentDomainService {
  resolveId(...values: Array<number | string | null | undefined>): string | undefined {
    for (const value of values) {
      const id = StudentId.fromUnknown(value);
      if (!id) {
        continue;
      }

      const normalized = id.getValue();
      const parsed = Number(normalized);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        continue;
      }

      return normalized;
    }

    return undefined;
  }

  parseDate(value: ApiDateValue): Date {
    if (!value) {
      return new Date(0);
    }

    if (value instanceof Date) {
      return value;
    }

    return new Date(value);
  }

  formatDateForInput(value: ApiDateValue): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return typeof value === 'string' ? (value.split('T')[0] ?? '') : '';
  }

  buildClassNameMap(classes: ClassroomEntity[]): Record<string, string> {
    return classes.reduce<Record<string, string>>((accumulator, current) => {
      const id = this.resolveId(current.id);
      if (!id) {
        return accumulator;
      }

      accumulator[id] = current.nameClasse ?? `Classe ${id}`;
      return accumulator;
    }, {});
  }

  buildLatestEnrollmentIndex(
    enrollments: EnrollmentEntity[],
    activeSchoolYearId?: string | null,
  ): Map<string, EnrollmentEntity> {
    const index = new Map<string, EnrollmentEntity>();

    for (const enrollment of enrollments) {
      const schoolYearId = this.resolveId(
        enrollment.anneescolaire?.id,
        enrollment.anneeScolaireId,
      );

      if (activeSchoolYearId && schoolYearId && schoolYearId !== activeSchoolYearId) {
        continue;
      }

      const studentId = this.resolveId(enrollment.student?.id, enrollment.studentId);
      if (!studentId) {
        continue;
      }

      const current = index.get(studentId);
      if (!current) {
        index.set(studentId, enrollment);
        continue;
      }

      const currentDate = this.parseDate(current.dateInscription).getTime();
      const incomingDate = this.parseDate(enrollment.dateInscription).getTime();

      if (incomingDate >= currentDate) {
        index.set(studentId, enrollment);
      }
    }

    return index;
  }

  buildStudentClasses(
    students: StudentEntity[],
    latestEnrollmentIndex: Map<string, EnrollmentEntity>,
    classNameMap: Record<string, string>,
  ): Record<string, string> {
    return students.reduce<Record<string, string>>((accumulator, student) => {
      const studentId = this.resolveId(student.id);
      if (!studentId) {
        return accumulator;
      }

      const enrollment = latestEnrollmentIndex.get(studentId);
      if (!enrollment) {
        accumulator[studentId] = 'Non inscrit';
        return accumulator;
      }

      const classId = this.resolveId(
        enrollment.classeRoom?.id,
        enrollment.classeRoomId,
      );

      accumulator[studentId] =
        enrollment.classeRoom?.nameClasse ??
        (classId ? classNameMap[classId] : undefined) ??
        'Classe inconnue';

      return accumulator;
    }, {});
  }

  buildFormValue(
    student?: StudentEntity | null,
    enrollment?: EnrollmentEntity | null,
  ): EnrollmentFormValue {
    const parent = student?.parent ?? this.emptyParent();

    return {
      studentId: this.resolveId(student?.id) ?? null,
      parentId: this.resolveId(parent.id) ?? null,
      lastNameStudent: student?.lastNameStudent ?? '',
      firstNameStudent: student?.firstNameStudent ?? '',
      dateOfBirth: this.formatDateForInput(student?.dateOfBirth),
      gender: student?.gender ?? null,
      ecolePrecedente: student?.ecolePrecedente ?? '',
      sectionId:
        this.resolveId(enrollment?.classeRoom?.section?.id, enrollment?.sectionId) ??
        null,
      classId:
        this.resolveId(enrollment?.classeRoom?.id, enrollment?.classeRoomId) ?? null,
      montantId:
        this.resolveId(enrollment?.montant?.id, enrollment?.montantId) ?? null,
      TypeParent: parent.typeParent ?? null,
      lastNameParent: parent.lastNameParent ?? '',
      firstNameParent: parent.firstNameParent ?? '',
      professionParent: parent.professionParent ?? '',
      address: parent.address ?? '',
      phoneNumber: parent.phoneNumber ?? '',
      email: parent.email ?? '',
    };
  }

  buildStudentEntity(
    formValue: EnrollmentFormValue,
    existingStudent?: StudentEntity | null,
  ): StudentEntity {
    return {
      id: this.resolveId(formValue.studentId, existingStudent?.id) ?? null,
      lastNameStudent: formValue.lastNameStudent.trim(),
      firstNameStudent: formValue.firstNameStudent.trim(),
      dateOfBirth: formValue.dateOfBirth,
      registrationDate:
        existingStudent?.registrationDate ?? new Date().toISOString(),
      gender: formValue.gender,
      ecolePrecedente: formValue.ecolePrecedente.trim(),
      parent: this.buildParentEntity(formValue, existingStudent?.parent),
    };
  }

  buildParentEntity(
    formValue: EnrollmentFormValue,
    existingParent?: ParentEntity | null,
  ): ParentEntity {
    return {
      id: this.resolveId(formValue.parentId, existingParent?.id) ?? null,
      typeParent: formValue.TypeParent ?? existingParent?.typeParent ?? null,
      lastNameParent: formValue.lastNameParent.trim(),
      firstNameParent: formValue.firstNameParent.trim(),
      professionParent: formValue.professionParent.trim(),
      address: formValue.address.trim(),
      phoneNumber: formValue.phoneNumber.trim(),
      email: formValue.email.trim(),
    };
  }

  buildEnrollmentEntity(params: {
    formValue: EnrollmentFormValue;
    student: StudentEntity;
    currentEnrollment?: EnrollmentEntity | null;
    activeSchoolYear?: SchoolYearEntity | null;
    payment?: PaymentEntity | null;
  }): EnrollmentEntity {
    const { formValue, student, currentEnrollment, activeSchoolYear, payment } =
      params;
    const classId = this.resolveId(
      formValue.classId,
      currentEnrollment?.classeRoom?.id,
      currentEnrollment?.classeRoomId,
    );
    const sectionId = this.resolveId(
      formValue.sectionId,
      currentEnrollment?.classeRoom?.section?.id,
      currentEnrollment?.sectionId,
    );
    const paymentId = this.resolveId(
      payment?.id,
      formValue.montantId,
      currentEnrollment?.montant?.id,
      currentEnrollment?.montantId,
    );
    const schoolYearId = this.resolveId(
      activeSchoolYear?.id,
      currentEnrollment?.anneescolaire?.id,
      currentEnrollment?.anneeScolaireId,
    );

    return {
      id: this.resolveId(currentEnrollment?.id) ?? null,
      student,
      studentId: this.resolveId(student.id) ?? null,
      classeRoom: currentEnrollment?.classeRoom ?? null,
      classeRoomId: classId ?? null,
      sectionId: sectionId ?? null,
      montant: payment ?? currentEnrollment?.montant ?? null,
      montantId: paymentId ?? null,
      anneescolaire:
        activeSchoolYear ?? currentEnrollment?.anneescolaire ?? null,
      anneeScolaireId: schoolYearId ?? null,
      dateInscription:
        currentEnrollment?.dateInscription ?? new Date().toISOString(),
      statutPreinscription:
        currentEnrollment?.statutPreinscription ?? 'EN_ATTENTE',
      datePreinscription:
        currentEnrollment?.datePreinscription ?? new Date().toISOString(),
    };
  }

  private emptyParent(): ParentEntity {
    return {
      id: null,
      typeParent: null,
      lastNameParent: '',
      firstNameParent: '',
      professionParent: '',
      address: '',
      phoneNumber: '',
      email: '',
    };
  }
}
