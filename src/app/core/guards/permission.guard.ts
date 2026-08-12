import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { RbacService } from "@core/security/rbac.service";
import { AccessPolicy } from "@core/security/access-policy";

export const permissionGuard: CanActivateFn = (route) => {
  const rbac = inject(RbacService);
  const router = inject(Router);
  const policy = route.data["accessPolicy"] as AccessPolicy | undefined;
  const requiredPermissions = policy?.permissions ?? route.data["permissions"] as
    | readonly string[]
    | undefined;

  if (!requiredPermissions?.length) {
    return true;
  }

  const allowed = policy?.requireAllPermissions === false
    ? requiredPermissions.some((permission) => rbac.hasPermission(permission))
    : rbac.hasEveryPermission(requiredPermissions);

  return allowed
    ? true
    : router.createUrlTree(["/forbidden"]);
};

