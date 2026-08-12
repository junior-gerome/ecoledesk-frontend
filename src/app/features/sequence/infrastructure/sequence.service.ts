import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Sequence } from '@app/features/sequence/domain/models';
import { Trimestre } from '@app/features/trimestre/domain/models';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class SequenceService {
  private readonly baseUrl = `${environment.apiUrl}/sequence`;
  private readonly http = inject(HttpClient);

  constructor() {}

  createSequence(createSequence: Sequence): Observable<Sequence> {
    return this.http.post<Sequence>(this.baseUrl, createSequence);
  }

  getAll(): Observable<Sequence[]> {
    return this.http.get<Sequence[]>(this.baseUrl);
  }

  getByIdSequence(id: number): Observable<Sequence> {
    return this.http.get<Sequence>(`${this.baseUrl}/${id}`);
  }

  update(id: number, sequence: Sequence): Observable<Sequence> {
    return this.http.put<Sequence>(`${this.baseUrl}/${id}`, sequence);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTrimestre(): Observable<Trimestre[]> {
    return this.http.get<Trimestre[]>(`${environment.apiUrl}/trimestre`);
  }
}
