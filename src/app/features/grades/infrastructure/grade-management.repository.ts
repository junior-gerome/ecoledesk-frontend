import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Class } from "@app/features/classes/domain/models";
import { CreateGradeRequest } from "@app/features/grades/domain/models";
import { GradeResponse } from "@app/features/grades/domain/models";
import { Inscription } from "@app/features/inscriptionstudent/domain/models";
import { PageResponse } from "@app/shared/domains/value-objects";
import { Sequence } from "@app/features/sequence/domain/models";
import { StudentRankingItem } from "@app/features/grades/domain/models";
import { subject } from "@app/features/subjects/domain/models";
import { environment } from "@environments/environment";
import { StudentMapper } from "@features/students/domain/mappers/student.mapper";
import { StudentEntity } from "@features/students/domain/models/student.entity";
import { forkJoin, map, Observable, of, switchMap } from "rxjs";
import { Bulletin, GradeRow, StudentGradeHeader } from "../domain/entities";
import {
  GradeManagementRepository,
} from "../domain/repositories/grade-management.repository";
import {
  AcademicContext,
  Average,
  Coefficient,
  Score,
} from "../domain/value-objects";

type InscriptionWithClassFallback = Inscription & { classeRoomId?: number };
type GradePrimitive = number | string | null | undefined;
type ApiDateValue = string | ReadonlyArray<number | string> | null | undefined;
type GradeApiStudent = {
  id?: GradePrimitive;
  lastNameStudent?: string | null;
  firstNameStudent?: string | null;
};
type GradeApiSubject = {
  id?: GradePrimitive;
  nameSubject?: string | null;
  coefficient?: GradePrimitive;
  code?: string | null;
};
type GradeApiClassroom = {
  id?: GradePrimitive;
  nameClasse?: string | null;
};
type GradeApiSequence = {
  libelleSequence?: string | null;
};
type GradeApiResponse = {
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
};
type GradePageResponse = PageResponse<GradeApiResponse>;
type ActiveSchoolYearResponse = {
  libelleAnneeScolaire?: string | null;
};

@Injectable()
export class GradeManagementRepositoryAdapter implements GradeManagementRepository {
  private readonly http = inject(HttpClient);

  getClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${environment.apiUrl}/classes`);
  }

  getSubjects(): Observable<subject[]> {
    return this.http.get<subject[]>(`${environment.apiUrl}/subject`);
  }

  getSequences(): Observable<Sequence[]> {
    return this.http.get<Sequence[]>(`${environment.apiUrl}/sequence`);
  }

  getStudentsByClass(classId: number): Observable<StudentEntity[]> {
    return this.http
      .get<Inscription[]>(`${environment.apiUrl}/inscription`)
      .pipe(map((inscriptions) => this.mapStudentsByClass(inscriptions ?? [], classId)));
  }

  getGradeById(id: number): Observable<GradeResponse> {
    return this.http
      .get<GradeApiResponse>(`${environment.apiUrl}/grades/${id}`)
      .pipe(map((response) => this.mapGradeResponse(response)));
  }

  createGrade(payload: CreateGradeRequest): Observable<GradeResponse> {
    return this.http
      .post<GradeApiResponse>(`${environment.apiUrl}/grades`, payload)
      .pipe(map((response) => this.mapGradeResponse(response)));
  }

  updateGrade(id: number, payload: CreateGradeRequest): Observable<GradeResponse> {
    return this.http
      .put<GradeApiResponse>(`${environment.apiUrl}/grades/${id}`, payload)
      .pipe(map((response) => this.mapGradeResponse(response)));
  }

  deleteGrade(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/grades/${id}`);
  }

  getGradesByClass(classId: number, period: string): Observable<GradeResponse[]> {
    let params = new HttpParams().set("page", "0").set("size", "500");

    if (period) {
      params = params.set("period", period);
    }

    return this.http
      .get<GradePageResponse>(`${environment.apiUrl}/grades/class/${classId}`, { params })
      .pipe(map((response) => (response?.content ?? []).map((item) => this.mapGradeResponse(item))));
  }

  getGradesByStudent(studentId: number): Observable<GradeResponse[]> {
    const params = new HttpParams().set("page", "0").set("size", "500");

    return this.http
      .get<GradePageResponse>(`${environment.apiUrl}/grades/student/${studentId}`, { params })
      .pipe(map((response) => (response?.content ?? []).map((item) => this.mapGradeResponse(item))));
  }

  getStudentById(studentId: number): Observable<StudentEntity> {
    return this.http
      .get<InscriptionWithClassFallback["student"]>(`${environment.apiUrl}/students/${studentId}`)
      .pipe(map((student) => StudentMapper.fromApi(student ?? undefined)));
  }

  getClassRanking(classId: number, period: string): Observable<StudentRankingItem[]> {
    return this.getGradesByClass(classId, period).pipe(
      map((grades) => {
        const statsByStudent = new Map<
          number,
          { name: string; weightedTotal: number; totalCoef: number }
        >();

        grades.forEach((grade) => {
          const studentId = Number(grade.studentId);
          if (!studentId) {
            return;
          }

          const rawValue = Number(grade.score ?? 0);
          const rawCoefficient = Number(grade.coefficient ?? 1);
          const coefficient = Number.isFinite(rawCoefficient) && rawCoefficient > 0 ? rawCoefficient : 1;

          const current = statsByStudent.get(studentId) ?? {
            name: grade.studentName || `Eleve ${studentId}`,
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
          .sort((left, right) => right.average - left.average);

        ranking.forEach((item, index) => {
          item.rank = index + 1;
        });

        return ranking;
      }),
    );
  }

  getBulletinByStudentAndPeriod(studentId: number, period: string): Observable<Bulletin> {
    return forkJoin({
      grades: this.getGradesByStudent(studentId),
      student: this.getStudentById(studentId),
      academicYear: this.getActiveAcademicYearLabel(),
    }).pipe(
      switchMap(({ grades, student, academicYear }) => {
        const relevantGrades = (grades ?? []).filter((grade) =>
          this.matchesPeriodWindow(grade.period, period),
        );
        const classId = relevantGrades[0]?.classeId || 0;
        const ranking$ = classId ? this.getClassRanking(classId, period) : of([]);

        return ranking$.pipe(
          map((ranking) =>
            this.buildBulletin({
              studentId,
              grades: relevantGrades,
              academicYear,
              period,
              ranking,
              student,
            }),
          ),
        );
      }),
    );
  }

  getBulletinsByClassAndPeriod(classId: number, period: string): Observable<Bulletin[]> {
    return forkJoin({
      grades: this.getGradesByClass(classId, period),
      academicYear: this.getActiveAcademicYearLabel(),
      ranking: this.getClassRanking(classId, period),
    }).pipe(
      map(({ grades, academicYear, ranking }) => {
        const gradesByStudent = new Map<number, GradeResponse[]>();

        (grades ?? []).forEach((grade) => {
          const studentGrades = gradesByStudent.get(grade.studentId) ?? [];
          studentGrades.push(grade);
          gradesByStudent.set(grade.studentId, studentGrades);
        });

        return Array.from(gradesByStudent.entries()).map(([studentId, studentGrades]) =>
          this.buildBulletin({
            studentId,
            grades: studentGrades,
            academicYear,
            period,
            ranking,
          }),
        );
      }),
    );
  }

  getAvailablePeriodsForStudent(studentId: number): Observable<string[]> {
    return this.getGradesByStudent(studentId).pipe(
      map((grades) =>
        Array.from(new Set((grades ?? []).map((grade) => grade.period))).sort(
          (left, right) => this.sequenceOrder(left) - this.sequenceOrder(right),
        ),
      ),
    );
  }

  getActiveAcademicYearLabel(): Observable<string> {
    return this.http
      .get<ActiveSchoolYearResponse>(`${environment.apiUrl}/annees-scolaires/active`)
      .pipe(map((activeYear) => activeYear?.libelleAnneeScolaire || "N/A"));
  }

  generateReportCard(studentId: number, period?: string): Observable<Blob> {
    let params = new HttpParams();
    if (period) {
      params = params.set("period", period);
    }

    return this.http.get(`${environment.apiUrl}/reports/bulletin/${studentId}`, {
      params,
      responseType: "blob",
    });
  }

  generateClassReport(classId: number, period?: string): Observable<Blob> {
    let params = new HttpParams();
    if (period) {
      params = params.set("period", period);
    }

    return this.http.get(`${environment.apiUrl}/reports/classe/${classId}`, {
      params,
      responseType: "blob",
    });
  }

  generateClassBulletinsZip(classId: number, period?: string): Observable<Blob> {
    let params = new HttpParams();
    if (period) {
      params = params.set("period", period);
    }

    return this.http.get(`${environment.apiUrl}/reports/classe/${classId}/bulletins.zip`, {
      params,
      responseType: "blob",
    });
  }

  private buildBulletin(params: {
    studentId: number;
    grades: GradeResponse[];
    academicYear: string;
    period: string;
    ranking: StudentRankingItem[];
    student?: StudentEntity;
  }): Bulletin {
    const grades = params.grades ?? [];
    const firstGrade = grades[0];
    const studentName = params.student
      ? `${params.student.lastNameStudent ?? ""} ${params.student.firstNameStudent ?? ""}`.trim()
      : firstGrade?.studentName || "Eleve";
    const splitName = this.splitStudentName(studentName);
    const classId = firstGrade?.classeId || 0;
    const className = firstGrade?.classeName || "N/A";
    const sequenceId = this.extractSequenceId(params.period || firstGrade?.period);
    const rankingEntry = params.ranking.find((entry) => entry.studentId === params.studentId);

    const studentHeader = new StudentGradeHeader(
      params.studentId,
      params.student?.firstNameStudent || splitName.firstName,
      params.student?.lastNameStudent || splitName.lastName,
      classId,
      className,
      params.academicYear,
      `MAT-${String(params.studentId).padStart(4, "0")}`,
    );

    const academicContext = new AcademicContext(
      params.academicYear,
      this.resolveTrimester(sequenceId),
      params.period || firstGrade?.period || "Sequence 1",
      this.resolveEvaluationMonth(grades, sequenceId),
    );

    return new Bulletin(
      `BULL-${params.studentId}-${sequenceId}`,
      studentHeader,
      this.toGradeRows(grades),
      academicContext,
      new Date(),
      new Date(),
      rankingEntry?.rank,
      params.ranking.length,
    );
  }

  private toGradeRows(grades: GradeResponse[]): GradeRow[] {
    const bySubject = new Map<number, GradeResponse[]>();

    (grades ?? []).forEach((grade) => {
      const entries = bySubject.get(grade.subjectId) ?? [];
      entries.push(grade);
      bySubject.set(grade.subjectId, entries);
    });

    return Array.from(bySubject.values()).map((entries, index) => {
      const first = entries[0];
      const coefficient = Coefficient.fromUnsafe(first.coefficient, 1);
      const scores = new Map<string, Score>();

      entries
        .sort((left, right) => this.sequenceOrder(left.period) - this.sequenceOrder(right.period))
        .forEach((entry) => {
          const key = `seq${this.sequenceOrder(entry.period)}`;
          scores.set(key, Score.fromUnsafe(entry.score));
        });

      const values = Array.from(scores.values()).map((score) => score.value);
      const average = values.length
        ? Average.calculate(values, new Array(values.length).fill(coefficient.value))
        : Average.createDirect(0);

      return new GradeRow(
        first.id || index + 1,
        first.subjectId,
        first.subjectName,
        coefficient,
        scores,
        average,
        undefined,
        first.comments,
      );
    });
  }

  private mapStudentsByClass(
    inscriptions: InscriptionWithClassFallback[],
    classId: number,
  ): StudentEntity[] {
    const byId = new Map<string, StudentEntity>();

    (inscriptions ?? []).forEach((inscription) => {
      const inscriptionClassId = Number(inscription.classeRoom?.id ?? inscription.classeRoomId);
      const studentId = String(inscription.student?.id ?? "");

      if (!inscriptionClassId || inscriptionClassId !== classId || !studentId) {
        return;
      }

      if (inscription.student && !byId.has(studentId)) {
        byId.set(studentId, StudentMapper.fromApi(inscription.student));
      }
    });

    return Array.from(byId.values()).sort((left, right) =>
      `${left.lastNameStudent ?? ""} ${left.firstNameStudent ?? ""}`.localeCompare(
        `${right.lastNameStudent ?? ""} ${right.firstNameStudent ?? ""}`,
      ),
    );
  }

  private mapGradeResponse(raw: GradeApiResponse): GradeResponse {
    const studentId = this.toNumber(raw?.studentId, raw?.student?.id);
    const subjectId = this.toNumber(raw?.subjectId, raw?.subject?.id);
    const classeId = this.toNumber(raw?.classeId, raw?.classId, raw?.classe?.id);

    const studentName = raw?.studentName ?? this.buildStudentName(raw?.student) ?? "";
    const subjectName = raw?.subjectName ?? raw?.subject?.nameSubject ?? "";
    const classeName = raw?.classeName ?? raw?.className ?? raw?.classe?.nameClasse ?? "";

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
      period: raw?.period ?? raw?.sequence?.libelleSequence ?? "",
      comments: raw?.comments ?? "",
      assessmentDate: this.toDateString(raw?.assessmentDate),
    };
  }

  private buildStudentName(student: GradeApiStudent | null | undefined): string {
    if (!student) {
      return "";
    }

    return `${student.lastNameStudent ?? ""} ${student.firstNameStudent ?? ""}`.trim();
  }

  private splitStudentName(fullName: string): { lastName: string; firstName: string } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return {
      lastName: parts[0] || "",
      firstName: parts.slice(1).join(" "),
    };
  }

  private matchesPeriodWindow(periodLabel: string, selectedPeriod: string): boolean {
    if (!selectedPeriod) {
      return true;
    }

    return this.sequenceOrder(periodLabel) <= this.sequenceOrder(selectedPeriod);
  }

  private sequenceOrder(periodLabel: string): number {
    const parsed = Number(periodLabel.match(/(\d+)/)?.[1]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  private extractSequenceId(period?: string): number {
    return this.sequenceOrder(period || "Sequence 1");
  }

  private resolveTrimester(sequenceId: number): number {
    if (sequenceId <= 2) {
      return 1;
    }
    if (sequenceId <= 4) {
      return 2;
    }
    return 3;
  }

  private resolveEvaluationMonth(grades: GradeResponse[], sequenceId: number): string {
    const assessmentDate = grades.find((grade) => this.sequenceOrder(grade.period) === sequenceId)?.assessmentDate;
    if (assessmentDate) {
      const date = new Date(assessmentDate);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString("fr-FR", { month: "long" });
      }
    }

    const months = ["octobre", "novembre", "janvier", "fevrier", "mars", "avril"];
    return months[Math.max(0, sequenceId - 1)] || "avril";
  }

  private toNumber(...values: GradePrimitive[]): number {
    for (const value of values) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return 0;
  }

  private toDateString(value: ApiDateValue): string {
    if (!value) {
      return "";
    }

    if (Array.isArray(value) && value.length >= 3) {
      const [year, month, day] = value;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`;
    }

    return typeof value === "string" ? value : "";
  }
}
