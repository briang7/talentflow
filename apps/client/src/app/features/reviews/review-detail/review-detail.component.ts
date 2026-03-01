import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe, DecimalPipe } from '@angular/common';

const GET_REVIEW_CYCLE = gql`
  query GetReviewCycle($id: ID!) {
    reviewCycle(id: $id) {
      id name type startDate endDate status completionRate averageScore
      reviews {
        id overallScore status
        employee {
          id firstName lastName avatar
          department { name }
        }
        reviewer { id firstName lastName }
      }
    }
  }
`;

@Component({
  selector: 'tf-review-detail',
  standalone: true,
  imports: [
    RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatProgressSpinnerModule,
    MatProgressBarModule, DatePipe, DecimalPipe,
  ],
  template: `
    @if (loading()) {
      <div class="loading"><mat-spinner></mat-spinner></div>
    } @else if (cycle()) {
      <div class="page-header">
        <button mat-icon-button routerLink="/reviews">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>{{ cycle()!.name }}</h1>
          <p>{{ cycle()!.startDate | date:'mediumDate' }} - {{ cycle()!.endDate | date:'mediumDate' }}</p>
        </div>
        <span class="status-badge" [class]="'status-' + cycle()!.status.toLowerCase()">
          {{ cycle()!.status }}
        </span>
      </div>

      <div class="stats-row">
        <mat-card class="stat-card">
          <span class="stat-value">{{ cycle()!.reviews.length }}</span>
          <span class="stat-label">Total Reviews</span>
        </mat-card>
        <mat-card class="stat-card">
          <span class="stat-value">{{ cycle()!.completionRate | number:'1.0-0' }}%</span>
          <span class="stat-label">Completion</span>
        </mat-card>
        @if (cycle()!.averageScore) {
          <mat-card class="stat-card">
            <span class="stat-value">{{ cycle()!.averageScore | number:'1.1-1' }}</span>
            <span class="stat-label">Avg Score</span>
          </mat-card>
        }
      </div>

      <mat-card class="table-card">
        <table mat-table [dataSource]="cycle()!.reviews" class="reviews-table">
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let r">
              <div class="emp-cell">
                <div class="emp-avatar">{{ r.employee.firstName.charAt(0) }}{{ r.employee.lastName.charAt(0) }}</div>
                <div>
                  <div class="emp-name">{{ r.employee.firstName }} {{ r.employee.lastName }}</div>
                  <div class="emp-dept">{{ r.employee.department.name }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="reviewer">
            <th mat-header-cell *matHeaderCellDef>Reviewer</th>
            <td mat-cell *matCellDef="let r">{{ r.reviewer.firstName }} {{ r.reviewer.lastName }}</td>
          </ng-container>

          <ng-container matColumnDef="score">
            <th mat-header-cell *matHeaderCellDef>Score</th>
            <td mat-cell *matCellDef="let r">
              @if (r.overallScore) {
                <span class="score-badge">{{ r.overallScore | number:'1.1-1' }}</span>
              } @else {
                <span class="no-score">-</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <span class="review-status" [class]="'rs-' + r.status.toLowerCase()">
                {{ r.status }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['employee', 'reviewer', 'score', 'status']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['employee', 'reviewer', 'score', 'status']"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    .loading { display: flex; justify-content: center; padding: 80px; }
    .page-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
    }
    .page-header h1 { font-size: 24px; font-weight: 700; margin: 0; }
    .page-header p { color: #666; margin: 2px 0 0; font-size: 14px; }
    .status-badge {
      padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;
      margin-left: auto;
    }
    .status-draft { background: #f5f5f5; color: #666; }
    .status-active { background: #e3f2fd; color: #1565c0; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .stats-row {
      display: flex; gap: 16px; margin-bottom: 24px;
    }
    .stat-card {
      flex: 1; padding: 20px !important; text-align: center;
    }
    .stat-value { font-size: 28px; font-weight: 700; color: #667eea; display: block; }
    .stat-label { font-size: 13px; color: #888; }
    .table-card { overflow: hidden; }
    .reviews-table { width: 100%; }
    .emp-cell { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
    .emp-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #667eea; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 600;
    }
    .emp-name { font-weight: 500; }
    .emp-dept { font-size: 12px; color: #888; }
    .score-badge {
      background: #667eea; color: white; padding: 4px 10px;
      border-radius: 8px; font-weight: 600; font-size: 14px;
    }
    .no-score { color: #ccc; }
    .review-status {
      padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 500;
    }
    .rs-draft { background: #f5f5f5; color: #666; }
    .rs-submitted { background: #fff3e0; color: #e65100; }
    .rs-reviewed { background: #e3f2fd; color: #1565c0; }
    .rs-finalized { background: #e8f5e9; color: #2e7d32; }
  `],
})
export class ReviewDetailComponent implements OnInit {
  cycle = signal<any>(null);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private apollo: Apollo) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.apollo.watchQuery<any>({
      query: GET_REVIEW_CYCLE,
      variables: { id },
    }).valueChanges.subscribe({
      next: ({ data }) => {
        this.cycle.set(data?.reviewCycle);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
