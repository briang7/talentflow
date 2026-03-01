import { Route } from '@angular/router';

export const ORG_CHART_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./org-chart.component').then(m => m.OrgChartComponent),
  },
];
