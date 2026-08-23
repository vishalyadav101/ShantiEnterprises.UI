import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { AdminUser, AdminUserService } from '../../../core/services/admin-user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  private readonly adminUserService = inject(AdminUserService);

  users: AdminUser[] = [];

  filteredUsers: AdminUser[] = [];

  searchTerm = '';

  selectedRole = 'All';

  selectedStatus = 'All';

  isLoading = false;

  isUpdating = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadUsers();
  }

  // =========================================================
  // LOAD USERS
  // =========================================================

  loadUsers(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.adminUserService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: AdminUser[]) => {
          console.log('Admin Users Response:', response);

          this.users = response;

          this.applyFilters();
        },

        error: (error: unknown) => {
          console.error('Admin Users API Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load users.');
        },
      });
  }

  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      // -----------------------------------------------
      // SEARCH
      // -----------------------------------------------

      const matchesSearch =
        !search ||
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.mobile.toLowerCase().includes(search);

      // -----------------------------------------------
      // ROLE
      // -----------------------------------------------

      const matchesRole = this.selectedRole === 'All' || user.role === this.selectedRole;

      // -----------------------------------------------
      // STATUS
      // -----------------------------------------------

      const matchesStatus =
        this.selectedStatus === 'All' ||
        (this.selectedStatus === 'Active' && user.isActive) ||
        (this.selectedStatus === 'Inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {
    this.applyFilters();
  }

  // =========================================================
  // ROLE FILTER
  // =========================================================

  onRoleChange(): void {
    this.applyFilters();
  }

  // =========================================================
  // STATUS FILTER
  // =========================================================

  onStatusChange(): void {
    this.applyFilters();
  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {
    this.searchTerm = '';

    this.selectedRole = 'All';

    this.selectedStatus = 'All';

    this.applyFilters();
  }

  // =========================================================
  // USER STATUS
  // =========================================================

  toggleStatus(user: AdminUser): void {
    if (this.isUpdating) {
      return;
    }

    const newStatus = !user.isActive;

    const action = newStatus ? 'activate' : 'deactivate';

    const confirmed = window.confirm(`Are you sure you want to ${action} "${user.fullName}"?`);

    if (!confirmed) {
      return;
    }

    this.isUpdating = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.adminUserService
      .updateStatus(user.userId, {
        isActive: newStatus,
      })
      .subscribe({
        next: (response: AdminUser) => {
          console.log('User Status Updated:', response);

          user.isActive = response.isActive;

          this.successMessage = response.isActive
            ? 'User activated successfully.'
            : 'User deactivated successfully.';

          this.isUpdating = false;

          this.applyFilters();

          this.clearSuccessMessage();
        },

        error: (error: unknown) => {
          console.error('User Status Update Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update user status.');

          this.isUpdating = false;
        },
      });
  }

  // =========================================================
  // DELETE USER
  // =========================================================

  deleteUser(user: AdminUser): void {
    if (this.isUpdating) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${user.fullName}"?`);

    if (!confirmed) {
      return;
    }

    this.isUpdating = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.adminUserService.delete(user.userId).subscribe({
      next: (response) => {
        console.log('User Delete Response:', response);

        this.successMessage = response?.message || 'User deleted successfully.';

        this.users = this.users.filter((item) => item.userId !== user.userId);

        this.applyFilters();

        this.isUpdating = false;

        this.clearSuccessMessage();
      },

      error: (error: unknown) => {
        console.error('User Delete Error:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to delete user.');

        this.isUpdating = false;
      },
    });
  }

  // =========================================================
  // COUNTS
  // =========================================================

  get totalUsers(): number {
    return this.users.length;
  }

  get customerCount(): number {
    return this.users.filter((user) => user.role.toLowerCase() === 'customer').length;
  }

  get adminCount(): number {
    return this.users.filter((user) => user.role.toLowerCase() === 'admin').length;
  }

  get activeCount(): number {
    return this.users.filter((user) => user.isActive).length;
  }

  get inactiveCount(): number {
    return this.users.filter((user) => !user.isActive).length;
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
  // TRACK
  // =========================================================

  trackByUser(index: number, user: AdminUser): number {
    return user.userId;
  }

  // =========================================================
  // SUCCESS MESSAGE
  // =========================================================

  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
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
