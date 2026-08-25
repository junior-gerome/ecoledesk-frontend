import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  StaffMemberBasic,
  StaffMemberFull,
  StaffMemberMedium,
} from '@app/features/staff/domain/models/staff.model';
import {
  TeacherEntity,
  TeacherScheduleItem,
  TeacherSubjectAssignment,
} from '../domain/models';
import { TeacherRepository } from '../domain/repositories/teacher.repository';

interface TeacherApiDto extends Omit<TeacherEntity, 'address'> {
  adress?: string;
}

@Injectable()
export class TeacherRepositoryAdapter implements TeacherRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/teachers`;

  getAll(): Observable<TeacherEntity[]> {
    // Fetch teachers from the staff module
    return forkJoin({
      allStaff: this.http.get<StaffMemberMedium[]>(`${environment.apiUrl}/staff/members`).pipe(
        catchError(() => of([])),
      ),
      teachers: this.http.get<StaffMemberBasic[]>(`${environment.apiUrl}/staff/members/teachers`).pipe(
        catchError(() => of([])),
      ),
    }).pipe(
      map(({ allStaff, teachers }) => {
        if (teachers && teachers.length > 0) {
          const teacherIdSet = new Set(teachers.map((t) => t.id));
          const teachingStaff = allStaff.filter((s) => s.id && teacherIdSet.has(s.id));

          if (teachingStaff.length > 0) {
            return teachingStaff.map((staff) => ({
              id: staff.id,
              firstnameTeacher: staff.firstName,
              lastnameTeacher: staff.lastName,
              email: staff.email ?? '',
              phoneNumber: staff.phone ?? '',
              gender: staff.gender,
              speciality: staff.speciality ?? '',
              dateEmbauche: staff.employmentDate,
              niveau: staff.level ?? '',
              address: staff.address ?? '',
              photoUrl: staff.photoUrl,
            }));
          }

          return teachers.map((t) => ({
            id: t.id,
            firstnameTeacher: t.firstName,
            lastnameTeacher: t.lastName,
            email: '',
            phoneNumber: '',
            gender: t.gender,
            speciality: '',
            dateEmbauche: new Date().toISOString().split('T')[0],
            niveau: '',
            photoUrl: t.photoUrl,
          }));
        }
        return [];
      }),
      switchMap((staffTeachers) => {
        if (staffTeachers.length > 0) {
          return of(staffTeachers);
        }
        // Fallback to legacy endpoint if staff has no teachers yet
        return this.http
          .get<TeacherApiDto[]>(this.apiUrl)
          .pipe(
            map((legacy) => legacy.map((teacher) => this.fromApi(teacher))),
            catchError(() => of([])),
          );
      }),
    );
  }

  getTeacher(id: number): Observable<TeacherEntity> {
    return this.http.get<StaffMemberFull>(`${environment.apiUrl}/staff/members/${id}`).pipe(
      map((staff) => ({
        id: staff.id,
        firstnameTeacher: staff.firstName,
        lastnameTeacher: staff.lastName,
        email: staff.email ?? '',
        phoneNumber: staff.phone ?? '',
        gender: staff.gender,
        speciality: staff.speciality ?? '',
        dateEmbauche: staff.employmentDate,
        niveau: staff.level ?? '',
        address: staff.address ?? '',
        photoUrl: staff.photoUrl,
      })),
      catchError(() =>
        this.http
          .get<TeacherApiDto>(`${this.apiUrl}/${id}`)
          .pipe(map((teacher) => this.fromApi(teacher))),
      ),
    );
  }

  getTotalTeachers(): Observable<number> {
    return this.http
      .get<StaffMemberBasic[]>(`${environment.apiUrl}/staff/members/teachers`)
      .pipe(
        map((teachers) => teachers.length),
        catchError(() => this.http.get<number>(`${this.apiUrl}/count`)),
      );
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
    return this.http.delete<void>(`${environment.apiUrl}/staff/members/${id}`).pipe(
      catchError(() => this.http.delete<void>(`${this.apiUrl}/${id}`)),
    );
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
