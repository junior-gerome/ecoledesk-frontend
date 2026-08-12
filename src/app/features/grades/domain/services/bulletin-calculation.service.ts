/**
 * BulletinCalculationService
 * Service de domaine pour les calculs des bulletins
 */
import { Injectable } from "@angular/core";
import { Bulletin } from "../entities/bulletin.entity";
import { GradeRow } from "../entities/grade-row.entity";
import { Average } from "../value-objects/average.value-object";
import { Mention } from "../value-objects/mention.value-object";

@Injectable()
export class BulletinCalculationService {
  /**
   * Calcule la moyenne générale d'un bulletin
   */
  calculateGeneralAverage(gradeRows: GradeRow[]): Average {
    if (gradeRows.length === 0) {
      return Average.createDirect(0);
    }

    let totalWeighted = 0;
    let totalCoeff = 0;

    for (const row of gradeRows) {
      totalWeighted += row.average.value * row.coefficient.value;
      totalCoeff += row.coefficient.value;
    }

    const average = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;
    return Average.createDirect(average, totalCoeff);
  }

  /**
   * Calcule les statistiques du bulletin
   */
  calculateBulletinStatistics(bulletin: Bulletin): {
    generalAverage: Average;
    mention: Mention;
    passingCount: number;
    failingCount: number;
    bestSubjects: GradeRow[];
    worstSubjects: GradeRow[];
    isSuccessful: boolean;
  } {
    const generalAverage = bulletin.getGeneralAverage();
    const mention = bulletin.getGeneralMention();
    const passingCount = bulletin.getPassingSubjectsCount();
    const failingCount = bulletin.getFailingSubjectsCount();
    const bestSubjects = bulletin.getTopSubjects(3);
    const worstSubjects = bulletin.getBottomSubjects(3);
    const isSuccessful = bulletin.isSuccessful();

    return {
      generalAverage,
      mention,
      passingCount,
      failingCount,
      bestSubjects,
      worstSubjects,
      isSuccessful,
    };
  }

  /**
   * Estime le ranking après calcul
   */
  estimateRanking(
    bulletins: Bulletin[],
    currentStudentId: number,
  ): { rank: number; totalStudents: number } {
    const sorted = bulletins
      .map((b) => ({
        studentId: b.studentHeader.studentId,
        average: b.getGeneralAverage().value,
      }))
      .sort((a, b) => b.average - a.average);

    const rank = sorted.findIndex((b) => b.studentId === currentStudentId) + 1;
    return {
      rank: rank > 0 ? rank : 0,
      totalStudents: sorted.length,
    };
  }
}
