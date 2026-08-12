import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { Montant } from "../domain/models";

@Injectable({
  providedIn: "root",
})
export class MontantService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/montant`;

  constructor() {}

  getAllMontant(): Observable<Montant[]> {
    return this.http.get<Montant[]>(this.apiUrl);
  }

  getMontant(id: number): Observable<Montant> {
    return this.http.get<Montant>(`${this.apiUrl}/${id}`);
  }

  getMontantByClassIdAndTypePaiement(
    classId: number,
    typePaiement: string,
  ): Observable<Montant> {
    const params = new HttpParams()
      .set("classeRoomId", classId.toString())
      .set("typePaiement", typePaiement);
    return this.http.get<Montant>(`${this.apiUrl}/by-class-and-type`, {
      params,
    });
  }

  getMontantByClassId(classId: number): Observable<Montant> {
    return this.http.get<Montant>(`${this.apiUrl}/class/${classId}`);
  }

  createMontant(montant: Montant): Observable<Montant> {
    return this.http.post<Montant>(this.apiUrl, montant);
  }

  deleteMontant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateMontant(id: number, montant: Montant): Observable<Montant> {
    return this.http.put<Montant>(`${this.apiUrl}/${id}`, montant);
  }
}
