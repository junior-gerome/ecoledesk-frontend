import { HttpClient } from "@angular/common/http";
import { HttpContext } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Trimestre } from "@app/features/trimestre/domain/models";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { SILENT_REQUEST } from "@app/core/interceptors/http-context-tokens";

@Injectable({
  providedIn: "root",
})
export class TrimestreService {
  private readonly baseUrl = `${environment.apiUrl}/trimestre`;
  private readonly http = inject(HttpClient);

  constructor() {}

  createTrimestre(createtrim: Trimestre): Observable<Trimestre> {
    return this.http.post<Trimestre>(this.baseUrl, createtrim);
  }

  getAll(): Observable<Trimestre[]> {
    return this.http.get<Trimestre[]>(this.baseUrl);
  }

  getById(id: number): Observable<Trimestre> {
    return this.http.get<Trimestre>(`${this.baseUrl}/${id}`);
  }

  update(id: number, trimes: Trimestre): Observable<Trimestre> {
    return this.http.put<Trimestre>(`${this.baseUrl}/${id}`, trimes);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  getAnneeScolaireActive(): Observable<AnneeScolaire> {
    return this.http.get<AnneeScolaire>(
      `${environment.apiUrl}/academic-year/active`,
      { context: new HttpContext().set(SILENT_REQUEST, true) },
    );
  }
}
