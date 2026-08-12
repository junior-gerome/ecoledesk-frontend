import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { API_ENDPOINTS } from "@app/core/configuration/api-endpoints.config";
import { SaveDailyAttendancePayload } from "@app/features/attendance/domain/models";
import { Class } from "@app/features/classes/domain/models";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Inscription } from "@app/features/inscriptionstudent/domain/models";
import { Section } from "@app/features/section/domain/models";

import { map } from "rxjs";
import { DailyAttendanceRepository } from "../domain/repositories/daily-attendance.repository";
import { mapAttendanceRecords } from "./attendance-api.mapper";

@Injectable()
export class DailyAttendanceRepositoryAdapter extends DailyAttendanceRepository {
  private readonly http = inject(HttpClient);

  override getSections() {
    return this.http.get<Section[]>(
      `${API_ENDPOINTS.baseUrls.main}/section`, // Consider creating a SectionRepository for this
    );
  }

  override getClassesBySection(sectionId: number) {
    return this.http.get<Class[]>(
      API_ENDPOINTS.classes.bySection(sectionId),
    );
  }

  override getActiveSchoolYear() {
    return this.http.get<AnneeScolaire>(
      API_ENDPOINTS.schoolYear.active,
    );
  }

  override getInscriptionsByClass(
    classId: number,
    schoolYearId?: number | null,
  ) {
    let params = new HttpParams();
    const yearId = Number(schoolYearId);
    if (yearId) {
      params = params.set("anneeScolaireId", String(yearId));
    }

    return this.http.get<Inscription[]>(
      API_ENDPOINTS.inscription.byClass(classId),
      { params },
    );
  }

  override getDailyRecords(
    classId: number,
    date: string,
    schoolYearId?: number | null,
  ) {
    let params = new HttpParams().set("classId", String(classId)).set("date", date);
    if (schoolYearId) {
      params = params.set("anneeScolaireId", String(schoolYearId));
    }
    return this.http
      .get<unknown>(API_ENDPOINTS.attendance.records, { params })
      .pipe(map((records) => mapAttendanceRecords(records)));
  }

  override saveDailyAttendance(payload: SaveDailyAttendancePayload) {
    return this.http
      .post<unknown>(API_ENDPOINTS.attendance.daily, payload)
      .pipe(map((records) => mapAttendanceRecords(records)));
  }
}

