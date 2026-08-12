import { SubjectAverage } from "./SubjectAverage.model";

export interface StudentReport {
  studentId: number;
  studentName: string;
  classId: number;
  sectionId: number;
  className: string;
  period: string;
  subjectAverages: SubjectAverage[];
  generalAverage: number;
  rank: number;
  totalStudents: number;
  teacherComments: string;
  principalComments: string;
}
