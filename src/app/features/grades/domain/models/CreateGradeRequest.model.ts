export interface CreateGradeRequest {
  studentId: number;
  subjectId: number;
  classeId: number;
  sequenceId: number;
  trimestreId: number;
  score: number;
  coefficient: number;
  period: string;
  comments?: string;
  assessmentDate: string;
}
