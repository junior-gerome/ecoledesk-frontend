import { Routes } from "@angular/router";

export const REPORTS_ROUTES: Routes = [
  {
    path: "performance",
    loadComponent: () =>
      import("./presentation/performance/performance-report.component").then(
        (m) => m.PerformanceReportComponent,
      ),
  },
  {
    path: "financial",
    loadComponent: () =>
      import("./presentation/financial/financial-report.component").then(
        (m) => m.FinancialReportComponent,
      ),
  },
  {
    path: "documents",
    loadComponent: () =>
      import("./presentation/documents/school-documents.component").then(
        (m) => m.SchoolDocumentsComponent,
      ),
  },
  {
    path: "",
    redirectTo: "performance",
    pathMatch: "full",
  },
];
