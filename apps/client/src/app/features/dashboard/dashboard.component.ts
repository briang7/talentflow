import { Component, OnInit, ChangeDetectorRef, inject, NgZone } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

echarts.use([
  LineChart, BarChart, PieChart,
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, DataZoomComponent,
  CanvasRenderer,
]);

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
    NgxEchartsDirective,
  ],
  providers: [
    provideEchartsCore({ echarts }),
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
          <mat-card class="kpi-card" [class]="'kpi-animate kpi-delay-' + $index">
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

      @if (chartsReady) {
        <div class="charts-grid">
          <mat-card class="chart-card wide">
            <mat-card-header>
              <mat-card-title>Headcount Trend</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div echarts [options]="headcountOptions" class="chart"></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Department Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div echarts [options]="departmentOptions" class="chart"></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Salary Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div echarts [options]="salaryOptions" class="chart"></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card wide">
            <mat-card-header>
              <mat-card-title>Tenure by Department</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div echarts [options]="tenureOptions" class="chart"></div>
            </mat-card-content>
          </mat-card>
        </div>
      }
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

    /* KPI cards with staggered entrance animation */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
    }
    .kpi-animate {
      animation: kpiSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .kpi-delay-0 { animation-delay: 0ms; }
    .kpi-delay-1 { animation-delay: 80ms; }
    .kpi-delay-2 { animation-delay: 160ms; }
    .kpi-delay-3 { animation-delay: 240ms; }
    .kpi-delay-4 { animation-delay: 320ms; }
    @keyframes kpiSlideUp {
      from {
        opacity: 0;
        transform: translateY(24px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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

    /* Charts grid */
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
    .chart {
      width: 100%;
      height: 320px;
    }
    .chart-card.wide .chart {
      height: 300px;
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
  private apollo = inject(Apollo);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  loading = true;
  kpis: any[] = [];
  chartsReady = false;

  headcountOptions: EChartsOption = {};
  departmentOptions: EChartsOption = {};
  salaryOptions: EChartsOption = {};
  tenureOptions: EChartsOption = {};

  ngOnInit(): void {
    this.apollo.watchQuery<any>({ query: GET_ANALYTICS }).valueChanges.subscribe({
      next: ({ data, loading }) => {
        this.zone.run(() => {
          this.loading = loading;
          if (data?.analytics) {
            this.buildKpis(data.analytics);
            this.buildCharts(data.analytics);
            this.chartsReady = true;
          }
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
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
    const brandGradient = {
      type: 'linear' as const,
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: 'rgba(102, 126, 234, 0.4)' },
        { offset: 1, color: 'rgba(102, 126, 234, 0.02)' },
      ],
    };

    const palette = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#00f2fe', '#43e97b', '#fa709a', '#fee140',
    ];

    // --- Headcount Trend (area line) ---
    this.headcountOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 30, 46, 0.9)',
        borderColor: 'transparent',
        textStyle: { color: '#fff', fontSize: 13 },
        axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
      },
      grid: { left: 48, right: 24, top: 16, bottom: 32 },
      xAxis: {
        type: 'category',
        data: analytics.headcountTrend.map((d: any) => d.month),
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisTick: { show: false },
        axisLabel: { color: '#888', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        axisLabel: { color: '#888', fontSize: 11 },
      },
      series: [{
        type: 'line',
        data: analytics.headcountTrend.map((d: any) => d.count),
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: true,
        lineStyle: { width: 3, color: '#667eea' },
        itemStyle: {
          color: '#667eea',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: { color: brandGradient },
        animationDuration: 1200,
        animationEasing: 'cubicInOut',
      }],
      animationDuration: 1200,
      animationEasing: 'cubicInOut',
    };

    // --- Department Distribution (rose pie) ---
    this.departmentOptions = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(30, 30, 46, 0.9)',
        borderColor: 'transparent',
        textStyle: { color: '#fff', fontSize: 13 },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 8,
        top: 'center',
        textStyle: { color: '#666', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 12,
      },
      series: [{
        type: 'pie',
        radius: ['40%', '72%'],
        center: ['35%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        data: analytics.departmentDistribution.map((d: any, i: number) => ({
          name: d.department,
          value: d.count,
          itemStyle: { color: palette[i % palette.length] },
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 80,
        animationDuration: 1000,
      }],
    };

    // --- Salary Distribution (gradient bars) ---
    this.salaryOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 30, 46, 0.9)',
        borderColor: 'transparent',
        textStyle: { color: '#fff', fontSize: 13 },
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p.name}<br/>${p.value} employee${p.value !== 1 ? 's' : ''}`;
        },
      },
      grid: { left: 48, right: 24, top: 16, bottom: 32 },
      xAxis: {
        type: 'category',
        data: analytics.salaryBands.map((d: any) => d.range),
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisTick: { show: false },
        axisLabel: { color: '#888', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        axisLabel: { color: '#888', fontSize: 11 },
      },
      series: [{
        type: 'bar',
        data: analytics.salaryBands.map((d: any, i: number) => ({
          value: d.count,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: palette[i % palette.length] },
                { offset: 1, color: palette[(i + 1) % palette.length] },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
        })),
        barWidth: '60%',
        animationDuration: 1000,
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 120,
      }],
    };

    // --- Tenure by Department (horizontal gradient bars) ---
    const tenureDepts = analytics.tenureByDepartment.map((d: any) => d.department);
    const tenureVals = analytics.tenureByDepartment.map((d: any) => parseFloat(d.averageTenure.toFixed(1)));

    this.tenureOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 30, 46, 0.9)',
        borderColor: 'transparent',
        textStyle: { color: '#fff', fontSize: 13 },
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p.name}<br/>${p.value} years`;
        },
      },
      grid: { left: 120, right: 40, top: 16, bottom: 16 },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        axisLabel: { color: '#888', fontSize: 11, formatter: '{value} yrs' },
      },
      yAxis: {
        type: 'category',
        data: tenureDepts,
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisTick: { show: false },
        axisLabel: { color: '#555', fontSize: 12 },
      },
      series: [{
        type: 'bar',
        data: tenureVals.map((v: number, i: number) => ({
          value: v,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: palette[i % palette.length] },
                { offset: 1, color: palette[(i + 2) % palette.length] },
              ],
            },
            borderRadius: [0, 6, 6, 0],
          },
        })),
        barWidth: '55%',
        animationDuration: 1200,
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 100,
      }],
    };
  }
}
