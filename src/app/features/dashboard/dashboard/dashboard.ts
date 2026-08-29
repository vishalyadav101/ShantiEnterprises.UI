import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { DashboardService, DashboardResponse } from '../../../core/services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly router = inject(Router);

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  dashboard: DashboardResponse | null = null;

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // SIDEBAR
  // =========================================================

  isSidebarOpen = false;

  adminMenu = [
    {
      title: 'Dashboard',
      icon: 'bi-grid-1x2-fill',
      route: '/admin',
    },

    {
      title: 'Orders',
      icon: 'bi-cart-check',
      route: '/admin/orders',
    },

    {
      title: 'Users',
      icon: 'bi-people',
      route: '/admin/users',
    },

    {
      title: 'Categories',
      icon: 'bi-folder',
      route: '/admin/categories',
    },

    {
      title: 'Products',
      icon: 'bi-box-seam',
      route: '/admin/products',
    },

    {
      title: 'Banners',
      icon: 'bi-images',
      route: '/admin/banners',
    },
    {
      title: 'Contact Enquiries',
      icon: 'bi-envelope',
      route: '/admin/contact-enquiries',
    },
    // =======================================================
    // BULK ENQUARIES
    // =======================================================
    {
      title: 'Bulk Enquiries',
      icon: 'bi-chat-left-text',
      route: '/admin/bulk-enquiries',
    },
    // =======================================================
    // SHIPMENTS
    // =======================================================

    {
      title: 'Shipments',
      icon: 'bi-truck',
      route: '/admin/shipments',
    },
    {
      title: 'Returns',
      icon: 'bi-arrow-return-left',
      route: '/admin/returns',
    },

    // =======================================================
    // REVIEWS
    // =======================================================

    {
      title: 'Reviews',
      icon: 'bi-star',
      route: '/admin/reviews',
    },
  ];

  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

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
            route: '/admin/products',
          },

          {
            title: 'Orders',
            value: response.totalOrders,
            icon: 'bi-cart-check',
            route: '/admin/orders',
          },

          {
            title: 'Customers',
            value: response.totalCustomers,
            icon: 'bi-people',
            route: '/admin/users',
          },

          {
            title: 'Payments',
            value: response.totalPayments,
            icon: 'bi-credit-card',
            route: '/admin/orders',
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
  // TOGGLE SIDEBAR
  // =========================================================

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // =========================================================
  // CLOSE SIDEBAR
  // =========================================================

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {
    localStorage.removeItem('token');

    localStorage.removeItem('user');

    this.router.navigate(['/login']);
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
