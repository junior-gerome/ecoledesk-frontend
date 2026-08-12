/**
 * GradeListDTO
 * DTO pour la liste des notes
 */
export interface GradeListDTO {
  id: number;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  score: number;
  coefficient: number;
  period: string;
  assessmentDate: string;
  mention: string;
}

export interface GradeFormDTO {
  id?: number;
  studentId: number;
  subjectId: number;
  classId: number;
  score: number;
  coefficient: number;
  period: string;
  comments?: string;
  assessmentDate?: Date;
}
