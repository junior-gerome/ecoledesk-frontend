import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "list",
  },
  {
    path: "list",
    loadComponent: () =>
      import("./presentation/receipts/payment-receipt-management.component").then(
        (module) => module.PaymentReceiptManagementComponent,
      ),
  },
  {
    path: "receipts",
    loadComponent: () =>
      import("./presentation/receipts/payment-receipt-management.component").then(
        (module) => module.PaymentReceiptManagementComponent,
      ),
  },
  {
    path: "new",
    loadComponent: () =>
      import("./presentation/form/payment-form.component").then(
        (module) => module.PaymentFormComponent,
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./presentation/form/payment-form.component").then(
        (module) => module.PaymentFormComponent,
      ),
  },
];
