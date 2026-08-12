import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { RbacService } from "@core/security/rbac.service";
import { AccessPolicy } from "@core/security/access-policy";

export const roleGuard: CanActivateFn = (route) => {
  const rbac = inject(RbacService);
  const router = inject(Router);
  const policy = route.data["accessPolicy"] as AccessPolicy | undefined;
  const allowedRoles = policy?.roles ?? route.data["roles"] as readonly string[] | undefined;

  if (!allowedRoles?.length) {
    return true;
  }

  return rbac.hasAnyRole(allowedRoles)
    ? true
    : router.createUrlTree(["/forbidden"]);
};

