import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateGradeRequest } from '@app/features/grades/domain/models';
import { GradeResponse } from '@app/features/grades/domain/models';
import { GradeStats } from '@app/features/grades/domain/models';
import { PageResponse } from '@app/shared/domains/value-objects';
import { StudentRankingItem } from '@app/features/grades/domain/models';
import { StudentReport } from '@app/features/grades/domain/models';
import { environment } from '@environments/environment';
import { map, Observable, of } from 'rxjs';

type GradePrimitive = number | string | null | undefined;
type ApiDateValue = string | ReadonlyArray<number | string> | null | undefined;

export interface GradeFilters {
  classId: number;
  period: string;
  page?: number;
  size?: number;
}

interface GradeApiStudent {
  id?: GradePrimitive;
  firstNameStudent?: string | null;
  lastNameStudent?: string | null;
}

interface GradeApiSubject {
  id?: GradePrimitive;
  nameSubject?: string | null;
  coefficient?: GradePrimitive;
}

interface GradeApiClassroom {
  id?: GradePrimitive;
  nameClasse?: string | null;
}

interface GradeApiSequence {
  libelleSequence?: string | null;
}

interface GradeApiResponse {
  id?: GradePrimitive;
  studentId?: GradePrimitive;
  studentName?: string | null;
  student?: GradeApiStudent | null;
  subjectId?: GradePrimitive;
  subjectName?: string | null;
  subject?: GradeApiSubject | null;
  classeId?: GradePrimitive;
  classId?: GradePrimitive;
  classeName?: string | null;
  className?: string | null;
  classe?: GradeApiClassroom | null;
  score?: GradePrimitive;
  grade?: GradePrimitive;
  coefficient?: GradePrimitive;
  period?: string | null;
  comments?: string | null;
  sequence?: GradeApiSequence | null;
  assessmentDate?: ApiDateValue;
}

type GradePageResponse = PageResponse<GradeApiResponse>;

@Injectable({
  providedIn: 'root',
})
export class GradesService {
  private gradesApiUrl = `${environment.apiUrl}/grades`;
  private reportsApiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getGrades(filters: GradeFilters): Observable<GradeResponse[]> {
    const classId = Number(filters.classId);
    const period = filters.period;
    const page = filters.page ?? 0;
    const size = filters.size ?? 500;

    if (!classId || !period) return of([]);
    return this.getGradesByClass(classId, period, page, size);
  }

  getGradesByClass(
    classId: number,
    period: string,
    page = 0,
    size = 500
  ): Observable<GradeResponse[]> {
    let params = new HttpParams()
      .set('period', period)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<GradePageResponse>(`${this.gradesApiUrl}/class/${classId}`, {
        params,
      })
      .pipe(
        map((response) =>
          (response?.content ?? []).map((item) => this.mapGradeResponse(item))
        )
      );
  }

  getGradesByStudent(
    studentId: number,
    page = 0,
    size = 500
  ): Observable<GradeResponse[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<GradePageResponse>(`${this.gradesApiUrl}/student/${studentId}`, {
        params,
      })
      .pipe(
        map((response) =>
          (response?.content ?? []).map((item) => this.mapGradeResponse(item))
        )
      );
  }

  getGrade(id: number): Observable<GradeResponse> {
    return this.http
      .get<GradeApiResponse>(`${this.gradesApiUrl}/${id}`)
      .pipe(map((response) => this.mapGradeResponse(response)));
  }

  createGrade(payload: CreateGradeRequest): Observable<GradeResponse> {
    return this.http
      .post<GradeApiResponse>(this.gradesApiUrl, payload)
      .pipe(map((response) => this.mapGradeResponse(response)));
  }

  updateGrade(id: number, payload: CreateGradeRequest): Observable<GradeResponse> {
    return this.http
      .put<GradeApiResponse>(`${this.gradesApiUrl}/${id}`, payload)
      .pipe(map((response) => this.mapGradeResponse(response)));
  }

  deleteGrade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gradesApiUrl}/${id}`);
  }

  getStudentGradeStats(
    studentId: number,
    subjectId: number,
    period: string
  ): Observable<GradeStats> {
    return this.http.get<GradeStats>(
      `${this.gradesApiUrl}/stats/student/${studentId}/subject/${subjectId}/period/${period}`
    );
  }

  getClassGradeStats(
    classId: number,
    subjectId: number,
    period: string
  ): Observable<GradeStats> {
    return this.http.get<GradeStats>(
      `${this.gradesApiUrl}/stats/class/${classId}/subject/${subjectId}/period/${period}`
    );
  }

  getStudentReport(
    studentId: number,
    period: string
  ): Observable<StudentReport> {
    return this.http.get<StudentReport>(
      `${this.gradesApiUrl}/report/student/${studentId}/period/${period}`
    );
  }

  getClassRanking(
    classId: number,
    period: string
  ): Observable<StudentRankingItem[]> {
    return this.getGradesByClass(classId, period).pipe(
      map((grades) => {
        const statsByStudent = new Map<
          number,
          { name: string; weightedTotal: number; totalCoef: number }
        >();

        grades.forEach((grade) => {
          const studentId = Number(grade.studentId);
          if (!studentId) return;

          const rawValue = Number(grade.score ?? 0);
          const rawCoefficient = Number(grade.coefficient ?? 1);
          const coefficient =
            Number.isFinite(rawCoefficient) && rawCoefficient > 0
              ? rawCoefficient
              : 1;

          const current = statsByStudent.get(studentId) ?? {
            name: grade.studentName || `Élève ${studentId}`,
            weightedTotal: 0,
            totalCoef: 0,
          };

          const safeValue = Number.isFinite(rawValue) ? rawValue : 0;
          current.weightedTotal += safeValue * coefficient;
          current.totalCoef += coefficient;
          statsByStudent.set(studentId, current);
        });

        const ranking = Array.from(statsByStudent.entries())
          .map(([studentId, stat]) => ({
            studentId,
            studentName: stat.name,
            average: stat.totalCoef ? stat.weightedTotal / stat.totalCoef : 0,
            rank: 0,
          }))
          .sort((a, b) => b.average - a.average);

        ranking.forEach((item, index) => {
          item.rank = index + 1;
        });

        return ranking;
      })
    );
  }

  generateReportCard(studentId: number, period?: string): Observable<Blob> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);

    return this.http.get(`${this.reportsApiUrl}/bulletin/${studentId}`, {
      params,
      responseType: 'blob',
    });
  }

  generateClassReport(classId: number, period?: string): Observable<Blob> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);

    return this.http.get(`${this.reportsApiUrl}/classe/${classId}`, {
      params,
      responseType: 'blob',
    });
  }

  generateClassBulletinsZip(classId: number, period?: string): Observable<Blob> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);

    return this.http.get(`${this.reportsApiUrl}/classe/${classId}/bulletins.zip`, {
      params,
      responseType: 'blob',
    });
  }

  private mapGradeResponse(raw: GradeApiResponse): GradeResponse {
    const studentId = this.toNumber(raw?.studentId, raw?.student?.id);
    const subjectId = this.toNumber(raw?.subjectId, raw?.subject?.id);
    const classeId = this.toNumber(raw?.classeId, raw?.classId, raw?.classe?.id);

    const studentName =
      raw?.studentName ?? this.buildStudentName(raw?.student) ?? '';
    const subjectName = raw?.subjectName ?? raw?.subject?.nameSubject ?? '';
    const classeName =
      raw?.classeName ?? raw?.className ?? raw?.classe?.nameClasse ?? '';

    return {
      id: this.toNumber(raw?.id),
      studentId,
      studentName,
      subjectId,
      subjectName,
      classeId,
      classeName,
      score: this.toNumber(raw?.score, raw?.grade),
      coefficient: this.toNumber(raw?.coefficient, raw?.subject?.coefficient, 1),
      period: raw?.period ?? raw?.sequence?.libelleSequence ?? '',
      comments: raw?.comments ?? '',
      assessmentDate: this.toDateString(raw?.assessmentDate),
    };
  }

  private buildStudentName(student: GradeApiStudent | null | undefined): string {
    if (!student) return '';
    return `${student.lastNameStudent ?? ''} ${student.firstNameStudent ?? ''}`.trim();
  }

  private toNumber(...values: GradePrimitive[]): number {
    for (const value of values) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
  }

  private toDateString(value: ApiDateValue): string {
    if (!value) return '';
    if (Array.isArray(value) && value.length >= 3) {
      const [year, month, day] = value;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
        2,
        '0'
      )}T00:00:00`;
    }
    return typeof value === 'string' ? value : '';
  }
}
