/**
 * ListGradesUseCase
 * Liste les notes filtrees
 */
import { Injectable, inject } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map } from "rxjs/operators";
import {
  GRADE_MANAGEMENT_REPOSITORY,
  GradeManagementRepository,
} from "../../domain/repositories/grade-management.repository";
import { Mention } from "../../domain/value-objects";
import { GradeListDTO } from "../dtos";

interface GradeFilterCriteria {
  classId?: number;
  period?: string;
  subjectId?: number;
  studentId?: number;
}

@Injectable()
export class ListGradesUseCase {
  private readonly repository = inject<GradeManagementRepository>(
    GRADE_MANAGEMENT_REPOSITORY,
  );

  execute(filters: GradeFilterCriteria): Observable<GradeListDTO[]> {
    const classId = filters.classId;

    if (!classId) {
      return throwError(() => new Error("Class ID is required"));
    }

    return this.repository.getGradesByClass(classId, filters.period || "").pipe(
      map((grades) =>
        grades
          .filter((grade) =>
            filters.subjectId ? grade.subjectId === filters.subjectId : true,
          )
          .filter((grade) =>
            filters.studentId ? grade.studentId === filters.studentId : true,
          )
          .map((grade) => ({
            id: grade.id,
            studentId: grade.studentId,
            studentName: grade.studentName,
            subjectId: grade.subjectId,
            subjectName: grade.subjectName,
            score: grade.score,
            coefficient: grade.coefficient,
            period: grade.period,
            assessmentDate: grade.assessmentDate,
            mention: Mention.fromAverage(grade.score).label,
          })),
      ),
    );
  }

  listClasses(): Observable<{ id: number; name: string }[]> {
    return this.repository.getClasses().pipe(
      map((classes) =>
        (classes ?? [])
          .filter((entry) => Number(entry.id))
          .map((entry) => ({
            id: Number(entry.id),
            name: entry.nameClasse,
          })),
      ),
    );
  }

  listSubjects(): Observable<{ id: number; name: string }[]> {
    return this.repository.getSubjects().pipe(
      map((subjects) =>
        (subjects ?? [])
          .filter((entry) => Number(entry.id))
          .map((entry) => ({
            id: Number(entry.id),
            name: entry.nameSubject,
          })),
      ),
    );
  }

  listStudents(classId: number): Observable<{ id: number; name: string }[]> {
    return this.repository.getStudentsByClass(classId).pipe(
      map((students) =>
        (students ?? [])
          .filter((entry) => Number(entry.id))
          .map((entry) => ({
            id: Number(entry.id),
            name: `${entry.lastNameStudent ?? ""} ${
              entry.firstNameStudent ?? ""
            }`.trim(),
          })),
      ),
    );
  }

  listPeriods(): Observable<string[]> {
    return this.repository.getSequences().pipe(
      map((sequences) =>
        (sequences ?? [])
          .map((sequence) => sequence.libelleSequence)
          .filter((sequence): sequence is string => !!sequence),
      ),
    );
  }
}
