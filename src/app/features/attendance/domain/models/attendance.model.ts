export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface DailyAttendanceEntryInput {
  studentId: number;
  studentName: string;
  status: AttendanceStatus;
  hours: number;
}

export interface SaveDailyAttendancePayload {
  classId: number;
  className: string;
  date: string;
  entries: DailyAttendanceEntryInput[];
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  date: string;
  status: AttendanceStatus;
  hours: number;
  justified: boolean;
  justificationNote?: string;
  updatedAt: string;
}

export interface AttendanceSummaryRow {
  studentId: number;
  studentName: string;
  className: string;
  totalAbsences: number;
  totalLates: number;
  unjustifiedCount: number;
  lastDate: string;
}
