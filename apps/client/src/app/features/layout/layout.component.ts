import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'tf-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav
        [mode]="'side'"
        [opened]="true"
        class="app-sidenav"
        [class.collapsed]="collapsed()">

        <div class="sidenav-header">
          <mat-icon class="brand-icon">analytics</mat-icon>
          @if (!collapsed()) {
            <span class="brand-name">TalentFlow</span>
          }
        </div>

        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active-link"
               [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              @if (!collapsed()) {
                <span matListItemTitle>{{ item.label }}</span>
              }
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider></mat-divider>
          <div class="user-section" [class.compact]="collapsed()">
            <div class="user-avatar">
              {{ user()?.employee?.firstName?.charAt(0) || 'U' }}{{ user()?.employee?.lastName?.charAt(0) || '' }}
            </div>
            @if (!collapsed()) {
              <div class="user-info">
                <span class="user-name">{{ user()?.employee?.firstName }} {{ user()?.employee?.lastName }}</span>
                <span class="user-role">{{ user()?.role }}</span>
              </div>
            }
          </div>
          <button mat-icon-button (click)="toggleCollapsed()" class="collapse-btn">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="app-content" [class.content-collapsed]="collapsed()">
        <mat-toolbar class="app-toolbar">
          <button mat-icon-button (click)="toggleCollapsed()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
          <button mat-icon-button>
            <mat-icon>notifications_none</mat-icon>
          </button>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item disabled>
              <mat-icon>person</mat-icon>
              <span>{{ user()?.email }}</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <div class="page-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container {
      height: 100vh;
    }
    .app-sidenav {
      width: 260px;
      background: #1a1a2e;
      color: #fff;
      transition: width 0.3s ease;
      display: flex;
      flex-direction: column;
      border-right: none;
    }
    .app-sidenav.collapsed {
      width: 68px;
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      min-height: 64px;
    }
    .brand-icon {
      color: #667eea;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      white-space: nowrap;
    }
    mat-nav-list a {
      color: #a0a0b8 !important;
      border-radius: 8px;
      margin: 2px 8px;
    }
    mat-nav-list a:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #fff !important;
    }
    mat-nav-list a.active-link {
      background: rgba(102, 126, 234, 0.2) !important;
      color: #667eea !important;
    }
    mat-nav-list a.active-link mat-icon {
      color: #667eea !important;
    }
    .sidenav-footer {
      margin-top: auto;
      padding: 12px;
    }
    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 4px;
    }
    .user-section.compact {
      justify-content: center;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }
    .user-role {
      font-size: 12px;
      color: #a0a0b8;
      text-transform: capitalize;
    }
    .collapse-btn {
      color: #a0a0b8 !important;
    }
    mat-divider {
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    .app-toolbar {
      background: #fff;
      color: #333;
      border-bottom: 1px solid #e0e0e0;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .toolbar-spacer {
      flex: 1;
    }
    .page-content {
      padding: 24px;
      background: #f5f5f7;
      min-height: calc(100vh - 64px);
    }
  `],
})
export class LayoutComponent {
  private authService = inject(AuthService);
  collapsed = signal(false);
  user = this.authService.user;

  navItems = [
    { route: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { route: '/employees', icon: 'people', label: 'Employees' },
    { route: '/org-chart', icon: 'account_tree', label: 'Org Chart' },
    { route: '/reviews', icon: 'rate_review', label: 'Reviews' },
    { route: '/reports', icon: 'assessment', label: 'Reports' },
  ];

  toggleCollapsed(): void {
    this.collapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
