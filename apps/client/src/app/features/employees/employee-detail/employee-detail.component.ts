import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe } from '@angular/common';

const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id firstName lastName email phone avatar hireDate salary status
      department { id name }
      role { id title level salaryMin salaryMax }
      manager { id firstName lastName avatar }
      reports { id firstName lastName avatar role { title } }
      location { id name city country }
      reviewsReceived {
        id overallScore status
        cycle { name }
        createdAt
      }
    }
  }
`;

@Component({
  selector: 'tf-employee-detail',
  standalone: true,
  imports: [
    RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatTabsModule, MatListModule, MatDividerModule,
    MatProgressSpinnerModule, DatePipe, CurrencyPipe,
  ],
  template: `
    @if (loading()) {
      <div class="loading"><mat-spinner></mat-spinner></div>
    } @else if (employee()) {
      <div class="page-header">
        <button mat-icon-button routerLink="/employees">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ employee()!.firstName }} {{ employee()!.lastName }}</h1>
        <span class="status-chip" [class]="'status-' + employee()!.status.toLowerCase()">
          {{ employee()!.status }}
        </span>
      </div>

      <div class="detail-grid">
        <mat-card class="profile-card">
          <div class="profile-header">
            <div class="large-avatar">
              {{ employee()!.firstName.charAt(0) }}{{ employee()!.lastName.charAt(0) }}
            </div>
            <h2>{{ employee()!.firstName }} {{ employee()!.lastName }}</h2>
            <p class="role-title">{{ employee()!.role.title }}</p>
            <p class="dept-name">{{ employee()!.department.name }}</p>
          </div>
          <mat-divider></mat-divider>
          <div class="profile-details">
            <div class="detail-row">
              <mat-icon>email</mat-icon>
              <span>{{ employee()!.email }}</span>
            </div>
            @if (employee()!.phone) {
              <div class="detail-row">
                <mat-icon>phone</mat-icon>
                <span>{{ employee()!.phone }}</span>
              </div>
            }
            <div class="detail-row">
              <mat-icon>location_on</mat-icon>
              <span>{{ employee()!.location.name }} - {{ employee()!.location.city }}, {{ employee()!.location.country }}</span>
            </div>
            <div class="detail-row">
              <mat-icon>calendar_today</mat-icon>
              <span>Hired {{ employee()!.hireDate | date:'mediumDate' }}</span>
            </div>
            <div class="detail-row">
              <mat-icon>payments</mat-icon>
              <span>{{ employee()!.salary | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </mat-card>

        <div class="right-column">
          @if (employee()!.manager) {
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>Reports To</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="person-row clickable" (click)="navigateTo(employee()!.manager.id)">
                  <div class="sm-avatar">{{ employee()!.manager.firstName.charAt(0) }}{{ employee()!.manager.lastName.charAt(0) }}</div>
                  <span>{{ employee()!.manager.firstName }} {{ employee()!.manager.lastName }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          }

          @if (employee()!.reports.length) {
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>Direct Reports ({{ employee()!.reports.length }})</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @for (report of employee()!.reports; track report.id) {
                  <div class="person-row clickable" (click)="navigateTo(report.id)">
                    <div class="sm-avatar">{{ report.firstName.charAt(0) }}{{ report.lastName.charAt(0) }}</div>
                    <div>
                      <div class="person-name">{{ report.firstName }} {{ report.lastName }}</div>
                      <div class="person-role">{{ report.role.title }}</div>
                    </div>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }

          @if (employee()!.reviewsReceived.length) {
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>Performance Reviews</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @for (review of employee()!.reviewsReceived; track review.id) {
                  <div class="review-row">
                    <div>
                      <div class="review-cycle">{{ review.cycle.name }}</div>
                      <div class="review-date">{{ review.createdAt | date:'mediumDate' }}</div>
                    </div>
                    @if (review.overallScore) {
                      <div class="review-score">{{ review.overallScore.toFixed(1) }}</div>
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .loading { display: flex; justify-content: center; padding: 80px; }
    .page-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
    }
    .page-header h1 { font-size: 24px; font-weight: 700; margin: 0; }
    .status-chip {
      padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;
    }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-on_leave { background: #fff3e0; color: #e65100; }
    .status-terminated { background: #fce4ec; color: #c62828; }
    .detail-grid {
      display: grid; grid-template-columns: 320px 1fr; gap: 24px;
    }
    .profile-card { padding: 24px !important; }
    .profile-header { text-align: center; margin-bottom: 20px; }
    .large-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 600; margin: 0 auto 12px;
    }
    .profile-header h2 { margin: 0; font-size: 20px; }
    .role-title { color: #555; margin: 4px 0 0; }
    .dept-name { color: #888; font-size: 14px; margin: 2px 0 0; }
    .profile-details { padding-top: 16px; }
    .detail-row {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 0; font-size: 14px;
    }
    .detail-row mat-icon { color: #888; font-size: 20px; width: 20px; height: 20px; }
    .right-column { display: flex; flex-direction: column; gap: 16px; }
    .info-card mat-card-content { padding: 16px !important; }
    .person-row {
      display: flex; align-items: center; gap: 12px; padding: 8px 0;
    }
    .person-row.clickable { cursor: pointer; }
    .person-row.clickable:hover { opacity: 0.8; }
    .sm-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #667eea; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600; flex-shrink: 0;
    }
    .person-name { font-weight: 500; font-size: 14px; }
    .person-role { font-size: 12px; color: #888; }
    .review-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid #f0f0f0;
    }
    .review-row:last-child { border-bottom: none; }
    .review-cycle { font-weight: 500; font-size: 14px; }
    .review-date { font-size: 12px; color: #888; }
    .review-score {
      font-size: 18px; font-weight: 700; color: #667eea;
    }
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class EmployeeDetailComponent implements OnInit {
  employee = signal<any>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apollo: Apollo,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.apollo.watchQuery<any>({
      query: GET_EMPLOYEE,
      variables: { id },
    }).valueChanges.subscribe({
      next: ({ data }) => {
        this.employee.set(data?.employee);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  navigateTo(id: string): void {
    this.router.navigate(['/employees', id]);
  }
}
