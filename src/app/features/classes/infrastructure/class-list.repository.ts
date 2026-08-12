import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Class } from '@app/features/classes/domain/models';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { ClassListRepository } from '../domain/repositories/class-list.repository';

@Injectable()
export class ClassListRepositoryAdapter implements ClassListRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/classes`;

  getAll(): Observable<Class[]> {
    return this.http.get<Class[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
