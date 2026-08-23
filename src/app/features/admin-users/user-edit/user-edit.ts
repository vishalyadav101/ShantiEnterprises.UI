import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AdminUser, AdminUserService, AdminUserUpdate } from '../../../core/services/admin-user';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.scss',
})
export class UserEdit implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly adminUserService = inject(AdminUserService);

  user: AdminUser | null = null;

  userId = 0;

  form: AdminUserUpdate = {
    fullName: '',
    email: '',
    mobile: '',
    role: 'Customer',
  };

  isLoading = false;

  isSaving = false;

  errorMessage = '';

  successMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid user ID.';
      return;
    }

    this.userId = id;

    this.loadUser();
  }

  // =========================================================
  // LOAD USER
  // =========================================================

  loadUser(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.adminUserService
      .getById(this.userId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: AdminUser) => {
          console.log('Admin User Edit Response:', response);

          this.user = response;

          this.form = {
            fullName: response.fullName,
            email: response.email,
            mobile: response.mobile,
            role: response.role,
          };
        },

        error: (error: unknown) => {
          console.error('Admin User Edit API Error:', error);

          this.user = null;

          this.errorMessage = this.getErrorMessage(error, 'Unable to load user details.');
        },
      });
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {
    if (this.isSaving) {
      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    this.form.fullName = this.form.fullName.trim();

    this.form.email = this.form.email.trim();

    this.form.mobile = this.form.mobile.trim();

    this.form.role = this.form.role.trim();

    if (!this.form.fullName) {
      this.errorMessage = 'Full name is required.';
      return;
    }

    if (!this.form.email) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (!this.form.mobile) {
      this.errorMessage = 'Mobile number is required.';
      return;
    }

    if (!this.form.role) {
      this.errorMessage = 'Role is required.';
      return;
    }

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    this.isSaving = true;

    this.adminUserService
      .update(this.userId, this.form)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: (response: AdminUser) => {
          console.log('User Updated:', response);

          this.user = response;

          this.successMessage = 'User updated successfully.';

          setTimeout(() => {
            this.router.navigate(['/admin/users', this.userId]);
          }, 800);
        },

        error: (error: unknown) => {
          console.error('User Update Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update user.');
        },
      });
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {
    this.router.navigate(['/admin/users', this.userId]);
  }

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        error?: {
          message?: string;
        };
      };

      return apiError.error?.message || fallback;
    }

    return fallback;
  }
}
