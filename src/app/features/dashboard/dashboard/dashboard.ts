import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService, DashboardResponse } from '../../../core/services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  private readonly cdr = inject(ChangeDetectorRef);

  dashboard: DashboardResponse | null = null;

  isLoading = false;

  errorMessage = '';

  stats: {
    title: string;
    value: number;
    icon: string;
    route: string;
  }[] = [];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadDashboard();
  }

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  loadDashboard(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();

    this.dashboardService.getDashboard().subscribe({
      next: (response: DashboardResponse) => {
        console.log('Dashboard Response:', response);

        this.dashboard = response;

        // =================================================
        // DASHBOARD STATISTICS
        // =================================================

        this.stats = [
          {
            title: 'Products',
            value: response.totalProducts,
            icon: 'bi-box-seam',
            route: '/products',
          },

          {
            title: 'Orders',
            value: response.totalOrders,
            icon: 'bi-cart-check',

            // Admin Orders
            route: '/admin/orders',
          },

          {
            title: 'Customers',
            value: response.totalCustomers,
            icon: 'bi-people',
            route: '/customers',
          },

          {
            title: 'Payments',
            value: response.totalPayments,
            icon: 'bi-credit-card',
            route: '/payments',
          },
        ];

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('Dashboard Loading:', this.isLoading);
      },

      error: (error: unknown) => {
        console.error('Dashboard API Error:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to load dashboard.');

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('Dashboard Loading:', this.isLoading);
      },
    });
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
