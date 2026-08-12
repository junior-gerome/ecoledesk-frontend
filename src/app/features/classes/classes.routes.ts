import { Routes } from '@angular/router';

export const CLASSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/list/class-list.component').then(m => m.ClassListComponent)
  },
  {
    path: 'form',
    loadComponent: () => import('./presentation/form/class-form.component').then(m => m.ClassFormComponent)
  },
  {
    path: ':id/assignments',
    loadComponent: () => import('./presentation/assignments/class-assignments.component').then(m => m.ClassAssignmentsComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./presentation/form/class-form.component').then(m => m.ClassFormComponent)
  }
];


