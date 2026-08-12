import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { Class } from '@app/features/classes/domain/models';
import { Section } from '@app/features/section/domain/models';
import { Teacher } from '@app/features/teachers/domain/models';
import { environment } from '@environments/environment';
import { ClassFormRepository } from '../domain/repositories/class-form.repository';

@Injectable()
export class ClassFormRepositoryAdapter extends ClassFormRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/classes`;

  override getSections() {
    return this.http.get<Section[]>(`${environment.apiUrl}/section`);
  }

  override getTeachers() {
    return this.http.get<Teacher[]>(`${environment.apiUrl}/teachers`);
  }

  override getActiveAcademicYear() {
    return this.http.get<AnneeScolaire>(`${environment.apiUrl}/annees-scolaires/active`);
  }

  override getClassById(id: number) {
    return this.http.get<Class>(`${this.baseUrl}/${id}`);
  }

  override createClass(classroom: Class) {
    return this.http.post<Class>(this.baseUrl, classroom);
  }

  override updateClass(id: number, classroom: Class) {
    return this.http.put<Class>(`${this.baseUrl}/${id}`, { ...classroom, id });
  }
}
