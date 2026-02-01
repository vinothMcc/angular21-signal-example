import { Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginFormComponent,
  },
  {
    path: 'login',
    component: LoginFormComponent,
  },
  {
    path: 'personal-info',
    providers: [],
    canActivate: [authGuard],
    loadComponent: () => import('../lib/personal-info-mfe').then((m) => m.PersonalInfoComponent),
  },
];
