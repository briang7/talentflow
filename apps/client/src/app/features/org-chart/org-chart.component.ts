import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ElementRef, ViewChild, signal, inject, NgZone, ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { OrgChart } from 'd3-org-chart';
import * as d3 from 'd3';

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

interface OrgNode {
  id: string;
  name: string;
  title: string;
  avatar: string | null;
  departmentName: string;
  parentId: string | null;
}

@Component({
  selector: 'tf-org-chart',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    MatTooltipModule, FormsModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Organization Chart</h1>
        <p>Company hierarchy and reporting structure</p>
      </div>
      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search people</mat-label>
          <input matInput [(ngModel)]="searchTerm"
                 (ngModelChange)="onSearch($event)"
                 placeholder="Search by name or title...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <div class="zoom-controls">
          <button mat-icon-button matTooltip="Zoom In" (click)="zoomIn()">
            <mat-icon>zoom_in</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Zoom Out" (click)="zoomOut()">
            <mat-icon>zoom_out</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Fit to Screen" (click)="fitScreen()">
            <mat-icon>fit_screen</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Expand All" (click)="expandAll()">
            <mat-icon>unfold_more</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Collapse All" (click)="collapseAll()">
            <mat-icon>unfold_less</mat-icon>
          </button>
        </div>
      </div>
    </div>

    @if (loading()) {
      <div class="loading"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="chart-wrapper">
        <div #chartContainer class="chart-container"></div>
      </div>
    }
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px; flex-wrap: wrap; gap: 16px;
    }
    .page-header h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .page-header p { color: #666; margin: 4px 0 0; }
    .toolbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .search-field { width: 260px; }
    .zoom-controls {
      display: flex;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      border: 1px solid #e0e0e0;
    }
    .zoom-controls button { color: #555; }
    .loading { display: flex; justify-content: center; padding: 80px; }
    .chart-wrapper {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .chart-container {
      width: 100%;
      height: calc(100vh - 240px);
      min-height: 500px;
    }
  `],
})
export class OrgChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  private apollo = inject(Apollo);
  private router = inject(Router);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private chart: OrgChart<OrgNode> | null = null;
  private flatData: OrgNode[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private expandedNodes = new Set<string>();

  loading = signal(true);
  searchTerm = '';

  private deptColors: Record<string, string> = {
    'Engineering': '#667eea',
    'Platform': '#764ba2',
    'Data & Analytics': '#4facfe',
    'Product': '#2ecc71',
    'Design': '#e84393',
    'Human Resources': '#fa709a',
    'Marketing': '#fdcb6e',
    'Sales': '#00cec9',
  };

  ngOnInit(): void {
    this.apollo.watchQuery<any>({ query: GET_ORG_CHART }).valueChanges.subscribe({
      next: ({ data }) => {
        this.zone.run(() => {
          const trees = data?.orgChart || [];
          this.flatData = this.flattenTree(trees, null);
          this.loading.set(false);
          this.cdr.markForCheck();
          // Wait for view to render the container
          setTimeout(() => this.renderChart(), 0);
        });
      },
      error: () => {
        this.zone.run(() => {
          this.loading.set(false);
          this.cdr.markForCheck();
        });
      },
    });
  }

  ngAfterViewInit(): void {
    if (this.flatData.length && this.chartContainer) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private flattenTree(nodes: any[], parentId: string | null): OrgNode[] {
    const result: OrgNode[] = [];
    for (const node of nodes) {
      result.push({
        id: node.id,
        name: node.name,
        title: node.title,
        avatar: node.avatar,
        departmentName: node.departmentName,
        parentId,
      });
      if (node.children?.length) {
        result.push(...this.flattenTree(node.children, node.id));
      }
    }

    // d3-org-chart requires a single root. If there are multiple top-level
    // nodes, wrap them under a synthetic company root.
    if (parentId === null) {
      const roots = result.filter(n => n.parentId === null);
      if (roots.length > 1) {
        const companyRoot: OrgNode = {
          id: '__root__',
          name: 'TalentFlow',
          title: 'Organization',
          avatar: null,
          departmentName: 'Company',
          parentId: null,
        };
        for (const r of roots) {
          r.parentId = '__root__';
        }
        result.unshift(companyRoot);
      }
    }

    return result;
  }

  private getInitials(name: string): string {
    return name.split(' ').map((n: string) => n.charAt(0)).join('').substring(0, 2);
  }

  private renderChart(): void {
    if (!this.chartContainer?.nativeElement || !this.flatData.length) return;

    const container = this.chartContainer.nativeElement;
    // Clear previous
    container.innerHTML = '';

    this.chart = new OrgChart<OrgNode>()
      .container(container)
      .data(this.flatData as any)
      .nodeId((d: any) => d.id)
      .parentNodeId((d: any) => d.parentId)
      .nodeWidth(() => 260)
      .nodeHeight(() => 120)
      .childrenMargin(() => 60)
      .compactMarginBetween(() => 30)
      .siblingsMargin(() => 30)
      .neighbourMargin(() => 40)
      .initialZoom(0.85)
      .nodeContent((d: any) => {
        const data = d.data as OrgNode;
        const color = this.deptColors[data.departmentName] || '#667eea';
        const initials = this.getInitials(data.name);
        const directReports = d.children?.length || d._children?.length || 0;
        const isExpanded = d.children && d.children.length > 0;
        const hasChildren = directReports > 0;
        const expandIcon = hasChildren
          ? `<span style="font-size:11px;color:#888;margin-top:2px;display:flex;align-items:center;gap:4px;">
              <span style="font-size:14px;">${isExpanded ? '▼' : '▶'}</span>
              ${directReports} report${directReports > 1 ? 's' : ''}
             </span>`
          : '';
        const viewLink = data.id !== '__root__'
          ? `<a data-employee-id="${data.id}" class="view-profile-link" style="
              font-size:11px; color:${color}; cursor:pointer; text-decoration:none;
              margin-top:2px; display:inline-block;
            " onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'"
            >View Profile →</a>`
          : '';

        return `
          <div style="
            background: #fff;
            border-radius: 14px;
            border: 2px solid ${color}22;
            border-left: 4px solid ${color};
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 14px;
            height: ${d.height}px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            transition: box-shadow 0.2s, transform 0.2s;
            cursor: pointer;
            font-family: 'Roboto', sans-serif;
          "
          onmouseover="this.style.boxShadow='0 6px 24px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)'"
          onmouseout="this.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'; this.style.transform='translateY(0)'"
          >
            <div style="
              width: 52px; height: 52px; border-radius: 50%;
              background: linear-gradient(135deg, ${color}, ${color}aa);
              display: flex; align-items: center; justify-content: center;
              color: #fff; font-weight: 600; font-size: 18px;
              flex-shrink: 0;
              box-shadow: 0 2px 8px ${color}44;
            ">${initials}</div>
            <div style="overflow: hidden; flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #1a1a2e;
                          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${data.name}
              </div>
              <div style="font-size: 12px; color: #555; margin-top: 2px;
                          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${data.title}
              </div>
              <div style="
                display: inline-block;
                font-size: 11px; color: ${color};
                background: ${color}11;
                padding: 2px 8px;
                border-radius: 10px;
                margin-top: 4px;
              ">${data.departmentName}</div>
              <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
                ${expandIcon}
                ${viewLink}
              </div>
            </div>
          </div>
        `;
      })
      .linkUpdate(function (this: any, d: any) {
        d3.select(this)
          .attr('stroke', '#c8c8d8')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '')
          .style('opacity', 0.7);
      })
      .render();

    // Listen for "View Profile" link clicks
    container.addEventListener('click', (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('[data-employee-id]') as HTMLElement;
      if (link) {
        e.stopPropagation();
        const employeeId = link.getAttribute('data-employee-id');
        if (employeeId) {
          this.zone.run(() => this.router.navigate(['/employees', employeeId]));
        }
      }
    });

    // Handle resize
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.fit();
    });
    this.resizeObserver.observe(container);
  }

  onSearch(term: string): void {
    if (!this.chart) return;
    if (!term.trim()) {
      this.chart.clearHighlighting();
      return;
    }
    const lowerTerm = term.toLowerCase();
    this.chart.setHighlighted(
      this.flatData
        .filter(d => d.name.toLowerCase().includes(lowerTerm) || d.title.toLowerCase().includes(lowerTerm))
        .map(d => d.id)
    ).render();
  }

  zoomIn(): void {
    this.chart?.zoomIn();
  }

  zoomOut(): void {
    this.chart?.zoomOut();
  }

  fitScreen(): void {
    this.chart?.fit();
  }

  expandAll(): void {
    this.chart?.expandAll().render();
  }

  collapseAll(): void {
    this.chart?.collapseAll().render();
  }
}
