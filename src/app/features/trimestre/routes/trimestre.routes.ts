import { Routes } from '@angular/router';

export const TrimestreRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("../presentation/list/trimestre-list.component").then(
        (m) => m.TrimestreListComponent
      ),
  },
  {
    path: "new",
    loadComponent: () =>
      import("../presentation/create/trimestre-create.component").then(
        (m) => m.TrimestrecreateComponent
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("../presentation/create/trimestre-create.component").then(
        (m) => m.TrimestrecreateComponent
      ),
  },
];

 
