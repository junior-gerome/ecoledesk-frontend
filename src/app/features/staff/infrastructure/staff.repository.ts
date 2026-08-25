import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  StaffAssignmentCreateRequest,
  StaffAssignmentFull,
  StaffAssignmentMedium,
  StaffMemberBasic,
  StaffMemberCreateRequest,
  StaffMemberFull,
  StaffMemberMedium,
  StaffPositionOption,
} from '../domain/models/staff.model';
import { StaffRepository } from '../domain/repositories/staff.repository';

@Injectable()
export class StaffRepositoryAdapter implements StaffRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/staff`;

  getAllMedium(): Observable<StaffMemberMedium[]> {
    return this.http.get<StaffMemberMedium[]>(`${this.baseUrl}/members`);
  }

  getAllBasic(): Observable<StaffMemberBasic[]> {
    return this.http.get<StaffMemberBasic[]>(`${this.baseUrl}/members/basic`);
  }

  getById(id: number): Observable<StaffMemberFull> {
    return this.http.get<StaffMemberFull>(`${this.baseUrl}/members/${id}`);
  }

  create(request: StaffMemberCreateRequest): Observable<StaffMemberFull> {
    return this.http.post<StaffMemberFull>(`${this.baseUrl}/members`, request);
  }

  update(id: number, request: StaffMemberCreateRequest): Observable<StaffMemberFull> {
    return this.http.put<StaffMemberFull>(`${this.baseUrl}/members/${id}`, request);
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/members/${id}`);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/members/count`);
  }

  getAssignmentsByMember(staffMemberId: number): Observable<StaffAssignmentMedium[]> {
    return this.http.get<StaffAssignmentMedium[]>(`${this.baseUrl}/assignments/member/${staffMemberId}`);
  }

  createAssignment(request: StaffAssignmentCreateRequest): Observable<StaffAssignmentFull> {
    return this.http.post<StaffAssignmentFull>(`${this.baseUrl}/assignments`, request);
  }

  closeAssignment(id: number): Observable<StaffAssignmentFull> {
    return this.http.patch<StaffAssignmentFull>(`${this.baseUrl}/assignments/${id}/close`, {});
  }

  getPositions(): Observable<StaffPositionOption[]>{
    return this.http.get<StaffPositionOption[]>(`${this.baseUrl}/assignments/positions`);
  }

  getTeachers(): Observable<StaffMemberBasic[]> {
    return this.http.get<StaffMemberBasic[]>(`${this.baseUrl}/members/teachers`);
  }
}

