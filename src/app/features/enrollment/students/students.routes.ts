import { Routes } from '@angular/router';

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/student-page.component').then(
        (module) => module.StudentPageComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./presentation/pages/student-page.component').then(
        (module) => module.StudentPageComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./presentation/pages/student-page.component').then(
        (module) => module.StudentPageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./presentation/profile/student-profile.component').then(
        (module) => module.StudentProfileComponent,
      ),
  },
];


