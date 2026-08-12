import { Routes } from "@angular/router";
import { GRADES_FEATURE_PROVIDERS } from "./grades-config";
import { BulletinPageComponent } from "./presentation/bulletin/bulletin-page.component";
import { BulletinSelectorComponent } from "./presentation/bulletin/bulletin-selector.component";
import { GradeFormPageComponent } from "./presentation/grade-form/grade-form-page.component";
import { GradeListPageComponent } from "./presentation/grade-list/grade-list-page.component";
import { ClassReportComponent } from "./presentation/reports/class-report.component";

/**
 * Routes DDD modernes pour la feature grades
 */
export const GRADES_ROUTES: Routes = [
  {
    path: "",
    providers: GRADES_FEATURE_PROVIDERS,
    children: [
      {
        path: "",
        component: GradeListPageComponent,
      },
      {
        path: "form",
        component: GradeFormPageComponent,
      },
      {
        path: "new",
        redirectTo: "form",
        pathMatch: "full",
      },
      {
        path: "new-notes",
        redirectTo: "form",
        pathMatch: "full",
      },
      {
        path: "bulletin",
        component: BulletinSelectorComponent,
      },
      {
        path: "bulletin/:studentId",
        component: BulletinPageComponent,
      },
      {
        path: "class-report",
        component: ClassReportComponent,
      },
      {
        path: "edit/:id",
        redirectTo: "form",
        pathMatch: "full",
      },
    ],
  },
];
