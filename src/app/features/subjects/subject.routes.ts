import { Routes } from '@angular/router';

export const SubjectRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./presentation/list/subject-list.component").then(
        (m) => m.SubjectListComponent
      ),
  },

  {
    path: "new",
    loadComponent: () =>
      import("./presentation/create/subject-create.component").then(
        (m) => m.SubjectCreateComponent
      ),
  },

  {
    path: ":id",
    loadComponent: () =>
      import("./presentation/create/subject-create.component").then(
        (m) => m.SubjectCreateComponent
      ),
  },
];

