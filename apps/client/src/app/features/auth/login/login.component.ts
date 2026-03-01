import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

const LOGIN_MUTATION = gql`
  mutation Login($firebaseToken: String!) {
    login(firebaseToken: $firebaseToken) {
      token
      user {
        id
        email
        role
        employee {
          id
          firstName
          lastName
          avatar
        }
      }
    }
  }
`;

@Component({
  selector: 'tf-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="login-header">
          <div class="logo">
            <mat-icon class="logo-icon">analytics</mat-icon>
            <h1>TalentFlow</h1>
          </div>
          <p class="subtitle">HR Analytics Dashboard</p>
        </div>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-icon matSuffix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width login-btn"
              [disabled]="loading || loginForm.invalid">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="demo-accounts">
            <p class="demo-label">Demo Accounts:</p>
            <div class="demo-buttons">
              <button mat-stroked-button (click)="quickLogin('sarah.chen@talentflow.dev')" class="demo-btn">
                <span class="demo-role">Admin</span>
                <span class="demo-email">sarah.chen</span>
              </button>
              <button mat-stroked-button (click)="quickLogin('emma.wilson@talentflow.dev')" class="demo-btn">
                <span class="demo-role">HR Manager</span>
                <span class="demo-email">emma.wilson</span>
              </button>
              <button mat-stroked-button (click)="quickLogin('alex.rivera@talentflow.dev')" class="demo-btn">
                <span class="demo-role">Team Lead</span>
                <span class="demo-email">alex.rivera</span>
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .logo-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }
    .logo h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: #666;
      margin-top: 4px;
      font-size: 14px;
    }
    .full-width {
      width: 100%;
    }
    .login-btn {
      height: 48px;
      font-size: 16px;
      margin-top: 8px;
    }
    .demo-accounts {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    .demo-label {
      text-align: center;
      color: #888;
      font-size: 13px;
      margin-bottom: 12px;
    }
    .demo-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .demo-btn {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    .demo-role {
      font-weight: 600;
      font-size: 13px;
    }
    .demo-email {
      color: #888;
      font-size: 12px;
    }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private authService: AuthService,
    private notification: NotificationService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.performLogin(this.loginForm.value.email);
  }

  quickLogin(email: string): void {
    this.performLogin(email);
  }

  private performLogin(email: string): void {
    this.loading = true;
    this.apollo.mutate({
      mutation: LOGIN_MUTATION,
      variables: { firebaseToken: `dev:${email}` },
    }).subscribe({
      next: (result: any) => {
        const { token, user } = result.data.login;
        this.authService.login({ ...user, token });
        this.notification.success(`Welcome back, ${user.employee?.firstName || user.email}!`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(err.message || 'Login failed');
      },
    });
  }
}
