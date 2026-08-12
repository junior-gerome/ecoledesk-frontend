import { Injectable } from '@angular/core';
import {
  AttendanceRecord,
  AttendanceStatus,
  SaveDailyAttendancePayload,
} from '@app/features/attendance/domain/models';
import { Class } from '@app/features/classes/domain/models';
import { Inscription } from '@app/features/inscriptionstudent/domain/models';
import {
  DailyAttendanceStats,
  StudentAttendanceRow,
} from '../models/student-attendance-row.model';

@Injectable()
export class DailyAttendanceDomainService {
  buildStudentRoster(
    inscriptions: Inscription[],
    classId: number,
    activeSchoolYearId?: number | null,
  ): StudentAttendanceRow[] {
    const uniqueStudents = new Map<number, StudentAttendanceRow>();
    const schoolYearId = Number(activeSchoolYearId);

    for (const inscription of inscriptions ?? []) {
      const inscriptionClassId = Number(
        inscription.classeRoom?.id ?? inscription.classeRoomId,
      );
      const inscriptionYearId = Number(
        inscription.anneescolaire?.id ?? inscription.anneeScolaireId,
      );
      const studentId = Number(inscription.student?.id);

      if (!inscriptionClassId || inscriptionClassId !== classId || !studentId) {
        continue;
      }

      if (schoolYearId && inscriptionYearId && inscriptionYearId !== schoolYearId) {
        continue;
      }

      if (uniqueStudents.has(studentId)) {
        continue;
      }

      const studentName = [
        inscription.student?.['lastNameStudent'] ?? '',
        inscription.student?.['firstNameStudent'] ?? '',
      ]
        .join(' ')
        .trim();

      uniqueStudents.set(studentId, {
        studentId,
        studentName: studentName || `Eleve ${studentId}`,
        status: 'PRESENT',
        hours: 0,
      });
    }

    return Array.from(uniqueStudents.values()).sort((left, right) =>
      left.studentName.localeCompare(right.studentName),
    );
  }

  mapRecordsToStudentRows(records: AttendanceRecord[]): StudentAttendanceRow[] {
    return (records ?? [])
      .map((record) => ({
        studentId: Number(record.studentId),
        studentName: record.studentName,
        status: record.status,
        hours: this.normalizeHours(record.status, record.hours),
      }))
      .filter((row) => row.studentId > 0)
      .sort((left, right) => left.studentName.localeCompare(right.studentName));
  }

  mergeRosterWithRecords(
    roster: StudentAttendanceRow[],
    records: AttendanceRecord[],
  ): StudentAttendanceRow[] {
    const recordIndex = new Map<number, AttendanceRecord>();

    for (const record of records ?? []) {
      const studentId = Number(record.studentId);
      if (!studentId) {
        continue;
      }
      recordIndex.set(studentId, record);
    }

    return roster.map((row) => {
      const record = recordIndex.get(row.studentId);
      if (!record) {
        return row;
      }

      return {
        ...row,
        status: record.status,
        hours: this.normalizeHours(record.status, record.hours),
      };
    });
  }

  updateRowStatus(
    rows: StudentAttendanceRow[],
    studentId: number,
    status: AttendanceStatus,
  ): StudentAttendanceRow[] {
    return rows.map((row) =>
      row.studentId === studentId
        ? {
            ...row,
            status,
            hours: this.normalizeHours(status, row.hours),
          }
        : row,
    );
  }

  updateRowHours(
    rows: StudentAttendanceRow[],
    studentId: number,
    hours: number | null | undefined,
  ): StudentAttendanceRow[] {
    return rows.map((row) =>
      row.studentId === studentId
        ? {
            ...row,
            hours: this.normalizeHours(row.status, hours),
          }
        : row,
    );
  }

  setAllStatuses(
    rows: StudentAttendanceRow[],
    status: AttendanceStatus,
  ): StudentAttendanceRow[] {
    return rows.map((row) => ({
      ...row,
      status,
      hours: this.normalizeHours(status, row.hours),
    }));
  }

  buildSavePayload(params: {
    classId: number;
    classes: Class[];
    date: string;
    rows: StudentAttendanceRow[];
  }): SaveDailyAttendancePayload {
    const className =
      params.classes.find((item) => Number(item.id) === params.classId)
        ?.nameClasse ?? 'Classe';

    return {
      classId: params.classId,
      className,
      date: params.date,
      entries: params.rows.map((row) => ({
        studentId: row.studentId,
        studentName: row.studentName,
        status: row.status,
        hours: this.normalizeHours(row.status, row.hours),
      })),
    };
  }

  computeDailyStats(rows: StudentAttendanceRow[]): DailyAttendanceStats {
    const totalStudents = rows.length;
    const presentCount = rows.filter((row) => row.status === 'PRESENT').length;
    const absentCount = rows.filter((row) => row.status === 'ABSENT').length;
    const lateCount = rows.filter((row) => row.status === 'LATE').length;
    const impactedHours = rows
      .filter((row) => row.status !== 'PRESENT')
      .reduce(
        (total, row) => total + this.normalizeHours(row.status, row.hours),
        0,
      );

    return {
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      impactedHours,
    };
  }

  formatDateLabel(dateValue: string | null | undefined): string {
    if (!dateValue) {
      return '';
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  normalizeHours(status: AttendanceStatus, hours: number | null | undefined): number {
    if (status === 'PRESENT') {
      return 0;
    }

    const parsed = Number(hours ?? 0);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return 1;
    }

    return parsed;
  }
}
