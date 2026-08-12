import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { map, Observable } from 'rxjs';
import {
  UserEntity,
  UserFilters,
  UserStatus,
  UserWritePayload,
} from '../domain/models/user.entity';
import { UserManagementRepository } from '../domain/repositories/user-management.repository';

// Local API models to decouple from a global core service
type ApiUser = UserEntity;
type ApiUserCreatePayload = UserWritePayload;

@Injectable()
export class UserManagementRepositoryAdapter implements UserManagementRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAll(filters?: Partial<UserFilters>): Observable<UserEntity[]> {
    let params = new HttpParams();

    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.roleType) params = params.set('roleType', filters.roleType);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<ApiUser[]>(this.apiUrl, { params }).pipe(
      map((users) => (users ?? []).map((user) => this.fromApi(user))),
    );
  }

  create(payload: UserWritePayload): Observable<UserEntity> {
    return this.http.post<ApiUser>(this.apiUrl, this.toApiPayload(payload)).pipe(
      map((created) => this.fromApi(created)),
    );
  }

  update(id: number, payload: UserWritePayload): Observable<UserEntity> {
    return this.http.put<ApiUser>(`${this.apiUrl}/${id}`, this.toApiPayload(payload)).pipe(
      map((updated) => this.fromApi(updated)),
    );
  }

  updateStatus(id: number, status: UserStatus): Observable<UserEntity> {
    return this.http.patch<ApiUser>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map((updated) => this.fromApi(updated)),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private fromApi(user: ApiUser): UserEntity {
    return {
      id: Number(user.id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleType: user.roleType,
      status: user.status,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  private toApiPayload(payload: UserWritePayload): ApiUserCreatePayload {
    return {
      ...payload,
      permissions: payload.permissions ?? [],
    };
  }
}
