import { AttendanceStatus } from "@app/features/attendance/domain/models";

export interface StudentAttendanceRow {
  studentId: number;
  studentName: string;
  status: AttendanceStatus;
  hours: number;
}

export interface DailyAttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  impactedHours: number;
}
