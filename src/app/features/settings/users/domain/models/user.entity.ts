export type UserRole = 'ADMIN' | 'AGENT' | 'ENSEIGNANT' | 'PARENT' | 'ELEVE';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface UserEntity {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleType: UserRole;
  status: UserStatus;
  permissions: string[];
  createdAt?: string;
  lastLoginAt?: string;
}

export interface UserWritePayload {
  firstName: string;
  lastName: string;
  email: string;
  roleType: UserRole;
  status: UserStatus;
  permissions: string[];
  password?: string;
}

export interface UserFilters {
  search: string;
  roleType: UserRole | null;
  status: UserStatus | null;
}

export interface PermissionDef {
  key: string;
  label: string;
  description: string;
  group: string;
}

export interface PermissionGroup {
  group: string;
  items: PermissionDef[];
}
