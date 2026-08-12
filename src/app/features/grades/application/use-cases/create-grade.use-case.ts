/**
 * CreateGradeUseCase
 * Cree une nouvelle note
 */
import { Injectable, inject } from "@angular/core";
import { CreateGradeRequest } from "@app/features/grades/domain/models";
import { GradeResponse } from "@app/features/grades/domain/models";
import { Observable, throwError } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import {
  GRADE_MANAGEMENT_REPOSITORY,
  GradeManagementRepository,
} from "../../domain/repositories/grade-management.repository";
import { GradeValidationService } from "../../domain/services";

interface CreateGradeCommand {
  studentId: number;
  subjectId: number;
  classId: number;
  score: number;
  coefficient: number;
  period: string;
  assessmentDate: string;
  comments?: string;
}

interface GradeSequenceRef {
  id?: number;
  libelleSequence: string;
  trimestre?: { id?: number };
}

@Injectable()
export class CreateGradeUseCase {
  private readonly repository = inject<GradeManagementRepository>(
    GRADE_MANAGEMENT_REPOSITORY,
  );
  private readonly validationService = inject<GradeValidationService>(
    GradeValidationService,
  );

  execute(command: CreateGradeCommand): Observable<GradeResponse> {
    const scoreValidation = this.validationService.validateScore(command.score);
    if (!scoreValidation.valid) {
      return throwError(
        () => new Error(scoreValidation.error || "Score invalide"),
      );
    }

    const coeffValidation = this.validationService.validateCoefficient(
      command.coefficient,
    );
    if (!coeffValidation.valid) {
      return throwError(
        () => new Error(coeffValidation.error || "Coefficient invalide"),
      );
    }

    if (!command.classId || !command.studentId || !command.subjectId) {
      return throwError(
        () => new Error("Les identifiants de note sont invalides."),
      );
    }

    return this.repository.getSequences().pipe(
      map((sequences) => this.buildPayload(command, sequences ?? [])),
      switchMap((payload) => this.repository.createGrade(payload)),
    );
  }

  /**
   * Construit le payload en déléguant la logique de résolution au domaine
   */
  private buildPayload(
    command: CreateGradeCommand,
    sequences: GradeSequenceRef[],
  ): CreateGradeRequest {
    const selectedSequence = sequences.find(
      (sequence) => sequence.libelleSequence === command.period,
    );

    const sequenceId = this.resolveSequenceId(selectedSequence, command.period);

    // La logique de détermination du trimestre est une règle métier
    const trimestreId = this.resolveTrimesterId(selectedSequence, sequenceId);

    return {
      studentId: command.studentId,
      subjectId: command.subjectId,
      classeId: command.classId,
      sequenceId,
      trimestreId,
      score: command.score,
      coefficient: command.coefficient,
      period: command.period,
      comments: this.normalizeComment(command.comments),
      assessmentDate: this.normalizeAssessmentDate(command.assessmentDate),
    };
  }

  private resolveSequenceId(sequence: GradeSequenceRef | undefined, periodLabel: string): number {
    if (sequence?.id) return Number(sequence.id);

    const match = periodLabel.match(/(\d+)/);
    const parsed = Number(match?.[1]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  private resolveTrimesterId(sequence: GradeSequenceRef | undefined, sequenceId: number): number {
    // 1. Priorité à la donnée structurée du backend
    if (sequence?.trimestre?.id) {
      return Number(sequence.trimestre.id);
    }

    // 2. Fallback sur la règle métier de domaine (Calcul par défaut)
    // Idéalement, ceci devrait appeler un Domain Service
    if (sequenceId <= 2) return 1;
    if (sequenceId <= 4) return 2;
    return 3;
  }

  private normalizeComment(comment?: string): string | undefined {
    const trimmed = String(comment ?? "").trim();
    return trimmed ? trimmed : undefined;
  }

  private normalizeAssessmentDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString();
    }

    return date.toISOString();
  }
}
