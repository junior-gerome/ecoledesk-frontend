import { Injectable } from "@angular/core";
import {
  ROLE_PERMISSION_DEFAULTS,
  WILDCARD_PERMISSION,
} from "@app/core/constants/permissions.constants";
import { UserRole } from "../users/domain/models/user.entity";

@Injectable({ providedIn: "root" })
export class PermissionService {
  getPermissionsForRole(role: UserRole): readonly string[] {
    return ROLE_PERMISSION_DEFAULTS[role] ?? [];
  }

  hasPermission(role: UserRole, permission: string): boolean {
    const permissions = this.getPermissionsForRole(role);
    const normalizedPermission = permission.trim().replace(".", ":");
    return (
      permissions.includes(WILDCARD_PERMISSION) ||
      permissions.includes(normalizedPermission)
    );
  }
}
