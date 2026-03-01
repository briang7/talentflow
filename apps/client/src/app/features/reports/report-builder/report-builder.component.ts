import { Component, OnInit, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

const GET_EMPLOYEES_REPORT = gql`
  query GetEmployeesReport {
    employees(first: 100) {
      edges {
        node {
          id firstName lastName email hireDate salary status
          department { name }
          role { title level }
          location { city country }
        }
      }
    }
  }
`;

@Component({
  selector: 'tf-report-builder',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatTableModule, MatProgressSpinnerModule,
    CommonModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Reports</h1>
        <p>Generate and export workforce reports</p>
      </div>
    </div>

    <div class="report-types">
      @for (report of reportTypes; track report.id) {
        <mat-card class="report-type-card" [class.selected]="selectedReport === report.id"
                  (click)="selectReport(report.id)">
          <mat-icon [style.color]="report.color">{{ report.icon }}</mat-icon>
          <h3>{{ report.name }}</h3>
          <p>{{ report.description }}</p>
        </mat-card>
      }
    </div>

    @if (loading()) {
      <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
    } @else if (reportData().length) {
      <mat-card class="results-card">
        <div class="results-header">
          <h2>{{ getReportTitle() }}</h2>
          <button mat-stroked-button (click)="exportCSV()">
            <mat-icon>download</mat-icon> Export CSV
          </button>
        </div>

        <table mat-table [dataSource]="reportData()" class="report-table">
          @for (col of displayedColumns; track col) {
            <ng-container [matColumnDef]="col">
              <th mat-header-cell *matHeaderCellDef>{{ formatHeader(col) }}</th>
              <td mat-cell *matCellDef="let row">
                @if (col === 'salary') {
                  {{ row[col] | currency:'USD':'symbol':'1.0-0' }}
                } @else if (col === 'hireDate') {
                  {{ row[col] | date:'mediumDate' }}
                } @else {
                  {{ row[col] }}
                }
              </td>
            </ng-container>
          }
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .page-header p { color: #666; margin: 4px 0 0; }
    .report-types {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .report-type-card {
      padding: 24px !important;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .report-type-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .report-type-card.selected {
      border: 2px solid #667eea;
      background: rgba(102, 126, 234, 0.04);
    }
    .report-type-card mat-icon { font-size: 36px; width: 36px; height: 36px; margin-bottom: 8px; }
    .report-type-card h3 { margin: 8px 0 4px; font-size: 16px; }
    .report-type-card p { font-size: 13px; color: #888; margin: 0; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .results-card { overflow: hidden; }
    .results-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 24px; border-bottom: 1px solid #eee;
    }
    .results-header h2 { margin: 0; font-size: 18px; }
    .report-table { width: 100%; }
  `],
})
export class ReportBuilderComponent implements OnInit {
  reportData = signal<any[]>([]);
  loading = signal(false);
  selectedReport = 'headcount';
  displayedColumns: string[] = [];

  reportTypes = [
    { id: 'headcount', name: 'Headcount Report', description: 'Current employee roster with details', icon: 'people', color: '#667eea' },
    { id: 'compensation', name: 'Compensation Analysis', description: 'Salary distribution and ranges', icon: 'payments', color: '#4caf50' },
    { id: 'turnover', name: 'Turnover Report', description: 'Employee departures and trends', icon: 'trending_down', color: '#ff5722' },
  ];

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.loadReport();
  }

  selectReport(id: string): void {
    this.selectedReport = id;
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.apollo.watchQuery<any>({ query: GET_EMPLOYEES_REPORT }).valueChanges.subscribe({
      next: ({ data }) => {
        const employees = (data?.employees?.edges || []).map((e: any) => e.node);
        switch (this.selectedReport) {
          case 'headcount':
            this.displayedColumns = ['name', 'department', 'role', 'location', 'hireDate', 'status'];
            this.reportData.set(employees.map((e: any) => ({
              name: `${e.firstName} ${e.lastName}`,
              department: e.department.name,
              role: e.role.title,
              location: `${e.location.city}, ${e.location.country}`,
              hireDate: e.hireDate,
              status: e.status,
            })));
            break;
          case 'compensation':
            this.displayedColumns = ['name', 'department', 'role', 'salary', 'status'];
            this.reportData.set(employees
              .filter((e: any) => e.status === 'ACTIVE')
              .sort((a: any, b: any) => b.salary - a.salary)
              .map((e: any) => ({
                name: `${e.firstName} ${e.lastName}`,
                department: e.department.name,
                role: e.role.title,
                salary: e.salary,
                status: e.status,
              })));
            break;
          case 'turnover':
            this.displayedColumns = ['name', 'department', 'role', 'hireDate', 'status'];
            this.reportData.set(employees
              .filter((e: any) => e.status === 'TERMINATED' || e.status === 'ON_LEAVE')
              .map((e: any) => ({
                name: `${e.firstName} ${e.lastName}`,
                department: e.department.name,
                role: e.role.title,
                hireDate: e.hireDate,
                status: e.status,
              })));
            break;
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getReportTitle(): string {
    return this.reportTypes.find(r => r.id === this.selectedReport)?.name || '';
  }

  formatHeader(col: string): string {
    return col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  }

  exportCSV(): void {
    const data = this.reportData();
    if (!data.length) return;
    const headers = this.displayedColumns.join(',');
    const rows = data.map(row => this.displayedColumns.map(col => `"${row[col] || ''}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedReport}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
