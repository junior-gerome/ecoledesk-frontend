import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummaryRow,
} from "@app/features/attendance/domain/models";

const ATTENDANCE_STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE"];

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  if (value == null) {
    return fallback;
  }
  return String(value);
}

function asBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function asStatus(value: unknown): AttendanceStatus {
  const status = asString(value, "PRESENT").toUpperCase();
  return ATTENDANCE_STATUSES.includes(status as AttendanceStatus)
    ? (status as AttendanceStatus)
    : "PRESENT";
}

function asIsoDate(value: unknown): string {
  if (value == null || value === "") {
    return "";
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  const raw = asString(value);
  return raw.includes("T") ? raw.split("T")[0] : raw;
}

export function normalizeUpdatedAt(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    const date = new Date(
      asNumber(year),
      asNumber(month) - 1,
      asNumber(day),
      asNumber(hour),
      asNumber(minute),
      asNumber(second),
    );
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }
  return asString(value);
}

export function mapAttendanceRecord(raw: unknown): AttendanceRecord {
  const row = (raw ?? {}) as Record<string, unknown>;
  const status = asStatus(row["status"] ?? row["attendanceStatus"]);

  return {
    id: asNumber(row["id"]),
    studentId: asNumber(row["studentId"] ?? row["student_id"]),
    studentName: asString(row["studentName"] ?? row["student_name"]),
    classId: asNumber(row["classId"] ?? row["class_id"]),
    className: asString(row["className"] ?? row["class_name"], "Non affecte"),
    date: asIsoDate(row["date"] ?? row["attendanceDate"]),
    status,
    hours: asNumber(row["hours"]),
    justified: asBoolean(row["justified"]),
    justificationNote:
      row["justificationNote"] != null
        ? asString(row["justificationNote"])
        : row["justification_note"] != null
          ? asString(row["justification_note"])
          : undefined,
    updatedAt: normalizeUpdatedAt(row["updatedAt"] ?? row["updated_at"]),
  };
}

export function mapAttendanceRecords(raw: unknown): AttendanceRecord[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(mapAttendanceRecord);
}

export function mapAttendanceSummaryRow(raw: unknown): AttendanceSummaryRow {
  const row = (raw ?? {}) as Record<string, unknown>;

  return {
    studentId: asNumber(row["studentId"] ?? row["student_id"]),
    studentName: asString(row["studentName"] ?? row["student_name"]),
    className: asString(row["className"] ?? row["class_name"], "Non affecte"),
    totalAbsences: asNumber(row["totalAbsences"] ?? row["total_absences"]),
    totalLates: asNumber(row["totalLates"] ?? row["total_lates"]),
    unjustifiedCount: asNumber(
      row["unjustifiedCount"] ?? row["unjustified_count"],
    ),
    lastDate: asIsoDate(row["lastDate"] ?? row["last_date"]),
  };
}

export function mapAttendanceSummaryRows(raw: unknown): AttendanceSummaryRow[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(mapAttendanceSummaryRow);
}
