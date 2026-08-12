import { Routes } from '@angular/router';

export const SectionRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./presentation/section.component").then((m) => m.SectionComponent),
  },
  {
    path: "section",
    redirectTo: "",
    pathMatch: "full",
  },
  {
    path: ":id",
    loadComponent: () => import("./presentation/section.component").then((m) => m.SectionComponent),
  },
];
