import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Class } from "@app/features/classes/domain/models";
import { Inscription } from "@app/features/inscriptionstudent/domain/models";
import { Montant } from "@app/features/montant/domain/models";
import { Section } from "@app/features/section/domain/models";
import { StudentId } from "../models/value-objects/student-id.value-object";
import { ClassroomEntity } from "../models/classroom.entity";
import {
  EnrollmentEntity,
  EnrollmentPreRegistrationStatus,
  EnrollmentStatusDecisionEntity,
} from "../models/enrollment.entity";
import { PaymentEntity } from "../models/payment.entity";
import { SchoolYearEntity } from "../models/school-year.entity";
import { SectionEntity } from "../models/section.entity";
import { StudentMapper } from "./student.mapper";

export class EnrollmentMapper {
  static fromApi(
    enrollment:
      | (Partial<Omit<Inscription, "classeRoomId" | "anneeScolaireId">> & {
          studentId?: number | string | null;
          classeRoomId?: number | string | null;
          sectionId?: number | string | null;
          montantId?: number | string | null;
          anneeScolaireId?: number | string | null;
          statutPreinscription?: string | null;
          datePreinscription?: string | Date | null;
        })
      | null
      | undefined,
  ): EnrollmentEntity {
    return {
      id: this.asId(enrollment?.id),
      student: enrollment?.student
        ? StudentMapper.fromApi(enrollment.student)
        : null,
      studentId: this.asId(enrollment?.student?.id ?? enrollment?.studentId),
      classeRoom: this.classroomFromApi(enrollment?.classeRoom),
      classeRoomId: this.asId(enrollment?.classeRoom?.id ?? enrollment?.classeRoomId),
      sectionId: this.asId(enrollment?.classeRoom?.section?.id ?? enrollment?.sectionId),
      montant: this.paymentFromApi(enrollment?.montant),
      montantId: this.asId(enrollment?.montant?.id ?? enrollment?.montantId),
      anneescolaire: this.schoolYearFromApi(enrollment?.anneescolaire),
      anneeScolaireId: this.asId(
        enrollment?.anneescolaire?.id ?? enrollment?.anneeScolaireId,
      ),
      dateInscription: this.normalizeDate(enrollment?.dateInscription),
      statutPreinscription: this.preRegistrationStatusFromApi(
        enrollment?.statutPreinscription,
      ),
      datePreinscription: this.normalizeDate(enrollment?.datePreinscription),
    };
  }

  static statusDecisionFromApi(
    response:
      | {
          id?: number | string | null;
          studentId?: number | string | null;
          status?: string | null;
          reason?: string | null;
          changedBy?: number | string | null;
          changedAt?: string | Date | null;
        }
      | null
      | undefined,
  ): EnrollmentStatusDecisionEntity {
    return {
      id: this.asId(response?.id) ?? "",
      studentId: this.asId(response?.studentId),
      status: this.preRegistrationStatusFromApi(response?.status) ?? "EN_ATTENTE",
      reason: response?.reason ?? null,
      changedBy: this.asId(response?.changedBy),
      changedAt: this.normalizeDate(response?.changedAt),
    };
  }

  static toApi(enrollment: EnrollmentEntity): Inscription {
    return {
      id: this.asNumber(enrollment.id) ?? undefined,
      student: StudentMapper.toApi(
        enrollment.student ?? StudentMapper.fromApi(null),
      ),
      classeRoom: this.classroomToApi(enrollment.classeRoom),
      montant: this.paymentToApi(enrollment.montant),
      anneescolaire: this.schoolYearToApi(enrollment.anneescolaire),
      dateInscription: (enrollment.dateInscription ??
        new Date().toISOString()) as unknown as Date,
      statutPreinscription: enrollment.statutPreinscription ?? "EN_ATTENTE",
      datePreinscription: (enrollment.datePreinscription ??
        new Date().toISOString()) as unknown as Date,
    };
  }

  static sectionFromApi(section: Partial<Section> | null | undefined): SectionEntity {
    return {
      id: this.asId(section?.id),
      libelle: section?.libelle ?? null,
    };
  }

  static classroomFromApi(classroom: Partial<Class> | null | undefined): ClassroomEntity {
    return {
      id: this.asId(classroom?.id),
      nameClasse: classroom?.nameClasse ?? null,
      level: classroom?.level ?? null,
      capacity: classroom?.capacity ?? null,
      section: this.sectionFromApi(classroom?.section),
      anneeScolaire: this.schoolYearFromApi(classroom?.anneeScolaire),
      description: classroom?.description ?? null,
    };
  }

  static paymentFromApi(payment: Partial<Montant> | null | undefined): PaymentEntity {
    return {
      id: this.asId(payment?.id),
      count: payment?.count ?? null,
      classeRoom: this.classroomFromApi(payment?.classeRoom),
      typePaiement: payment?.typePaiement ?? null,
    };
  }

  static schoolYearFromApi(
    schoolYear: Partial<AnneeScolaire> | null | undefined,
  ): SchoolYearEntity {
    return {
      id: this.asId(schoolYear?.id),
      libelleAnneeScolaire: schoolYear?.libelleAnneeScolaire ?? null,
      dateDebut: schoolYear?.dateDebut ?? null,
      dateFin: schoolYear?.dateFin ?? null,
      statutCode: schoolYear?.statutCode ?? null,
    };
  }

  static sectionToApi(section?: SectionEntity | null): Section {
    return {
      id: this.asNumber(section?.id) ?? undefined,
      libelle: section?.libelle ?? "",
    };
  }

  static classroomToApi(classroom?: ClassroomEntity | null): Class {
    return {
      id: this.asNumber(classroom?.id) ?? undefined,
      nameClasse: classroom?.nameClasse ?? "",
      level: classroom?.level ?? "",
      capacity: classroom?.capacity ?? 0,
      section: this.sectionToApi(classroom?.section),
      anneeScolaire: this.schoolYearToApi(classroom?.anneeScolaire),
      description: classroom?.description ?? undefined,
    };
  }

  static paymentToApi(payment?: PaymentEntity | null): Montant {
    return {
      id: this.asNumber(payment?.id) ?? undefined,
      count: payment?.count ?? 0,
      classeRoom: this.classroomToApi(payment?.classeRoom),
      typePaiement: payment?.typePaiement ?? "",
    };
  }

  static schoolYearToApi(schoolYear?: SchoolYearEntity | null): AnneeScolaire {
    return {
      id: this.asNumber(schoolYear?.id) ?? undefined,
      libelleAnneeScolaire: schoolYear?.libelleAnneeScolaire ?? "",
      dateDebut: schoolYear?.dateDebut ?? "",
      dateFin: schoolYear?.dateFin ?? "",
      statutCode: schoolYear?.statutCode ?? false,
    };
  }

  private static asId(value: number | string | null | undefined): string | null {
    const id = StudentId.fromUnknown(value);
    return id ? id.getValue() : null;
  }

  private static asNumber(
    value: number | string | null | undefined,
  ): number | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private static preRegistrationStatusFromApi(
    status: string | null | undefined,
  ): EnrollmentPreRegistrationStatus | null {
    if (status === "REJETEE") {
      return "REFUSEE";
    }

    return status === "BROUILLON" ||
      status === "EN_ATTENTE" ||
      status === "VALIDEE" ||
      status === "REFUSEE" ||
      status === "ANNULEE" ||
      status === "INSCRITE"
      ? status
      : null;
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
