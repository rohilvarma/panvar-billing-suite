import { Routes } from '@angular/router';
import { authGuard } from './utils/auth-guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    title: 'Panvar Billing Suite',
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'Log in',
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/sign-up/sign-up.component').then(
        (c) => c.SignUpComponent
      ),
    title: 'Sign up',
  },
];
