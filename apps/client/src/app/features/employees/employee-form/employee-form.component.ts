import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';

const GET_FORM_DATA = gql`
  query GetFormData {
    departments { id name }
    roles { id title level }
    offices { id name city country }
    employees(first: 200) {
      edges { node { id firstName lastName } }
    }
  }
`;

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id firstName lastName email
    }
  }
`;

@Component({
  selector: 'tf-employee-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">person_add</mat-icon>
      Add New Employee
    </h2>

    <mat-dialog-content>
      @if (loadingFormData) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" placeholder="John">
            @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
              <mat-error>First name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" placeholder="Smith">
            @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
              <mat-error>Last name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="john.smith@talentflow.io">
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Invalid email format</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" placeholder="+1-555-0100">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Salary</mat-label>
            <span matTextPrefix>$&nbsp;</span>
            <input matInput formControlName="salary" type="number" placeholder="85000">
            @if (form.get('salary')?.hasError('required') && form.get('salary')?.touched) {
              <mat-error>Salary is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select formControlName="departmentId">
              @for (dept of departments; track dept.id) {
                <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
              }
            </mat-select>
            @if (form.get('departmentId')?.hasError('required') && form.get('departmentId')?.touched) {
              <mat-error>Department is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="roleId">
              @for (role of roles; track role.id) {
                <mat-option [value]="role.id">{{ role.title }}</mat-option>
              }
            </mat-select>
            @if (form.get('roleId')?.hasError('required') && form.get('roleId')?.touched) {
              <mat-error>Role is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Office / Location</mat-label>
            <mat-select formControlName="locationId">
              @for (office of offices; track office.id) {
                <mat-option [value]="office.id">{{ office.name }} - {{ office.city }}</mat-option>
              }
            </mat-select>
            @if (form.get('locationId')?.hasError('required') && form.get('locationId')?.touched) {
              <mat-error>Location is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Manager</mat-label>
            <mat-select formControlName="managerId">
              <mat-option [value]="null">None (Top Level)</mat-option>
              @for (mgr of managers; track mgr.id) {
                <mat-option [value]="mgr.id">{{ mgr.firstName }} {{ mgr.lastName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hire Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="hireDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            @if (form.get('hireDate')?.hasError('required') && form.get('hireDate')?.touched) {
              <mat-error>Hire date is required</mat-error>
            }
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
              [disabled]="!form.valid || saving"
              (click)="onSave()">
        @if (saving) {
          <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
        } @else {
          <mat-icon>save</mat-icon>
          Save Employee
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .title-icon {
      vertical-align: middle;
      margin-right: 8px;
      color: #667eea;
    }
    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;
      min-width: 500px;
    }
    .full-width {
      grid-column: span 2;
    }
    .btn-spinner {
      display: inline-block;
    }
    mat-dialog-content {
      max-height: 70vh;
    }
  `],
})
export class EmployeeFormComponent implements OnInit {
  private apollo = inject(Apollo);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EmployeeFormComponent>);

  form: FormGroup;
  departments: any[] = [];
  roles: any[] = [];
  offices: any[] = [];
  managers: any[] = [];
  loadingFormData = true;
  saving = false;

  constructor() {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      salary: [85000, [Validators.required, Validators.min(0)]],
      departmentId: ['', Validators.required],
      roleId: ['', Validators.required],
      locationId: ['', Validators.required],
      managerId: [null],
      hireDate: [new Date(), Validators.required],
    });
  }

  ngOnInit(): void {
    this.apollo.watchQuery<any>({ query: GET_FORM_DATA }).valueChanges.subscribe({
      next: ({ data }) => {
        this.departments = data?.departments || [];
        this.roles = (data?.roles || []).sort((a: any, b: any) => a.title.localeCompare(b.title));
        this.offices = data?.offices || [];
        this.managers = (data?.employees?.edges || []).map((e: any) => e.node)
          .sort((a: any, b: any) => a.lastName.localeCompare(b.lastName));
        this.loadingFormData = false;
      },
      error: () => { this.loadingFormData = false; },
    });
  }

  onSave(): void {
    if (!this.form.valid) return;

    this.saving = true;
    const val = this.form.value;

    const input: any = {
      firstName: val.firstName,
      lastName: val.lastName,
      email: val.email,
      phone: val.phone || null,
      salary: Number(val.salary),
      departmentId: val.departmentId,
      roleId: val.roleId,
      locationId: val.locationId,
      managerId: val.managerId || null,
      hireDate: val.hireDate.toISOString(),
    };

    this.apollo.mutate<any>({
      mutation: CREATE_EMPLOYEE,
      variables: { input },
    }).subscribe({
      next: ({ data }) => {
        this.saving = false;
        this.dialogRef.close(data?.createEmployee);
      },
      error: (err) => {
        this.saving = false;
        console.error('Failed to create employee:', err);
      },
    });
  }
}
