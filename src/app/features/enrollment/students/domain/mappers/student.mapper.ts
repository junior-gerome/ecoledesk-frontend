import { StudentRecord } from '@app/features/inscriptionstudent/domain/models';
import { Parents } from '@app/features/parent/domain/models';
import { GuardianApi } from '@app/features/parent/domain/models';
import { ParentEntity } from '../models/parent.entity';
import { StudentEntity } from '../models/student.entity';
import { StudentId } from '../models/value-objects/student-id.value-object';

export type ParentApi = Parents;
export type StudentApi = StudentRecord & { guardian?: GuardianApi | null; photoUrl?: string };

export interface BackendStudentApi {
  id?: number;
  lastNameStudent: string;
  firstNameStudent: string;
  dateOfBirth: Date | string | [number, number, number];
  gender?: string | null;
  ecolePrecedente?: string;
  photoUrl?: string;
  guardian: GuardianApi;
}

export class StudentMapper {
  static fromApi(
    student: (Partial<StudentRecord> & { studentNumber?: string | null; guardian?: GuardianApi | null; photoUrl?: string }) | null | undefined,
  ): StudentEntity {
    return {
      id: this.asId(student?.id),
      studentNumber: student?.studentNumber ?? null,
      lastNameStudent: student?.lastNameStudent ?? '',
      firstNameStudent: student?.firstNameStudent ?? '',
      dateOfBirth: this.normalizeDate(student?.dateOfBirth),
      registrationDate: this.normalizeDate(student?.registrationDate),
      gender: student?.gender ?? null,
      ecolePrecedente: student?.ecolePrecedente ?? '',
      photoUrl: student?.photoUrl,
      parent: this.parentFromApi(student?.guardian ?? student?.parent),
    };
  }

  static toApi(student: StudentEntity): StudentApi {
    return {
      id: this.asNumber(student.id) ?? undefined,
      lastNameStudent: student.lastNameStudent,
      firstNameStudent: student.firstNameStudent,
      dateOfBirth: student.dateOfBirth as unknown as Date,
      registrationDate: (student.registrationDate ??
        new Date().toISOString()) as unknown as Date,
      gender: student.gender,
      ecolePrecedente: student.ecolePrecedente,
      parent: this.parentToApi(student.parent),
    };
  }

  static toBackendApi(student: StudentEntity): BackendStudentApi {
    return {
      id: this.asNumber(student.id) ?? undefined,
      lastNameStudent: student.lastNameStudent,
      firstNameStudent: student.firstNameStudent,
      dateOfBirth: student.dateOfBirth as Date | string,
      gender: student.gender == null ? null : String(student.gender),
      ecolePrecedente: student.ecolePrecedente,
      photoUrl: student.photoUrl,
      guardian: this.guardianToApi(student.parent),
    };
  }

  static parentFromApi(parent: (Partial<ParentApi> & Partial<GuardianApi>) | null | undefined): ParentEntity {
    return {
      id: this.asId(parent?.id),
      typeParent: parent?.typeParent ?? null,
      lastNameParent: parent?.lastNameGuardian ?? parent?.lastNameParent ?? '',
      firstNameParent: parent?.firstNameGuardian ?? parent?.firstNameParent ?? '',
      email: parent?.email ?? '',
      address: parent?.address ?? '',
      professionParent: parent?.occupation ?? parent?.professionParent ?? '',
      phoneNumber: parent?.phoneNumber ?? '',
    };
  }

  static parentToApi(parent?: ParentEntity | null): ParentApi {
    return {
      id: this.asNumber(parent?.id) ?? undefined,
      typeParent: parent?.typeParent as Parents['typeParent'],
      lastNameParent: parent?.lastNameParent ?? '',
      firstNameParent: parent?.firstNameParent ?? '',
      email: parent?.email ?? '',
      address: parent?.address ?? '',
      professionParent: parent?.professionParent ?? '',
      phoneNumber: parent?.phoneNumber ?? '',
    };
  }

  static guardianToApi(parent?: ParentEntity | null): GuardianApi {
    return {
      id: this.asNumber(parent?.id) ?? undefined,
      lastNameGuardian: parent?.lastNameParent ?? '',
      firstNameGuardian: parent?.firstNameParent ?? '',
      email: parent?.email ?? '',
      address: parent?.address ?? '',
      occupation: parent?.professionParent ?? '',
      phoneNumber: parent?.phoneNumber ?? '',
    };
  }

  private static asId(value: number | string | null | undefined): string | null {
    const id = StudentId.fromUnknown(value);
    return id ? id.getValue() : null;
  }

  private static asNumber(
    value: number | string | null | undefined,
  ): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private static normalizeDate(value: unknown): string | Date | null {
    if (!value) {
      return null;
    }

    if (Array.isArray(value)) {
      const [year, month, day] = value;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    if (value instanceof Date || typeof value === "string") {
      return value;
    }

    return null;
  }
}
