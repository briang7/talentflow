import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  token: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<AuthUser | null>(null);

  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role || 'EMPLOYEE');

  constructor(private router: Router) {
    // Restore from localStorage
    const stored = localStorage.getItem('tf_user');
    if (stored) {
      try {
        this.currentUser.set(JSON.parse(stored));
      } catch {
        localStorage.removeItem('tf_user');
      }
    }
  }

  login(user: AuthUser): void {
    this.currentUser.set(user);
    localStorage.setItem('tf_user', JSON.stringify(user));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('tf_user');
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  hasRole(roles: string[]): boolean {
    const role = this.userRole();
    return roles.includes(role);
  }
}
