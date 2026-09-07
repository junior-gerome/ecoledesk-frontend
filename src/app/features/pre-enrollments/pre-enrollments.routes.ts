import { Routes } from '@angular/router';

export const PRE_ENROLLMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './presentation/pages/pre-enrollment-list-page.component'
      ).then((m) => m.PreEnrollmentListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import(
        './presentation/pages/pre-enrollment-wizard-page.component'
      ).then((m) => m.PreEnrollmentWizardPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './presentation/pages/pre-enrollment-detail-page.component'
      ).then((m) => m.PreEnrollmentDetailPageComponent),
  },
];
