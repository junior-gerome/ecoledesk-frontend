import { GradeResponse } from "@app/features/grades/domain/models";
import { CoefficientValueObject } from "../value-objects/coefficient.value-object";
import { ScoreValueObject } from "../value-objects/score.value-object";

export interface GradeEntityProps {
  id: number;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  period: string;
  comments: string;
  assessmentDate: string;
  score: ScoreValueObject;
  coefficient: CoefficientValueObject;
}

export class GradeEntity {
  readonly id: number;
  readonly studentId: number;
  readonly studentName: string;
  readonly subjectId: number;
  readonly subjectName: string;
  readonly classId: number;
  readonly className: string;
  readonly period: string;
  readonly comments: string;
  readonly assessmentDate: string;
  readonly score: ScoreValueObject;
  readonly coefficient: CoefficientValueObject;

  constructor(props: GradeEntityProps) {
    this.id = props.id;
    this.studentId = props.studentId;
    this.studentName = props.studentName;
    this.subjectId = props.subjectId;
    this.subjectName = props.subjectName;
    this.classId = props.classId;
    this.className = props.className;
    this.period = props.period;
    this.comments = props.comments;
    this.assessmentDate = props.assessmentDate;
    this.score = props.score;
    this.coefficient = props.coefficient;
  }

  static fromResponse(response: GradeResponse): GradeEntity {
    return new GradeEntity({
      id: Number(response.id ?? 0),
      studentId: Number(response.studentId ?? 0),
      studentName: response.studentName ?? "",
      subjectId: Number(response.subjectId ?? 0),
      subjectName: response.subjectName ?? "",
      classId: Number(response.classeId ?? 0),
      className: response.classeName ?? "",
      period: response.period ?? "",
      comments: response.comments ?? "",
      assessmentDate: response.assessmentDate ?? "",
      score: ScoreValueObject.fromUnsafe(response.score, 0),
      coefficient: CoefficientValueObject.fromUnsafe(response.coefficient, 1),
    });
  }

  weightedScore(): number {
    return this.score.value * this.coefficient.value;
  }
}
