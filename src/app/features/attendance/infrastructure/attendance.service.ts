import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENDPOINTS } from "@app/core/configuration/api-endpoints.config";
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummaryRow,
  SaveDailyAttendancePayload,
} from "@app/features/attendance/domain/models";
import { map, Observable } from "rxjs";
import {
  mapAttendanceRecord,
  mapAttendanceRecords,
  mapAttendanceSummaryRows,
} from "./attendance-api.mapper";

export interface AttendanceRecordFilters {
  classId?: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  statuses?: AttendanceStatus[];
  justified?: boolean;
}

export interface AttendanceSummaryFilters {
  classId?: number;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable({
  providedIn: "root",
})
export class AttendanceService {
  private http = inject(HttpClient);

  getRecords(
    filters?: AttendanceRecordFilters,
  ): Observable<AttendanceRecord[]> {
    let params = new HttpParams();

    if (filters?.classId)
      params = params.set("classId", String(filters.classId));
    if (filters?.date) params = params.set("date", filters.date);
    if (filters?.dateFrom) params = params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params = params.set("dateTo", filters.dateTo);
    if (filters?.statuses?.length) {
      params = params.set("status", filters.statuses.join(","));
    }
    if (filters?.justified !== undefined) {
      params = params.set("justified", String(filters.justified));
    }

    return this.http
      .get<unknown>(API_ENDPOINTS.attendance.records, { params })
      .pipe(map((body) => mapAttendanceRecords(body)));
  }

  getDailyRecords(
    classId: number,
    date: string,
  ): Observable<AttendanceRecord[]> {
    return this.getRecords({ classId, date });
  }

  saveDailyAttendance(
    payload: SaveDailyAttendancePayload,
  ): Observable<AttendanceRecord[]> {
    return this.http
      .post<unknown>(API_ENDPOINTS.attendance.daily, payload)
      .pipe(map((body) => mapAttendanceRecords(body)));
  }

  updateJustification(
    recordId: number,
    justificationNote: string,
    justified: boolean,
  ): Observable<AttendanceRecord> {
    return this.http
      .patch<unknown>(API_ENDPOINTS.attendance.justification(recordId), {
        justificationNote: justificationNote.trim() || null,
        justified,
      })
      .pipe(map((body) => mapAttendanceRecord(body)));
  }

  removeRecord(recordId: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.attendance.record(recordId));
  }

  getSummary(
    filters?: AttendanceSummaryFilters,
  ): Observable<AttendanceSummaryRow[]> {
    let params = new HttpParams();

    if (filters?.classId)
      params = params.set("classId", String(filters.classId));
    if (filters?.dateFrom) params = params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params = params.set("dateTo", filters.dateTo);

    return this.http
      .get<unknown>(API_ENDPOINTS.attendance.summary, { params })
      .pipe(map((body) => mapAttendanceSummaryRows(body)));
  }
}
