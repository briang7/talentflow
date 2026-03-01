import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
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
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <div class="app-shell">
      <aside class="sidebar" [class.collapsed]="collapsed()">
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
      </aside>

      <main class="main-area">
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
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      min-width: 260px;
      background: #1a1a2e;
      color: #fff;
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      z-index: 20;
    }
    .sidebar.collapsed {
      width: 68px;
      min-width: 68px;
    }

    /* Main content fills remaining space */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

    /* Nav list tokens */
    mat-nav-list {
      --mdc-list-list-item-label-text-color: #d0d0e0;
      --mdc-list-list-item-hover-label-text-color: #fff;
      --mdc-list-list-item-focus-label-text-color: #fff;
      --mdc-list-list-item-leading-icon-color: #c0c0d4;
      --mdc-list-list-item-hover-leading-icon-color: #fff;
      --mdc-list-list-item-hover-state-layer-color: rgba(255, 255, 255, 0.1);
      --mdc-list-list-item-hover-state-layer-opacity: 1;
    }
    mat-nav-list a {
      border-radius: 8px;
      margin: 2px 8px;
    }
    mat-nav-list a.active-link {
      background: rgba(102, 126, 234, 0.25) !important;
      --mdc-list-list-item-label-text-color: #8fa4f0;
      --mdc-list-list-item-leading-icon-color: #8fa4f0;
    }

    /* Footer */
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

    /* Toolbar */
    .app-toolbar {
      background: #fff;
      color: #333;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
      z-index: 10;
    }
    .toolbar-spacer {
      flex: 1;
    }

    /* Page content */
    .page-content {
      padding: 24px;
      background: #f5f5f7;
      flex: 1;
      overflow-y: auto;
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
