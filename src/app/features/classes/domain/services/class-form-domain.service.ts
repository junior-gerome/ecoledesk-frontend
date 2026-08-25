import { Injectable } from '@angular/core';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { Class } from '@app/features/classes/domain/models';
import { Section } from '@app/features/section/domain/models';
import { StaffMemberBasic } from '@app/features/staff/domain/models/staff.model';

export interface ClassFormValue {
  nameClasse: string | null;
  level: string | null;
  capacity: number | string | null;
  sectionId: number | string | null;
  teacherId: number | string | null;
  anneeScolaireId: number | string | null;
  description: string | null;
}

@Injectable()
export class ClassFormDomainService {
  toFormValue(classroom: Class): ClassFormValue {
    return {
      nameClasse: classroom.nameClasse ?? '',
      level: classroom.level ?? '',
      capacity: classroom.capacity ?? null,
      description: classroom.description ?? '',
      teacherId: classroom.teacher?.id ?? null,
      sectionId: classroom.section?.libelle ?? classroom.section?.id ?? null,
      anneeScolaireId: classroom.academicYear?.id ?? null,
    };
  }

  buildClassPayload(params: {
    classId: number | null;
    isEditMode: boolean;
    formValue: ClassFormValue;
    sections?: Section[];
    teachers?: StaffMemberBasic[];
    activeAcademicYear?: AnneeScolaire | null;
  }): Class {
    const formValue = params.formValue;
    const sectionValue = formValue.sectionId ? String(formValue.sectionId).trim() : '';
    const teacherId = this.toPositiveNumber(formValue.teacherId);
    const academicYearId = this.toPositiveNumber(formValue.anneeScolaireId);

    const selectedSection = params.sections?.find(
      (s) =>
        (s.libelle && s.libelle.trim() === sectionValue) ||
        (s.id != null && String(s.id) === sectionValue)
    );
    const selectedTeacher = params.teachers?.find((t) => Number(t.id) === teacherId);

    return {
      id: params.isEditMode ? params.classId ?? undefined : undefined,
      nameClasse: String(formValue.nameClasse ?? '').trim(),
      level: String(formValue.level ?? '').trim(),
      capacity: this.toPositiveNumber(formValue.capacity),
      description: String(formValue.description ?? '').trim(),
      section: selectedSection
        ? ({ id: selectedSection.id, libelle: selectedSection.libelle, description: selectedSection.description } as Section)
        : sectionValue
          ? ({ libelle: sectionValue } as Section)
          : (undefined as unknown as Section),
      teacher: selectedTeacher
        ? ({
            id: selectedTeacher.id,
            employeeNumber: selectedTeacher.employeeNumber,
            firstName: selectedTeacher.firstName,
            lastName: selectedTeacher.lastName,
          } as StaffMemberBasic)
        : teacherId > 0
          ? ({ id: teacherId } as StaffMemberBasic)
          : undefined,
      academicYear: params.activeAcademicYear
        ? ({
            id: params.activeAcademicYear.id,
            libelleAcademicYear: params.activeAcademicYear.libelleAcademicYear,
            statutCode: params.activeAcademicYear.statutCode,
          } as AnneeScolaire)
        : academicYearId > 0
          ? ({ id: academicYearId } as AnneeScolaire)
          : (undefined as unknown as AnneeScolaire),
    };
  }

  createSaveErrorMessage(
    status: number | undefined,
    responseMessage?: unknown,
  ): string {
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    if (
      responseMessage &&
      typeof responseMessage === 'object' &&
      'message' in (responseMessage as Record<string, unknown>)
    ) {
      const msg = (responseMessage as Record<string, unknown>)['message'];
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
    }

    if (status === 409) {
      return 'Une classe portant ce nom existe déjà dans cette section et cette année scolaire.';
    }

    if (status === 400) {
      return 'Données de la classe invalides. Veuillez vérifier les champs saisis.';
    }

    return "Erreur lors de l'enregistrement de la classe.";
  }

  private toPositiveNumber(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 0;
    }

    return parsed;
  }
}
