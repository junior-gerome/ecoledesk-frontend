import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./presentation/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./presentation/register/register.component").then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import("./presentation/forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: "reset-password",
    loadComponent: () =>
      import("./presentation/reset-password/reset-password.component").then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
];
