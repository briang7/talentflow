import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';

const GET_ANALYTICS = gql`
  query GetAnalytics {
    analytics {
      totalEmployees
      activeEmployees
      newHires30d
      turnoverRate
      averageTenure
      averageSalary
      headcountTrend { month count }
      departmentDistribution { department count percentage }
      turnoverTrend { month rate terminations }
      tenureByDepartment { department averageTenure }
      salaryBands { range count }
    }
  }
`;

@Component({
  selector: 'tf-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    CommonModule,
  ],
  template: `
    @if (loading) {
      <div class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
    } @else {
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to TalentFlow HR Analytics</p>
      </div>

      <div class="kpi-grid">
        @for (kpi of kpis; track kpi.label) {
          <mat-card class="kpi-card">
            <div class="kpi-icon-wrap" [style.background]="kpi.bgColor">
              <mat-icon [style.color]="kpi.color">{{ kpi.icon }}</mat-icon>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="kpi-label">{{ kpi.label }}</span>
            </div>
          </mat-card>
        }
      </div>

      <div class="charts-grid">
        <mat-card class="chart-card wide">
          <mat-card-header>
            <mat-card-title>Headcount Trend</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [type]="'line'"
              [data]="headcountChartData"
              [options]="lineChartOptions">
            </canvas>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Department Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [type]="'doughnut'"
              [data]="departmentChartData"
              [options]="doughnutChartOptions">
            </canvas>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Salary Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [type]="'bar'"
              [data]="salaryChartData"
              [options]="barChartOptions">
            </canvas>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card wide">
          <mat-card-header>
            <mat-card-title>Tenure by Department</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [type]="'bar'"
              [data]="tenureChartData"
              [options]="horizontalBarOptions">
            </canvas>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 80px;
    }
    .dashboard-header {
      margin-bottom: 24px;
    }
    .dashboard-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }
    .dashboard-header p {
      color: #666;
      margin: 4px 0 0;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }
    .kpi-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-content {
      display: flex;
      flex-direction: column;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
    }
    .kpi-label {
      font-size: 13px;
      color: #888;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .chart-card {
      padding: 8px;
    }
    .chart-card.wide {
      grid-column: span 2;
    }
    mat-card-content {
      padding: 16px;
    }
    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
      .chart-card.wide {
        grid-column: span 1;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  loading = true;
  kpis: any[] = [];

  headcountChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  departmentChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  salaryChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  tenureChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: false } },
  };

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'right' } },
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
  };

  horizontalBarOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
  };

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo.watchQuery<any>({ query: GET_ANALYTICS }).valueChanges.subscribe({
      next: ({ data, loading }) => {
        this.loading = loading;
        if (data?.analytics) {
          this.buildKpis(data.analytics);
          this.buildCharts(data.analytics);
        }
      },
      error: () => { this.loading = false; },
    });
  }

  private buildKpis(analytics: any): void {
    this.kpis = [
      {
        label: 'Total Employees',
        value: analytics.activeEmployees,
        icon: 'people',
        color: '#667eea',
        bgColor: 'rgba(102, 126, 234, 0.1)',
      },
      {
        label: 'New Hires (30d)',
        value: analytics.newHires30d,
        icon: 'person_add',
        color: '#4caf50',
        bgColor: 'rgba(76, 175, 80, 0.1)',
      },
      {
        label: 'Turnover Rate',
        value: analytics.turnoverRate.toFixed(1) + '%',
        icon: 'trending_down',
        color: '#ff5722',
        bgColor: 'rgba(255, 87, 34, 0.1)',
      },
      {
        label: 'Avg Tenure',
        value: analytics.averageTenure.toFixed(1) + ' yrs',
        icon: 'schedule',
        color: '#2196f3',
        bgColor: 'rgba(33, 150, 243, 0.1)',
      },
      {
        label: 'Avg Salary',
        value: '$' + (analytics.averageSalary / 1000).toFixed(0) + 'k',
        icon: 'payments',
        color: '#9c27b0',
        bgColor: 'rgba(156, 39, 176, 0.1)',
      },
    ];
  }

  private buildCharts(analytics: any): void {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

    this.headcountChartData = {
      labels: analytics.headcountTrend.map((d: any) => d.month),
      datasets: [{
        data: analytics.headcountTrend.map((d: any) => d.count),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    };

    this.departmentChartData = {
      labels: analytics.departmentDistribution.map((d: any) => d.department),
      datasets: [{
        data: analytics.departmentDistribution.map((d: any) => d.count),
        backgroundColor: colors,
      }],
    };

    this.salaryChartData = {
      labels: analytics.salaryBands.map((d: any) => d.range),
      datasets: [{
        data: analytics.salaryBands.map((d: any) => d.count),
        backgroundColor: '#667eea',
        borderRadius: 6,
      }],
    };

    this.tenureChartData = {
      labels: analytics.tenureByDepartment.map((d: any) => d.department),
      datasets: [{
        data: analytics.tenureByDepartment.map((d: any) => d.averageTenure.toFixed(1)),
        backgroundColor: colors,
        borderRadius: 6,
      }],
    };
  }
}
