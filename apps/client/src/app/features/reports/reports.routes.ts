import { Route } from '@angular/router';

export const REPORTS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./report-builder/report-builder.component').then(m => m.ReportBuilderComponent),
  },
];
