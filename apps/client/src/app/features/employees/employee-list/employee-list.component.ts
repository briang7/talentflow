import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { DatePipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

const GET_EMPLOYEES = gql`
  query GetEmployees($first: Int, $after: String, $filter: EmployeeFilter, $sort: EmployeeSortInput) {
    employees(first: $first, after: $after, filter: $filter, sort: $sort) {
      edges {
        cursor
        node {
          id firstName lastName email avatar hireDate salary status
          department { id name }
          role { title }
          location { name city }
        }
      }
      pageInfo { totalCount hasNextPage endCursor }
    }
  }
`;

const GET_DEPARTMENTS = gql`
  query { departments { id name } }
`;

@Component({
  selector: 'tf-employee-list',
  standalone: true,
  imports: [
    FormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatCardModule, MatProgressSpinnerModule, MatMenuModule, DatePipe,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Employees</h1>
        <p>{{ totalCount() }} employees in directory</p>
      </div>
      <button mat-raised-button color="primary">
        <mat-icon>person_add</mat-icon> Add Employee
      </button>
    </div>

    <mat-card class="filter-card">
      <div class="filters">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search employees</mat-label>
          <input matInput (input)="onSearch($event)" placeholder="Name or email...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Department</mat-label>
          <mat-select (selectionChange)="onDepartmentFilter($event.value)">
            <mat-option value="">All Departments</mat-option>
            @for (dept of departments; track dept.id) {
              <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select (selectionChange)="onStatusFilter($event.value)">
            <mat-option value="">All</mat-option>
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="ON_LEAVE">On Leave</mat-option>
            <mat-option value="TERMINATED">Terminated</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-card>

    @if (loading()) {
      <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
    } @else {
      <mat-card class="table-card">
        <table mat-table [dataSource]="employees()" class="employee-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let emp">
              <div class="employee-cell">
                <div class="emp-avatar">{{ emp.firstName.charAt(0) }}{{ emp.lastName.charAt(0) }}</div>
                <div>
                  <div class="emp-name">{{ emp.firstName }} {{ emp.lastName }}</div>
                  <div class="emp-email">{{ emp.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let emp">{{ emp.department.name }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let emp">{{ emp.role.title }}</td>
          </ng-container>

          <ng-container matColumnDef="hireDate">
            <th mat-header-cell *matHeaderCellDef>Hire Date</th>
            <td mat-cell *matCellDef="let emp">{{ emp.hireDate | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let emp">
              <span class="status-chip" [class]="'status-' + emp.status.toLowerCase()">
                {{ emp.status === 'ON_LEAVE' ? 'On Leave' : emp.status === 'ACTIVE' ? 'Active' : 'Terminated' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let emp">
              <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionMenu="matMenu">
                <button mat-menu-item (click)="viewEmployee(emp.id)">
                  <mat-icon>visibility</mat-icon> View
                </button>
                <button mat-menu-item>
                  <mat-icon>edit</mat-icon> Edit
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"
              class="clickable-row" (click)="viewEmployee(row.id)"></tr>
        </table>

        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)">
        </mat-paginator>
      </mat-card>
    }
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .page-header h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .page-header p { color: #666; margin: 4px 0 0; }
    .filter-card { margin-bottom: 16px; padding: 16px !important; }
    .filters {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .search-field { flex: 1; min-width: 250px; }
    .table-card { overflow: hidden; }
    .employee-table { width: 100%; }
    .employee-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 0;
    }
    .emp-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #667eea; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 600; flex-shrink: 0;
    }
    .emp-name { font-weight: 500; }
    .emp-email { font-size: 12px; color: #888; }
    .status-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-on_leave { background: #fff3e0; color: #e65100; }
    .status-terminated { background: #fce4ec; color: #c62828; }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: #f5f5f5; }
    .loading { display: flex; justify-content: center; padding: 60px; }
  `],
})
export class EmployeeListComponent implements OnInit {
  employees = signal<any[]>([]);
  totalCount = signal(0);
  loading = signal(true);
  departments: any[] = [];
  displayedColumns = ['name', 'department', 'role', 'hireDate', 'status', 'actions'];
  pageSize = 20;
  currentFilter: any = {};
  private searchSubject = new Subject<string>();
  private endCursor: string | null = null;

  constructor(private apollo: Apollo, private router: Router) {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(search => {
      this.currentFilter = { ...this.currentFilter, search: search || undefined };
      this.loadEmployees();
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.apollo.watchQuery<any>({ query: GET_DEPARTMENTS }).valueChanges.subscribe(({ data }) => {
      this.departments = data?.departments || [];
    });
  }

  loadEmployees(after?: string): void {
    this.loading.set(true);
    this.apollo.watchQuery<any>({
      query: GET_EMPLOYEES,
      variables: {
        first: this.pageSize,
        after,
        filter: Object.keys(this.currentFilter).length ? this.currentFilter : undefined,
        sort: { field: 'LAST_NAME', direction: 'ASC' },
      },
    }).valueChanges.subscribe({
      next: ({ data }) => {
        const edges = data?.employees?.edges || [];
        this.employees.set(edges.map((e: any) => e.node));
        this.totalCount.set(data?.employees?.pageInfo?.totalCount || 0);
        this.endCursor = data?.employees?.pageInfo?.endCursor;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onDepartmentFilter(departmentId: string): void {
    this.currentFilter = { ...this.currentFilter, departmentId: departmentId || undefined };
    this.loadEmployees();
  }

  onStatusFilter(status: string): void {
    this.currentFilter = { ...this.currentFilter, status: status || undefined };
    this.loadEmployees();
  }

  onPage(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.loadEmployees(event.pageIndex > 0 ? this.endCursor || undefined : undefined);
  }

  viewEmployee(id: string): void {
    this.router.navigate(['/employees', id]);
  }
}
