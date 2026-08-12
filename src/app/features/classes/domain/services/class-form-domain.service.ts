import { Injectable } from '@angular/core';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { Class } from '@app/features/classes/domain/models';
import { Section } from '@app/features/section/domain/models';
import { Teacher } from '@app/features/teachers/domain/models';

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
      sectionId: classroom.section?.id ?? null,
      anneeScolaireId: classroom.anneeScolaire?.id ?? null,
    };
  }

  buildClassPayload(params: {
    classId: number | null;
    isEditMode: boolean;
    formValue: ClassFormValue;
  }): Class {
    const formValue = params.formValue;
    const sectionId = this.toPositiveNumber(formValue.sectionId);
    const teacherId = this.toPositiveNumber(formValue.teacherId);
    const academicYearId = this.toPositiveNumber(formValue.anneeScolaireId);

    return {
      id: params.isEditMode ? params.classId ?? undefined : undefined,
      nameClasse: String(formValue.nameClasse ?? '').trim(),
      level: String(formValue.level ?? '').trim(),
      capacity: this.toPositiveNumber(formValue.capacity),
      description: String(formValue.description ?? '').trim(),
      section: { id: sectionId } as Section,
      teacher: teacherId ? ({ id: teacherId } as Teacher) : undefined,
      anneeScolaire: { id: academicYearId } as AnneeScolaire,
    };
  }

  createSaveErrorMessage(status: number | undefined): string {
    if (status === 409) {
      return 'Une classe avec ce code existe deja.';
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
