import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  UserEntity,
  UserFilters,
  UserStatus,
  UserWritePayload,
} from '../models/user.entity';

export interface UserManagementRepository {
  getAll(filters?: Partial<UserFilters>): Observable<UserEntity[]>;
  create(payload: UserWritePayload): Observable<UserEntity>;
  update(id: number, payload: UserWritePayload): Observable<UserEntity>;
  updateStatus(id: number, status: UserStatus): Observable<UserEntity>;
  delete(id: number): Observable<void>;
}

export const USER_MANAGEMENT_REPOSITORY = new InjectionToken<UserManagementRepository>(
  'USER_MANAGEMENT_REPOSITORY',
);
