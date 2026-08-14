import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  SchoolClassApi,
  SchoolDocumentsData,
  SchoolEnrollmentApi,
  SchoolStudentApi,
  SchoolYearApi,
} from '@app/features/reports/domain/models';
import { SchoolDocumentsRepository } from '@app/features/reports/domain/repositories/school-documents.repository';
import { environment } from '@environments/environment';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { SILENT_REQUEST } from '@app/core/interceptors/http-context-tokens';

@Injectable()
export class SchoolDocumentsRepositoryAdapter
  implements SchoolDocumentsRepository
{
  private readonly http = inject(HttpClient);

  loadData(): Observable<SchoolDocumentsData> {
    return forkJoin({
      students: this.http
        .get<SchoolStudentApi[]>(`${environment.apiUrl}/students`)
        .pipe(catchError(() => of<SchoolStudentApi[]>([]))),
      // The legacy /inscription endpoint no longer exists. The pre-enrollment
      // query API has not been exposed yet, so we fall back to an empty list.
      enrollments: of<SchoolEnrollmentApi[]>([]),
      classes: this.http
        .get<SchoolClassApi[]>(`${environment.apiUrl}/classes`)
        .pipe(catchError(() => of<SchoolClassApi[]>([]))),
      activeSchoolYear: this.http
        .get<SchoolYearApi>(`${environment.apiUrl}/academic-year/active`, {
          context: new HttpContext().set(SILENT_REQUEST, true),
        })
        .pipe(catchError(() => of<SchoolYearApi | null>(null))),
    });
  }
}
