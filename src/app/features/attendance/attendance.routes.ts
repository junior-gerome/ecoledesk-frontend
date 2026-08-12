import { Routes } from "@angular/router";

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "daily",
  },
  {
    path: "absence",
    loadComponent: () =>
      import("./presentation/absence/absence-tracking.component").then(
        (module) => module.AbsenceTrackingComponent,
      ),
  },
  {
    path: "justification",
    loadComponent: () =>
      import("./presentation/justification/justifications.component").then(
        (module) => module.JustificationsComponent,
      ),
  },
  {
    path: "daily",
    loadComponent: () =>
      import("./presentation/daily/daily-attendance.component").then(
        (module) => module.DailyAttendanceComponent,
      ),
  },
];
