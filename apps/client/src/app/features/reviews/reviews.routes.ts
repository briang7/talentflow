import { Route } from '@angular/router';

export const REVIEWS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./review-cycles/review-cycles.component').then(m => m.ReviewCyclesComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./review-detail/review-detail.component').then(m => m.ReviewDetailComponent),
  },
];
