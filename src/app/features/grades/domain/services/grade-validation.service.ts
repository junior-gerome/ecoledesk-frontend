/**
 * GradeValidationService
 * Service de validation des notes
 */
import { Injectable } from "@angular/core";
import { Coefficient } from "../value-objects/coefficient.value-object";
import { Score } from "../value-objects/score.value-object";

@Injectable()
export class GradeValidationService {
  /**
   * Valide une note
   */
  validateScore(score: number): { valid: boolean; error?: string } {
    try {
      Score.create(score);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Score invalide",
      };
    }
  }

  /**
   * Valide un coefficient
   */
  validateCoefficient(coeff: number): { valid: boolean; error?: string } {
    try {
      Coefficient.create(coeff);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Coefficient invalide",
      };
    }
  }

  /**
   * Valide une liste de notes
   */
  validateScores(scores: number[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    scores.forEach((score, index) => {
      const validation = this.validateScore(score);
      if (!validation.valid) {
        errors.push(`Score ${index + 1}: ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Vérifie si les moyennes sont cohérentes
   */
  validateAverages(scores: number[]): boolean {
    if (scores.length === 0) return true;

    const min = Math.min(...scores);
    const max = Math.max(...scores);

    // Les notes doivent être entre 0 et 20
    return min >= 0 && max <= 20;
  }
}
