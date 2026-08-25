import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Class } from '@app/features/classes/domain/models';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { ClassListRepository } from '../domain/repositories/class-list.repository';

@Injectable()
export class ClassListRepositoryAdapter implements ClassListRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/classes`;

  getAll(academicYearId?: number): Observable<Class[]> {
    const params = academicYearId ? new HttpParams().set('academicYearId', academicYearId) : undefined;
    return this.http.get<Class[]>(this.apiUrl, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
