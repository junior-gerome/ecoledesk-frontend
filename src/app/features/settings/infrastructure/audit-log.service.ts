import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { AuditLog } from "../domain/audit-log.model";

@Injectable({
  providedIn: "root",
})
export class AuditLogService {
  private readonly http = inject(HttpClient);

  getRecentLogs(limit = 50): Observable<AuditLog[]> {
    const params = new HttpParams().set("limit", limit);
    return this.http.get<AuditLog[]>(`${environment.apiUrl}/audit/logs`, { params });
  }
}
