import { Routes } from '@angular/router';
import { STAFF_REPOSITORY } from './domain/repositories/staff.repository';
import { StaffRepositoryAdapter } from './infrastructure/staff.repository';

const STAFF_PROVIDERS = [
  { provide: STAFF_REPOSITORY, useClass: StaffRepositoryAdapter },
];

export const STAFF_ROUTES: Routes = [
  {
    path: '',
    providers: STAFF_PROVIDERS,
    loadComponent: () =>
      import('./presentation/list/staff-list.component').then((m) => m.StaffListComponent),
  },
  {
    path: 'new',
    providers: STAFF_PROVIDERS,
    loadComponent: () =>
      import('./presentation/form/staff-form.component').then((m) => m.StaffFormComponent),
  },
  {
    path: ':id',
    providers: STAFF_PROVIDERS,
    loadComponent: () =>
      import('./presentation/detail/staff-detail.component').then((m) => m.StaffDetailComponent),
  },
  {
    path: ':id/edit',
    providers: STAFF_PROVIDERS,
    loadComponent: () =>
      import('./presentation/form/staff-form.component').then((m) => m.StaffFormComponent),
  },
];
