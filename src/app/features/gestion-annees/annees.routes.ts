import { Routes } from '@angular/router';

export const GestionAnneesRoutes : Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/gestion-annees.component').then(m => m.GestionAnneesComponent)
  },
  {
    path: 'new-annees',
    loadComponent: () => import('./presentation/gestion-annees.component').then(m => m.GestionAnneesComponent)
  },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./gestion-annees.component').then(m => m.GestionAnneesComponent)
  // }
];
