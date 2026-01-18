import { Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form';

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
    loadComponent: () => import('../lib/personal-info-mfe').then((m) => m.PersonalInfoComponent),
  },
];
