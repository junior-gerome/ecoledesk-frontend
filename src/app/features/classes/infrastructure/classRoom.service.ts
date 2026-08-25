// src/app/core/services/classe/classRoom.service.ts
import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { SILENT_REQUEST } from "@app/core/interceptors/http-context-tokens";

import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Class } from "@app/features/classes/domain/models";
import { Section } from "@app/features/section/domain/models";
import { StaffMemberBasic } from "@app/features/staff/domain/models/staff.model";
import { environment } from "@environments/environment";

// import { Student } from '@app/models/student/student.interface';


@Injectable({
  providedIn: "root",
})
export class ClassRoomService {
  private readonly baseUrl = `${environment.apiUrl}/classes`;
  private readonly http = inject(HttpClient);

  createClass(classToCreate: Class): Observable<Class> {
    return this.http.post<Class>(this.baseUrl, classToCreate);
  }

  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${environment.apiUrl}/section`);
  }

  getTeachers(): Observable<StaffMemberBasic[]> {
    return this.http.get<StaffMemberBasic[]>(`${this.baseUrl}/teachers`);
  }

  getTotalClass(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  getAnneeScolaireActive(): Observable<AnneeScolaire> {
    return this.http.get<AnneeScolaire>(
      `${environment.apiUrl}/academic-year/active`,
      { context: new HttpContext().set(SILENT_REQUEST, true) },
    );
  }

  getAll(academicYearId?: number): Observable<Class[]> {
    const params = academicYearId ? new HttpParams().set("academicYearId", academicYearId) : undefined;
    return this.http.get<Class[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Class> {
    return this.http.get<Class>(`${this.baseUrl}/${id}`);
  }

  update(id: number, classData: Class): Observable<Class> {
    const payload = { ...classData, id };
    return this.http.put<Class>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  getAvailableTeachers(): Observable<StaffMemberBasic[]> {
    return this.http.get<StaffMemberBasic[]>(`${this.baseUrl}/teachers/available`);
  }

  assignTeacher(classId: number, teacherId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${classId}/teacher/${teacherId}`,
      {},
    );
  }

  removeTeacher(classId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${classId}/teacher`);
  }

  getClassesBySection(sectionId: number, academicYearId?: number): Observable<Class[]> {
    const params = academicYearId ? new HttpParams().set("academicYearId", academicYearId) : undefined;
    return this.http.get<Class[]>(`${this.baseUrl}/by-section/${sectionId}`, { params });
  }
}
