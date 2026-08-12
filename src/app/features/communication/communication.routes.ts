import { Routes } from '@angular/router';

export const COMMUNICATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/communication-coming-soon.component').then(
        (m) => m.CommunicationComingSoonComponent,
      ),
  },
];
