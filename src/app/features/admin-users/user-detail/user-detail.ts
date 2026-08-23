import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminUser, AdminUserService } from '../../../core/services/admin-user';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly adminUserService = inject(AdminUserService);

  user: AdminUser | null = null;

  userId = 0;

  isLoading = false;

  errorMessage = '';

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
          console.log('Admin User Detail Response:', response);

          this.user = response;
        },

        error: (error: unknown) => {
          console.error('Admin User Detail API Error:', error);

          this.user = null;

          this.errorMessage = this.getErrorMessage(error, 'Unable to load user details.');
        },
      });
  }

  // =========================================================
  // ROLE CLASS
  // =========================================================

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'role-admin';

      case 'customer':
        return 'role-customer';

      default:
        return 'role-default';
    }
  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
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
  