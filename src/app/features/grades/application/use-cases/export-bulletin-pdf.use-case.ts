/**
 * ExportBulletinPdfUseCase
 * Genere un PDF A4 a partir du rendu bulletin courant
 */
import { inject, Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import {
  GRADE_MANAGEMENT_REPOSITORY,
  GradeManagementRepository,
} from "../../domain/repositories/grade-management.repository";
import { BulletinPdfExportService } from "../../infrastructure/services";

@Injectable()
export class ExportBulletinPdfUseCase {
  private readonly repository = inject<GradeManagementRepository>(
    GRADE_MANAGEMENT_REPOSITORY,
  );
  private readonly pdfExportService = inject(BulletinPdfExportService);

  execute(element: HTMLElement, fileName: string): Observable<void> {
    return from(this.pdfExportService.downloadFromElement(element, fileName));
  }

  executeAll(classId: number, period: string): Observable<Blob> {
    return this.repository.generateClassReport(classId, period);
  }
}
