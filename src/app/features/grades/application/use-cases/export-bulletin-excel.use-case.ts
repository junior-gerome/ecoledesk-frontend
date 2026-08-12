/**
 * ExportBulletinExcelUseCase
 * Exporte les bulletins en Excel
 */
import { Injectable, inject } from "@angular/core";
import { Observable, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import {
  GRADE_MANAGEMENT_REPOSITORY,
  GradeManagementRepository,
} from "../../domain/repositories/grade-management.repository";
import { ExcelExportService } from "../../infrastructure/services";

@Injectable()
export class ExportBulletinExcelUseCase {
  private readonly repository = inject<GradeManagementRepository>(
    GRADE_MANAGEMENT_REPOSITORY,
  );
  private readonly excelExportService = inject(ExcelExportService);

  /**
   * Exporte un bulletin unique en Excel
   */
  executeSingle(studentId: number, period: string): Observable<Blob> {
    return this.repository
      .getBulletinByStudentAndPeriod(studentId, period)
      .pipe(
        switchMap((bulletin) =>
          from(this.excelExportService.generateExcelFile([bulletin])),
        ),
      );
  }

  /**
   * Exporte tous les bulletins d'une classe
   */
  executeClass(classId: number, period: string): Observable<Blob> {
    return this.repository
      .getBulletinsByClassAndPeriod(classId, period)
      .pipe(
        switchMap((bulletins) =>
          from(this.excelExportService.generateExcelFile(bulletins)),
        ),
      );
  }
}
