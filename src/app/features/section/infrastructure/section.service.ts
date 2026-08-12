import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Section } from "@app/features/section/domain/models";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SectionService {
  private readonly baseUrl = `${environment.apiUrl}/section`;
  private readonly http = inject(HttpClient);

  constructor() {}
  createSection(sectionToCreate: Section): Observable<Section> {
    return this.http.post<Section>(this.baseUrl, sectionToCreate);
  }

  getAll(): Observable<Section[]> {
    return this.http.get<Section[]>(this.baseUrl);
  }

  getByIdSection(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.baseUrl}/${id}`);
  }

  update(id: number, sectionData: Section): Observable<Section> {
    return this.http.put<Section>(`${this.baseUrl}/${id}`, sectionData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  getAnneeScolaireActive(): Observable<AnneeScolaire> {
    return this.http.get<AnneeScolaire>(
      `${environment.apiUrl}/annees-scolaires/active`,
    );
  }
}
