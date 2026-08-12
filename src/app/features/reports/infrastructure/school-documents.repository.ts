import { HttpClient } from '@angular/common/http';
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
      enrollments: this.http
        .get<SchoolEnrollmentApi[]>(`${environment.apiUrl}/inscription`)
        .pipe(catchError(() => of<SchoolEnrollmentApi[]>([]))),
      classes: this.http
        .get<SchoolClassApi[]>(`${environment.apiUrl}/classes`)
        .pipe(catchError(() => of<SchoolClassApi[]>([]))),
      activeSchoolYear: this.http
        .get<SchoolYearApi>(`${environment.apiUrl}/annees-scolaires/active`)
        .pipe(catchError(() => of<SchoolYearApi | null>(null))),
    });
  }
}
