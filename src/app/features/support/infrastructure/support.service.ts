import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {
  HelpCenterData,
  SupportTicket,
  SupportTicketPayload,
} from "@app/features/support/domain/models";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class SupportService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/support`;

  getHelpCenter(): Observable<HelpCenterData> {
    return this.http.get<HelpCenterData>(`${this.apiUrl}/help-center`);
  }

  createTicket(payload: SupportTicketPayload): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(`${this.apiUrl}/tickets`, payload);
  }
}
