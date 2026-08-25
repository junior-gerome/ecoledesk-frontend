import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  StaffAssignmentCreateRequest,
  StaffAssignmentFull,
  StaffAssignmentMedium,
  StaffMemberBasic,
  StaffMemberCreateRequest,
  StaffMemberFull,
  StaffMemberMedium,
  StaffPositionOption,
} from '../models/staff.model';

export interface StaffRepository {
  getAllMedium(): Observable<StaffMemberMedium[]>;
  getAllBasic(): Observable<StaffMemberBasic[]>;
  getById(id: number): Observable<StaffMemberFull>;
  create(request: StaffMemberCreateRequest): Observable<StaffMemberFull>;
  update(id: number, request: StaffMemberCreateRequest): Observable<StaffMemberFull>;
  deactivate(id: number): Observable<void>;
  count(): Observable<number>;
  getAssignmentsByMember(staffMemberId: number): Observable<StaffAssignmentMedium[]>;
  createAssignment(request: StaffAssignmentCreateRequest): Observable<StaffAssignmentFull>;
  closeAssignment(id: number): Observable<StaffAssignmentFull>;
  getPositions(): Observable<StaffPositionOption[]>;
  getTeachers(): Observable<StaffMemberBasic[]>;
}

export const STAFF_REPOSITORY = new InjectionToken<StaffRepository>('STAFF_REPOSITORY');
