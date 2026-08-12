import { Routes } from "@angular/router";
import { TEACHER_REPOSITORY } from "./domain/repositories/teacher.repository";
import { TeacherRepositoryAdapter } from "./infrastructure/teacher.repository";

const TEACHER_ROUTE_PROVIDERS = [
  { provide: TEACHER_REPOSITORY, useClass: TeacherRepositoryAdapter },
];

export const TEACHERS_ROUTES: Routes = [
  {
    path: "",
    providers: TEACHER_ROUTE_PROVIDERS,
    loadComponent: () =>
      import("./presentation/list/teacher-list.component").then(
        (m) => m.TeacherListComponent
      ),
  },
  {
    path: "new",
    providers: TEACHER_ROUTE_PROVIDERS,
    loadComponent: () =>
      import("./presentation/form/teacher-form.component").then(
        (m) => m.TeacherFormComponent
      ),
  },
  {
    path: "subjects",
    providers: TEACHER_ROUTE_PROVIDERS,
    loadComponent: () =>
      import("./presentation/teacher-subjects/teacher-subjects.component").then(
        (m) => m.TeacherSubjectsComponent
      ),
  },
  {
    path: "schedule",
    providers: TEACHER_ROUTE_PROVIDERS,
    loadComponent: () =>
      import("./presentation/teacher-schedule/teacher-schedule.component").then(
        (m) => m.TeacherScheduleComponent
      ),
  },
  {
    path: "form",
    redirectTo: "new",
    pathMatch: "full",
  },
  {
    path: ":id",
    providers: TEACHER_ROUTE_PROVIDERS,
    loadComponent: () =>
      import("./presentation/form/teacher-form.component").then(
        (m) => m.TeacherFormComponent
      ),
  },
];
