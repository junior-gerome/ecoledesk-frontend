import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AnneeScolaireService {
  private readonly apiUrl = `${environment.apiUrl}/academic-year`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<AnneeScolaire[]> {
    return this.http.get<AnneeScolaire[]>(this.apiUrl);
  }

  create(annee: AnneeScolaire): Observable<AnneeScolaire> {
    return this.http.post<AnneeScolaire>(this.apiUrl, annee);
  }

  activate(id: number): Observable<AnneeScolaire> {
    return this.http.put<AnneeScolaire>(`${this.apiUrl}/${id}/activate`, {});
  }

  getById(id: number): Observable<AnneeScolaire> {
    return this.http.get<AnneeScolaire>(`${this.apiUrl}/${id}`);
  }
}
