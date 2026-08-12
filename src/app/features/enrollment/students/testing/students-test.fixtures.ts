import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Class } from "@app/features/classes/domain/models";
import { Inscription } from "@app/features/inscriptionstudent/domain/models";
import { Montant } from "@app/features/montant/domain/models";
import { Parents } from "@app/features/parent/domain/models";
import { Section } from "@app/features/section/domain/models";
import { Gender } from "@app/enums/gender";
import { TypePaiement } from "@app/enums/typePaiement.enum";
import { TypeParent } from "@app/features/parent/domain/enums/typeParent.enum";
import { StudentApi } from "../domain/mappers/student.mapper";
import { ClassroomEntity } from "../domain/models/classroom.entity";
import { EnrollmentFormValue } from "../domain/models/enrollment-form-value.model";
import { EnrollmentEntity } from "../domain/models/enrollment.entity";
import { ParentEntity } from "../domain/models/parent.entity";
import { PaymentEntity } from "../domain/models/payment.entity";
import { SchoolYearEntity } from "../domain/models/school-year.entity";
import { SectionEntity } from "../domain/models/section.entity";
import { StudentEntity } from "../domain/models/student.entity";

type ApiEnrollment = Omit<Inscription, "classeRoomId" | "anneeScolaireId"> & {
  studentId?: number | string | null;
  classeRoomId?: number | string | null;
  sectionId?: number | string | null;
  montantId?: number | string | null;
  anneeScolaireId?: number | string | null;
};

export function createParentEntity(
  overrides: Partial<ParentEntity> = {},
): ParentEntity {
  return {
    id: "7",
    typeParent: TypeParent.MERE,
    lastNameParent: "Doe",
    firstNameParent: "Maria",
    email: "maria@example.com",
    address: "Douala",
    professionParent: "Commercante",
    phoneNumber: "670000000",
    ...overrides,
  };
}

export function createStudentEntity(
  overrides: Partial<StudentEntity> = {},
): StudentEntity {
  return {
    id: "1",
    lastNameStudent: "Doe",
    firstNameStudent: "Jane",
    dateOfBirth: "2015-06-01",
    registrationDate: "2026-09-01T00:00:00.000Z",
    gender: Gender.FEMININ,
    ecolePrecedente: "Groupe scolaire A",
    parent: createParentEntity(),
    ...overrides,
  };
}

export function createSectionEntity(
  overrides: Partial<SectionEntity> = {},
): SectionEntity {
  return {
    id: "2",
    libelle: "Francophone",
    ...overrides,
  };
}

export function createSchoolYearEntity(
  overrides: Partial<SchoolYearEntity> = {},
): SchoolYearEntity {
  return {
    id: "3",
    libelleAnneeScolaire: "2026-2027",
    dateDebut: "2026-09-01",
    dateFin: "2027-06-30",
    statutCode: true,
    ...overrides,
  };
}

export function createClassroomEntity(
  overrides: Partial<ClassroomEntity> = {},
): ClassroomEntity {
  return {
    id: "5",
    nameClasse: "CM1",
    level: "PRIMARY",
    capacity: 30,
    section: createSectionEntity(),
    anneeScolaire: createSchoolYearEntity(),
    description: "Classe principale",
    ...overrides,
  };
}

export function createPaymentEntity(
  overrides: Partial<PaymentEntity> = {},
): PaymentEntity {
  return {
    id: "8",
    count: 15000,
    classeRoom: createClassroomEntity(),
    typePaiement: TypePaiement.FRAIS_PREINSCRIPTION,
    ...overrides,
  };
}

export function createEnrollmentEntity(
  overrides: Partial<EnrollmentEntity> = {},
): EnrollmentEntity {
  return {
    id: "10",
    student: createStudentEntity(),
    studentId: "1",
    classeRoom: createClassroomEntity(),
    classeRoomId: "5",
    sectionId: "2",
    montant: createPaymentEntity(),
    montantId: "8",
    anneescolaire: createSchoolYearEntity(),
    anneeScolaireId: "3",
    dateInscription: "2026-09-10T08:00:00.000Z",
    ...overrides,
  };
}

export function createEnrollmentFormValue(
  overrides: Partial<EnrollmentFormValue> = {},
): EnrollmentFormValue {
  return {
    studentId: "1",
    parentId: "7",
    lastNameStudent: "Doe",
    firstNameStudent: "Jane",
    dateOfBirth: "2015-06-01",
    gender: Gender.FEMININ,
    ecolePrecedente: "Groupe scolaire A",
    sectionId: "2",
    classId: "5",
    montantId: "8",
    TypeParent: TypeParent.MERE,
    lastNameParent: "Doe",
    firstNameParent: "Maria",
    professionParent: "Commercante",
    address: "Douala",
    phoneNumber: "670000000",
    email: "maria@example.com",
    ...overrides,
  };
}

export function createApiParent(overrides: Partial<Parents> = {}): Parents {
  return {
    id: 7,
    typeParent: TypeParent.MERE,
    lastNameParent: "Doe",
    firstNameParent: "Maria",
    email: "maria@example.com",
    address: "Douala",
    professionParent: "Commercante",
    phoneNumber: "670000000",
    ...overrides,
  };
}

export function createApiStudent(overrides: Partial<StudentApi> = {}): StudentApi {
  return {
    id: 1,
    lastNameStudent: "Doe",
    firstNameStudent: "Jane",
    dateOfBirth: "2015-06-01" as unknown as Date,
    registrationDate: "2026-09-01T00:00:00.000Z" as unknown as Date,
    gender: Gender.FEMININ,
    ecolePrecedente: "Groupe scolaire A",
    parent: createApiParent(),
    ...overrides,
  };
}

export function createApiSection(overrides: Partial<Section> = {}): Section {
  return {
    id: 2,
    libelle: "Francophone",
    ...overrides,
  };
}

export function createApiSchoolYear(
  overrides: Partial<AnneeScolaire> = {},
): AnneeScolaire {
  return {
    id: 3,
    libelleAnneeScolaire: "2026-2027",
    dateDebut: "2026-09-01",
    dateFin: "2027-06-30",
    statutCode: true,
    ...overrides,
  };
}

export function createApiClass(overrides: Partial<Class> = {}): Class {
  return {
    id: 5,
    nameClasse: "CM1",
    level: "PRIMARY",
    capacity: 30,
    section: createApiSection(),
    anneeScolaire: createApiSchoolYear(),
    description: "Classe principale",
    ...overrides,
  };
}

export function createApiPayment(overrides: Partial<Montant> = {}): Montant {
  return {
    id: 8,
    count: 15000,
    classeRoom: createApiClass(),
    typePaiement: TypePaiement.FRAIS_PREINSCRIPTION,
    ...overrides,
  };
}

export function createApiEnrollment(
  overrides: Partial<ApiEnrollment> = {},
): ApiEnrollment {
  return {
    id: 10,
    student: createApiStudent(),
    studentId: 1,
    classeRoom: createApiClass(),
    classeRoomId: 5,
    sectionId: 2,
    montant: createApiPayment(),
    montantId: 8,
    anneescolaire: createApiSchoolYear(),
    anneeScolaireId: 3,
    dateInscription: "2026-09-10T08:00:00.000Z" as unknown as Date,
    ...overrides,
  };
}
