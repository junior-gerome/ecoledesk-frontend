import { AttendanceRecord, SaveDailyAttendancePayload } from "@app/features/attendance/domain/models";
import { Class } from "@app/features/classes/domain/models";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Inscription } from "@app/features/inscriptionstudent/domain/models";
import { Section } from "@app/features/section/domain/models";
import { Observable } from "rxjs";

export abstract class DailyAttendanceRepository {
  abstract getSections(): Observable<Section[]>;
  abstract getClassesBySection(sectionId: number): Observable<Class[]>;
  abstract getActiveSchoolYear(): Observable<AnneeScolaire>;
  abstract getInscriptionsByClass(
    classId: number,
    schoolYearId?: number | null,
  ): Observable<Inscription[]>;
  abstract getDailyRecords(
    classId: number,
    date: string,
    schoolYearId?: number | null,
  ): Observable<AttendanceRecord[]>;
  abstract saveDailyAttendance(
    payload: SaveDailyAttendancePayload,
  ): Observable<AttendanceRecord[]>;
}
