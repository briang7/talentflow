import { Route } from '@angular/router';

export const EMPLOYEES_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./employee-list/employee-list.component').then(m => m.EmployeeListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent),
  },
];
