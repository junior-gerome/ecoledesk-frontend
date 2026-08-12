import { Routes } from '@angular/router';

export const SequenceRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("../presentation/list/sequence-list.component").then(
        (m) => m.SequenceListComponent
      ),
  },
  {
    path: "new",
    loadComponent: () =>
      import("../presentation/create/sequence-create.component").then(
        (m) => m.SequenceCreateComponent
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("../presentation/create/sequence-create.component").then(
        (m) => m.SequenceCreateComponent
      ),
  },
];

 
