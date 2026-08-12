import { Routes } from "@angular/router";

export const MontantRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./presentation/montant.component").then((m) => m.MontantComponent),
  },
  {
    path: "montant",
    redirectTo: "",
    pathMatch: "full",
  },
  {
    path: ":id",
    loadComponent: () => import("./presentation/montant.component").then((m) => m.MontantComponent),
  },
];

export const MotantRoutes = MontantRoutes;
