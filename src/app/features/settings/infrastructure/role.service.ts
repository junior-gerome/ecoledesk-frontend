import { Injectable } from "@angular/core";
import { UserRole } from "../users/domain/models/user.entity";

@Injectable({ providedIn: "root" })
export class RoleService {
  readonly roles: readonly UserRole[] = [
    "ADMIN",
    "AGENT",
    "ENSEIGNANT",
    "PARENT",
    "ELEVE",
  ];

  isKnownRole(role: string): role is UserRole {
    return this.roles.includes(role as UserRole);
  }
}
