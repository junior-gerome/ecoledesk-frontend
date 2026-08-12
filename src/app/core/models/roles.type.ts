export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ENSEIGNANT' | 'ELEVE' | 'AGENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface AuthenticatedUserProfile {
  id: number;
  username?: string;
  email?: string;
  firstName: string;
  lastName: string;
  roleType: UserRole;
  status?: UserStatus;
  permissions?: string[];
  avatarUrl?: string | null;
}
