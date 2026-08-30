import { InjectionToken } from "@angular/core";
import { Class } from "@app/features/classes/domain/models";
import { CreateGradeRequest } from "@app/features/grades/domain/models";
import { GradeResponse } from "@app/features/grades/domain/models";
import { Sequence } from "@app/features/sequence/domain/models";
import { StudentRankingItem } from "@app/features/grades/domain/models";
import { SubjectReponse } from "@app/features/subjects/domain/models";
import { StudentEntity } from "@features/students/domain/models/student.entity";
import { Observable } from "rxjs";
import { Bulletin } from "../entities";

export interface GradeManagementRepository {
  getClasses(): Observable<Class[]>;
  getSubjects(): Observable<SubjectReponse[]>;
  getSequences(): Observable<Sequence[]>;
  getStudentsByClass(classId: number): Observable<StudentEntity[]>;

  getGradeById(id: number): Observable<GradeResponse>;
  createGrade(payload: CreateGradeRequest): Observable<GradeResponse>;
  updateGrade(id: number, payload: CreateGradeRequest): Observable<GradeResponse>;
  deleteGrade(id: number): Observable<void>;

  getGradesByClass(classId: number, period: string): Observable<GradeResponse[]>;
  getGradesByStudent(studentId: number): Observable<GradeResponse[]>;
  getStudentById(studentId: number): Observable<StudentEntity>;
  getClassRanking(classId: number, period: string): Observable<StudentRankingItem[]>;

  getBulletinByStudentAndPeriod(studentId: number, period: string): Observable<Bulletin>;
  getBulletinsByClassAndPeriod(classId: number, period: string): Observable<Bulletin[]>;
  getAvailablePeriodsForStudent(studentId: number): Observable<string[]>;

  getActiveAcademicYearLabel(): Observable<string>;
  generateReportCard(studentId: number, period?: string): Observable<Blob>;
  generateClassReport(classId: number, period?: string): Observable<Blob>;
  generateClassBulletinsZip(classId: number, period?: string): Observable<Blob>;
}

export const GRADE_MANAGEMENT_REPOSITORY =
  new InjectionToken<GradeManagementRepository>("GRADE_MANAGEMENT_REPOSITORY");
