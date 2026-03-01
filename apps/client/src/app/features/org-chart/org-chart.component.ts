import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

const GET_ORG_CHART = gql`
  query GetOrgChart {
    orgChart {
      id name title avatar departmentName
      children {
        id name title avatar departmentName
        children {
          id name title avatar departmentName
          children {
            id name title avatar departmentName
            children { id name title avatar departmentName }
          }
        }
      }
    }
  }
`;

@Component({
  selector: 'tf-org-chart',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, FormsModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Organization Chart</h1>
        <p>Company hierarchy and reporting structure</p>
      </div>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search people</mat-label>
        <input matInput [(ngModel)]="searchTerm" placeholder="Search by name...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="org-tree-container">
        @for (node of orgData(); track node.id) {
          <div class="org-tree">
            <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: node, level: 0 }"></ng-container>
          </div>
        }
      </div>

      <ng-template #nodeTemplate let-node let-level="level">
        <div class="tree-node" [class.highlighted]="isHighlighted(node.name)">
          <div class="node-card" (click)="onNodeClick(node.id)">
            <div class="node-avatar" [style.background]="getDeptColor(node.departmentName)">
              {{ getInitials(node.name) }}
            </div>
            <div class="node-info">
              <div class="node-name">{{ node.name }}</div>
              <div class="node-title">{{ node.title }}</div>
              <div class="node-dept">{{ node.departmentName }}</div>
            </div>
          </div>
          @if (node.children?.length) {
            <div class="tree-children">
              @for (child of node.children; track child.id) {
                <div class="tree-branch">
                  <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: child, level: level + 1 }"></ng-container>
                </div>
              }
            </div>
          }
        </div>
      </ng-template>
    }
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
    }
    .page-header h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .page-header p { color: #666; margin: 4px 0 0; }
    .search-field { width: 280px; }
    .loading { display: flex; justify-content: center; padding: 80px; }
    .org-tree-container {
      overflow-x: auto;
      padding: 20px;
    }
    .org-tree {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .tree-node {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .tree-node.highlighted > .node-card {
      box-shadow: 0 0 0 3px #667eea;
    }
    .node-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      min-width: 220px;
    }
    .node-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    .node-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 600; font-size: 16px; flex-shrink: 0;
    }
    .node-info { overflow: hidden; }
    .node-name { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .node-title { font-size: 12px; color: #666; }
    .node-dept { font-size: 11px; color: #999; }
    .tree-children {
      display: flex;
      gap: 16px;
      padding-top: 24px;
      position: relative;
      flex-wrap: wrap;
      justify-content: center;
    }
    .tree-children::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 2px;
      height: 24px;
      background: #ddd;
    }
    .tree-branch {
      position: relative;
      padding-top: 24px;
    }
    .tree-branch::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 2px;
      height: 24px;
      background: #ddd;
    }
  `],
})
export class OrgChartComponent implements OnInit {
  orgData = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';

  private deptColors: Record<string, string> = {
    'Engineering': '#667eea',
    'Platform': '#764ba2',
    'Data & Analytics': '#4facfe',
    'Product': '#43e97b',
    'Design': '#f093fb',
    'Human Resources': '#fa709a',
    'Marketing': '#fee140',
    'Sales': '#00f2fe',
  };

  constructor(private apollo: Apollo, private router: Router) {}

  ngOnInit(): void {
    this.apollo.watchQuery<any>({ query: GET_ORG_CHART }).valueChanges.subscribe({
      next: ({ data }) => {
        this.orgData.set(data?.orgChart || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
  }

  getDeptColor(dept: string): string {
    return this.deptColors[dept] || '#667eea';
  }

  isHighlighted(name: string): boolean {
    if (!this.searchTerm) return false;
    return name.toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  onNodeClick(id: string): void {
    this.router.navigate(['/employees', id]);
  }
}
