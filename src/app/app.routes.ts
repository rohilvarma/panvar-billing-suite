import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/authentication/authentication.component').then(
        (m) => m.AuthenticationComponent
      ),
  },
];
