import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { map, Observable } from 'rxjs';
import {
  TeacherEntity,
  TeacherScheduleItem,
  TeacherSubjectAssignment,
} from '../domain/models';
import { TeacherRepository } from '../domain/repositories/teacher.repository';

/** The backend exposes the legacy `adress` field; keep it at the HTTP boundary. */
interface TeacherApiDto extends Omit<TeacherEntity, 'address'> {
  adress?: string;
}

@Injectable()
export class TeacherRepositoryAdapter implements TeacherRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/teachers`;

  getAll(): Observable<TeacherEntity[]> {
    return this.http
      .get<TeacherApiDto[]>(this.apiUrl)
      .pipe(map((teachers) => teachers.map((teacher) => this.fromApi(teacher))));
  }

  getTeacher(id: number): Observable<TeacherEntity> {
    return this.http
      .get<TeacherApiDto>(`${this.apiUrl}/${id}`)
      .pipe(map((teacher) => this.fromApi(teacher)));
  }

  getTotalTeachers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  getSubjects(teacherId?: number | null): Observable<TeacherSubjectAssignment[]> {
    return this.http.get<TeacherSubjectAssignment[]>(`${this.apiUrl}/subjects`, {
      params: this.teacherParams(teacherId),
    });
  }

  getSchedule(teacherId?: number | null): Observable<TeacherScheduleItem[]> {
    return this.http.get<TeacherScheduleItem[]>(`${this.apiUrl}/schedule`, {
      params: this.teacherParams(teacherId),
    });
  }

  create(teacher: TeacherEntity): Observable<TeacherEntity> {
    return this.http
      .post<TeacherApiDto>(this.apiUrl, this.toApi(teacher))
      .pipe(map((createdTeacher) => this.fromApi(createdTeacher)));
  }

  update(id: number, teacher: TeacherEntity): Observable<TeacherEntity> {
    return this.http
      .put<TeacherApiDto>(`${this.apiUrl}/${id}`, this.toApi(teacher))
      .pipe(map((updatedTeacher) => this.fromApi(updatedTeacher)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private teacherParams(teacherId?: number | null): HttpParams {
    return teacherId ? new HttpParams().set('teacherId', String(teacherId)) : new HttpParams();
  }

  private toApi(teacher: TeacherEntity): TeacherApiDto {
    const { address, ...payload } = teacher;
    return { ...payload, adress: address ?? '' };
  }

  private fromApi(teacher: TeacherApiDto): TeacherEntity {
    const { adress, ...payload } = teacher;
    return { ...payload, address: adress ?? '' };
  }
}
