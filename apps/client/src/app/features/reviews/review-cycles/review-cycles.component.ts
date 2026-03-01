import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe, DecimalPipe } from '@angular/common';

const GET_REVIEW_CYCLES = gql`
  query GetReviewCycles {
    reviewCycles {
      id name type startDate endDate status completionRate averageScore
    }
  }
`;

@Component({
  selector: 'tf-review-cycles',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatProgressBarModule, DatePipe, DecimalPipe,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Performance Reviews</h1>
        <p>Manage review cycles and employee evaluations</p>
      </div>
      <button mat-raised-button color="primary">
        <mat-icon>add</mat-icon> New Review Cycle
      </button>
    </div>

    @if (loading()) {
      <div class="loading"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="cycles-grid">
        @for (cycle of cycles(); track cycle.id) {
          <mat-card class="cycle-card" (click)="viewCycle(cycle.id)">
            <div class="cycle-header">
              <div>
                <h3>{{ cycle.name }}</h3>
                <span class="cycle-type">{{ cycle.type }}</span>
              </div>
              <span class="status-badge" [class]="'status-' + cycle.status.toLowerCase()">
                {{ cycle.status }}
              </span>
            </div>

            <div class="cycle-dates">
              <mat-icon>date_range</mat-icon>
              <span>{{ cycle.startDate | date:'mediumDate' }} - {{ cycle.endDate | date:'mediumDate' }}</span>
            </div>

            <div class="cycle-stats">
              <div class="stat">
                <span class="stat-label">Completion</span>
                <span class="stat-value">{{ cycle.completionRate | number:'1.0-0' }}%</span>
                <mat-progress-bar mode="determinate" [value]="cycle.completionRate"></mat-progress-bar>
              </div>
              @if (cycle.averageScore) {
                <div class="stat">
                  <span class="stat-label">Avg Score</span>
                  <span class="stat-value score">{{ cycle.averageScore | number:'1.1-1' }}/5</span>
                </div>
              }
            </div>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .page-header h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .page-header p { color: #666; margin: 4px 0 0; }
    .loading { display: flex; justify-content: center; padding: 80px; }
    .cycles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 16px;
    }
    .cycle-card {
      padding: 24px !important;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .cycle-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    .cycle-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px;
    }
    .cycle-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
    .cycle-type {
      font-size: 12px; color: #888; text-transform: uppercase;
    }
    .status-badge {
      padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;
    }
    .status-draft { background: #f5f5f5; color: #666; }
    .status-active { background: #e3f2fd; color: #1565c0; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .cycle-dates {
      display: flex; align-items: center; gap: 8px;
      color: #666; font-size: 14px; margin-bottom: 20px;
    }
    .cycle-dates mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .cycle-stats {
      display: flex; gap: 24px;
    }
    .stat { flex: 1; }
    .stat-label { font-size: 12px; color: #888; display: block; }
    .stat-value { font-size: 20px; font-weight: 700; display: block; margin: 4px 0 8px; }
    .stat-value.score { color: #667eea; }
  `],
})
export class ReviewCyclesComponent implements OnInit {
  cycles = signal<any[]>([]);
  loading = signal(true);

  constructor(private apollo: Apollo, private router: Router) {}

  ngOnInit(): void {
    this.apollo.watchQuery<any>({ query: GET_REVIEW_CYCLES }).valueChanges.subscribe({
      next: ({ data }) => {
        this.cycles.set(data?.reviewCycles || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  viewCycle(id: string): void {
    this.router.navigate(['/reviews', id]);
  }
}
