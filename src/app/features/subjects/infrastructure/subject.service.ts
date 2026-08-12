import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { subject } from "@app/features/subjects/domain/models";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SubjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subject`;

  getAllSubjects(): Observable<subject[]> {
    return this.http.get<subject[]>(this.baseUrl);
  }

  getSubject(id: number): Observable<subject> {
    return this.http.get<subject>(`${this.baseUrl}/${id}`);
  }

  createSubject(payload: subject): Observable<subject> {
    return this.http.post<subject>(this.baseUrl, payload);
  }

  updateSubject(id: number, payload: subject): Observable<subject> {
    return this.http.put<subject>(`${this.baseUrl}/${id}`, payload);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTotalSubjects(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }
}
