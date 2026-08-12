/**
 * BulletinDTO
 * DTO pour la présentation d'un bulletin
 */
export interface BulletinDTO {
  id: string;
  studentId: number;
  studentName: string;
  studentMatricule?: string;
  className: string;
  classId: number;
  academicYear: string;
  trimester: string;
  sequence: string;
  evaluationMonth: string;

  // Données du tableau
  gradeRows: GradeRowDTO[];

  // Statistiques
  generalAverage: number;
  generalMention: string;
  totalCoefficient: number;
  passingCount: number;
  failingCount: number;
  isSuccessful: boolean;

  // Classement
  rank?: number;
  totalStudents?: number;

  // Metadata
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface GradeRowDTO {
  id: number;
  subjectId: number;
  subjectName: string;
  subjectCode?: string;
  scores: { [sequenceName: string]: number };
  coefficient: number;
  average: number;
  mention: string;
  mentionColor: string;
  mentionEmoji: string;
  comments?: string;
}

export interface BulletinStatisticsDTO {
  generalAverage: number;
  mention: string;
  passingCount: number;
  failingCount: number;
  isSuccessful: boolean;
  topSubjects: GradeRowDTO[];
  bottomSubjects: GradeRowDTO[];
}
