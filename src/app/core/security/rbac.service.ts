import { Injectable, inject } from '@angular/core';
import {
  ROLE_PERMISSION_DEFAULTS,
  WILDCARD_PERMISSION,
} from '@core/constants/permissions.constants';
import { AuthenticatedUserProfile } from '@core/models/auth.models';
import { SessionService } from '@core/services/session.service';
import { AccessPolicy } from './access-policy';

type PermissionAwareProfile = AuthenticatedUserProfile & {
  permissions?: readonly string[];
};

@Injectable({ providedIn: 'root' })
export class RbacService {
  private readonly session = inject(SessionService);

  get profile(): PermissionAwareProfile | null {
    return this.session.getUserProfile() as PermissionAwareProfile | null;
  }

  hasRole(role: string): boolean {
    return this.profile?.roleType === role;
  }

  hasAnyRole(roles: readonly string[]): boolean {
    if (!roles.length) {
      return true;
    }
    const current = this.profile?.roleType;
    return !!current && roles.includes(current);
  }

  hasPermission(permission: string): boolean {
    if (this.hasRole('ADMIN')) {
      return true;
    }

    const normalizedPermission = this.normalizePermission(permission);
    const permissions = this.resolvePermissions();

    return (
      permissions.includes(WILDCARD_PERMISSION) ||
      permissions.includes(normalizedPermission)
    );
  }

  hasEveryPermission(permissions: readonly string[]): boolean {
    if (!permissions.length) {
      return true;
    }
    return permissions.every((permission) => this.hasPermission(permission));
  }

  canAccess(policy: AccessPolicy): boolean {
    if (policy.roles?.length && !this.hasAnyRole(policy.roles)) return false;
    const permissions = policy.permissions ?? [];
    return policy.requireAllPermissions === false
      ? permissions.some((permission) => this.hasPermission(permission))
      : this.hasEveryPermission(permissions);
  }

  private resolvePermissions(): readonly string[] {
    const explicitPermissions = (this.profile?.permissions ?? [])
      .map((permission) => this.normalizePermission(permission))
      .filter(Boolean);

    if (explicitPermissions.length) {
      return explicitPermissions;
    }

    const role = this.profile?.roleType;
    return role ? ROLE_PERMISSION_DEFAULTS[role] ?? [] : [];
  }

  private normalizePermission(permission: string): string {
    return permission.trim().replace('.', ':');
  }
}

