export interface TeacherSubjectAssignment {
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  schoolYear: string;
}

export interface TeacherScheduleItem {
  day?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  teacherName: string;
  subjectName: string;
  className: string;
  schoolYear: string;
}
