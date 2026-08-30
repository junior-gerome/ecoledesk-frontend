import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { SubjectReponse, SubjectRequest } from "@app/features/subjects/domain/models";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SubjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subject`;

  getAllSubjects(): Observable<SubjectReponse[]> {
    return this.http.get<SubjectReponse[]>(this.baseUrl);
  }

  getSubject(id: number): Observable<SubjectReponse> {
    return this.http.get<SubjectReponse>(`${this.baseUrl}/${id}`);
  }

  createSubject(payload: SubjectRequest): Observable<SubjectRequest> {
    return this.http.post<SubjectRequest>(this.baseUrl, payload);
  }

  updateSubject(id: number, payload: SubjectReponse): Observable<SubjectReponse> {
    return this.http.put<SubjectReponse>(`${this.baseUrl}/${id}`, payload);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTotalSubjects(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  /**
   * Demande au backend de générer un code pour une matière.
   */
  generateSubjectCode(nameSubject: string): Observable<string> {
    const params = new HttpParams().set("nameSubject", nameSubject);

    return this.http.get<string>(
      `${this.baseUrl}/generate-code`,
      {
        params,
        responseType: "text" as "json",
      }
    );
  }
}
