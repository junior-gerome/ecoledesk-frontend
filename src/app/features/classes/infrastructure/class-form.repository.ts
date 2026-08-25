import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { Class } from '@app/features/classes/domain/models';
import { Section } from '@app/features/section/domain/models';
import { StaffMemberBasic } from '@app/features/staff/domain/models/staff.model';
import { environment } from '@environments/environment';
import { ClassFormRepository } from '../domain/repositories/class-form.repository';
import { SILENT_REQUEST } from '@app/core/interceptors/http-context-tokens';

@Injectable()
export class ClassFormRepositoryAdapter extends ClassFormRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/classes`;

  override getSections() {
    return this.http.get<Section[]>(`${environment.apiUrl}/section`);
  }

  override getTeachers() {
    // GET /api/staff/members/teachers — returns StaffMemberBasicDTO[] for active TEACHER assignments
    return this.http.get<StaffMemberBasic[]>(`${environment.apiUrl}/staff/members/teachers`);
  }

  override getActiveAcademicYear() {
    return this.http.get<AnneeScolaire>(
      `${environment.apiUrl}/academic-year/active`,
      { context: new HttpContext().set(SILENT_REQUEST, true) },
    );
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
