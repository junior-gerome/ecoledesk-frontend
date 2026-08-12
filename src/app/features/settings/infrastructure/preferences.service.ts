import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { ThemeMode } from "@app/core/services/theme/theme.service";

export type WeekStart = "MONDAY" | "SUNDAY";
export type TimeFormat = "24h" | "12h";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export interface AppPreferences {
  schoolName: string;
  schoolCode: string;
  schoolEmail: string;
  schoolPhone: string;
  schoolWebsite: string;
  schoolAddress: string;
  language: string;
  timezone: string;
  currency: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  theme: ThemeMode;
  startOfWeek: WeekStart;
  pageSize: number;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyAbsence: boolean;
  notifyGrades: boolean;
  requireTwoFactor: boolean;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
}

@Injectable({
  providedIn: "root",
})
export class PreferencesService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/settings/preferences`;

  get(): Observable<AppPreferences> {
    return this.http.get<AppPreferences>(this.apiUrl);
  }

  update(payload: AppPreferences): Observable<AppPreferences> {
    return this.http.put<AppPreferences>(this.apiUrl, payload);
  }
}
