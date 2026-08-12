export interface GradeResponse {
  id: number;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  classeId: number;
  classeName: string;
  score: number;
  coefficient: number;
  period: string;
  comments: string;
  assessmentDate: string;
}