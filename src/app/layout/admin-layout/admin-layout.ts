import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly router = inject(Router);

  // =========================================================
  // SIDEBAR
  // =========================================================

  isSidebarOpen = false;

  // =========================================================
  // ADMIN MENU
  // =========================================================

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

    {
      title: 'Bulk Enquiries',
      icon: 'bi-chat-left-text',
      route: '/admin/bulk-enquiries',
    },

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

    {
      title: 'Reviews',
      icon: 'bi-star',
      route: '/admin/reviews',
    },
  ];

  // =========================================================
  // SIDEBAR TOGGLE
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

    this.closeSidebar();

    this.router.navigate(['/login']);
  }
}
