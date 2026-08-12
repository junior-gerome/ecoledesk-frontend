import { Routes } from "@angular/router";

export const SUPPORT_ROUTES: Routes = [
  {
    path: "helpcenter",
    loadComponent: () =>
      import("./presentation/help-center/help-center.component").then(
        (m) => m.HelpCenterComponent,
      ),
  },
  {
    path: "contact",
    loadComponent: () =>
      import("./presentation/contact/support-contact.component").then(
        (m) => m.SupportContactComponent,
      ),
  },
  {
    path: "",
    redirectTo: "helpcenter",
    pathMatch: "full",
  },
];
