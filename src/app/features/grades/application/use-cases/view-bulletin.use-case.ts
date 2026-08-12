/**
 * ViewBulletinUseCase
 * Charge et affiche un bulletin
 */
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import {
  GRADE_MANAGEMENT_REPOSITORY,
  GradeManagementRepository,
} from "../../domain/repositories/grade-management.repository";
import { BulletinCalculationService } from "../../domain/services";
import { BulletinDTO } from "../dtos";
import { BulletinMapper } from "../mappers";

@Injectable()
export class ViewBulletinUseCase {
  private readonly repository = inject<GradeManagementRepository>(
    GRADE_MANAGEMENT_REPOSITORY,
  );
  private readonly calculationService = inject<BulletinCalculationService>(
    BulletinCalculationService,
  );
  private readonly mapper = inject<BulletinMapper>(BulletinMapper);

  execute(studentId: number, period: string): Observable<BulletinDTO> {
    return new Observable((observer) => {
      this.repository
        .getBulletinByStudentAndPeriod(studentId, period)
        .subscribe({
          next: (bulletin) => {
            const statistics =
              this.calculationService.calculateBulletinStatistics(bulletin);
            const bulletinDTO = this.mapper.toDTOWithStatistics(
              bulletin,
              statistics,
            );
            observer.next(bulletinDTO);
            observer.complete();
          },
          error: (error) => observer.error(error),
        });
    });
  }

  /**
   * Liste les périodes disponibles pour un élève
   */
  listAvailablePeriods(studentId: number): Observable<string[]> {
    return this.repository.getAvailablePeriodsForStudent(studentId);
  }

  /**
   * Récupère les statistiques d'un bulletin
   */
  getBulletinStatistics(
    studentId: number,
    period: string,
  ): Observable<{
    generalAverage: number;
    mention: string;
    passingCount: number;
    failingCount: number;
    isSuccessful: boolean;
  }> {
    return new Observable((observer) => {
      this.repository
        .getBulletinByStudentAndPeriod(studentId, period)
        .subscribe({
          next: (bulletin) => {
            const stats =
              this.calculationService.calculateBulletinStatistics(bulletin);
            observer.next({
              generalAverage: stats.generalAverage.value,
              mention: stats.mention.label,
              passingCount: stats.passingCount,
              failingCount: stats.failingCount,
              isSuccessful: stats.isSuccessful,
            });
            observer.complete();
          },
          error: (error) => observer.error(error),
        });
    });
  }
}
