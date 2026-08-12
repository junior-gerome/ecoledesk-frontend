/**
 * Grades Feature Configuration
 * Providers et configuration de la feature grades
 */
import { Provider } from "@angular/core";
import { BulletinMapper, GradeRowMapper } from "./application/mappers";
import {
  CreateGradeUseCase,
  ExportBulletinExcelUseCase,
  ExportBulletinPdfUseCase,
  ListGradesUseCase,
  ViewBulletinUseCase,
} from "./application/use-cases";
import { GRADE_MANAGEMENT_REPOSITORY } from "./domain/repositories/grade-management.repository";
import {
  BulletinCalculationService,
  GradeValidationService,
} from "./domain/services";
import { GradeDocumentGateway } from "./infrastructure/grade-document.gateway";
import { GradeFileExportService } from "./infrastructure/grade-file-export.service";
import { GradeManagementRepositoryAdapter } from "./infrastructure/grade-management.repository";
import { ExcelExportService } from "./infrastructure/services";

export const GRADES_FEATURE_PROVIDERS: Provider[] = [
  {
    provide: GRADE_MANAGEMENT_REPOSITORY,
    useClass: GradeManagementRepositoryAdapter,
  },

  ViewBulletinUseCase,
  ExportBulletinPdfUseCase,
  ExportBulletinExcelUseCase,
  ListGradesUseCase,
  CreateGradeUseCase,

  BulletinMapper,
  GradeRowMapper,

  BulletinCalculationService,
  GradeValidationService,

  ExcelExportService,
  GradeDocumentGateway,
  GradeFileExportService,
];
