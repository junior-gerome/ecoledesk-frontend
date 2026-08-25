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
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { SILENT_REQUEST } from '@app/core/interceptors/http-context-tokens';

/**
 * Shape of EnrollmentBasicDTO from GET /enrollments/by-class/{classroomId}?status=CONFIRMED
 */
interface EnrollmentBasicApiDto {
  id?: number | string | null;
  studentId?: number | string | null;
  studentName?: string | null;
  classroomId?: number | string | null;
  classroomName?: string | null;
  enrollmentDate?: string | null;
  status?: string | null;
}

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
      classes: this.http
        .get<SchoolClassApi[]>(`${environment.apiUrl}/classes`)
        .pipe(catchError(() => of<SchoolClassApi[]>([]))),
      activeSchoolYear: this.http
        .get<SchoolYearApi>(`${environment.apiUrl}/academic-year/active`, {
          context: new HttpContext().set(SILENT_REQUEST, true),
        })
        .pipe(catchError(() => of<SchoolYearApi | null>(null))),
    }).pipe(
      switchMap(({ students, classes, activeSchoolYear }) => {
        if (classes.length === 0) {
          return of({ students, classes, activeSchoolYear, enrollments: [] as SchoolEnrollmentApi[] });
        }

        // Fetch confirmed enrollments for every class in parallel.
        // GET /enrollments/by-class/{classroomId}?status=CONFIRMED (EnrollmentQueryController)
        const enrollmentRequests = classes
          .filter((c) => c.id != null)
          .map((c) =>
            this.http
              .get<EnrollmentBasicApiDto[]>(
                `${environment.apiUrl}/enrollments/by-class/${c.id}?status=CONFIRMED`,
              )
              .pipe(catchError(() => of<EnrollmentBasicApiDto[]>([])))
          );

        return forkJoin(enrollmentRequests).pipe(
          map((results) => {
            // Flatten all arrays and map to SchoolEnrollmentApi
            const enrollments: SchoolEnrollmentApi[] = results
              .flat()
              .map((item) => this.toSchoolEnrollmentApi(item));
            return { students, classes, activeSchoolYear, enrollments };
          }),
          catchError(() => of({ students, classes, activeSchoolYear, enrollments: [] as SchoolEnrollmentApi[] })),
        );
      }),
    );
  }

  /**
   * Maps EnrollmentBasicApiDto → SchoolEnrollmentApi (used by SchoolDocumentsComponent).
   * EnrollmentBasicDTO.studentName = "LASTNAME FIRSTNAME"
   */
  private toSchoolEnrollmentApi(item: EnrollmentBasicApiDto): SchoolEnrollmentApi {
    const nameParts = (item.studentName ?? '').trim().split(/\s+/);
    const student: SchoolStudentApi = {
      id: item.studentId ?? null,
      lastNameStudent: nameParts[0] ?? null,
      firstNameStudent: nameParts.slice(1).join(' ') || null,
    };

    return {
      id: item.id ?? null,
      studentId: item.studentId ?? null,
      student,
      classeRoomId: item.classroomId ?? null,
      dateInscription: item.enrollmentDate ?? null,
    };
  }
}
