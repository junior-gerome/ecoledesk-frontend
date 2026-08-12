import { Routes } from "@angular/router";

export const SETTINGS_ROUTES: Routes = [
  {
    path: "users",
    loadComponent: () =>
      import("./presentation/users/user-management.component").then(
        (m) => m.UserManagementComponent,
      ),
  },
  {
    path: "preferences",
    loadComponent: () =>
      import("./presentation/preferences/preferences.component").then(
        (m) => m.PreferencesComponent,
      ),
  },
  {
    path: "audit",
    loadComponent: () =>
      import("./presentation/audit/audit-log.component").then(
        (m) => m.AuditLogComponent,
      ),
  },
  {
    path: "",
    redirectTo: "users",
    pathMatch: "full",
  },
];
