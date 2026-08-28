import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart';
import { WishlistService } from '../../../core/services/wishlist';
import { NotificationService } from '../../../core/services/notification';

import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss',
})
export class CustomerLayout implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly authService = inject(AuthService);

  private readonly cartService = inject(CartService);

  private readonly wishlistService = inject(WishlistService);

  private readonly notificationService = inject(NotificationService);

  private readonly router = inject(Router);

  // =========================================================
  // USER
  // =========================================================

  user = this.authService.getCurrentUser();

  // =========================================================
  // NAVBAR COUNTS
  // =========================================================

  cartItemCount = 0;

  wishlistCount = 0;

  notificationCount = 0;

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  notifications: Notification[] = [];

  isNotificationMenuOpen = false;

  isNotificationLoading = false;

  isMarkingAllAsRead = false;

  // =========================================================
  // PROFILE MENU
  // =========================================================

  isProfileMenuOpen = false;

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadCartCount();

    this.loadWishlistCount();

    this.loadNotifications();
  }

  // =========================================================
  // CART COUNT
  // =========================================================

  loadCartCount(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItemCount = cart?.totalItems ?? 0;
      },

      error: (error) => {
        console.error('Cart Count Error:', error);

        this.cartItemCount = 0;
      },
    });
  }

  // =========================================================
  // WISHLIST COUNT
  // =========================================================

  loadWishlistCount(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.wishlistCount = wishlist?.totalItems ?? 0;
      },

      error: (error) => {
        console.error('Wishlist Count Error:', error);

        this.wishlistCount = 0;
      },
    });
  }

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  loadNotifications(): void {
    this.isNotificationLoading = true;

    this.notificationService.getAll().subscribe({
      next: (notifications) => {
        this.notifications = notifications ?? [];

        this.updateNotificationCount();

        this.isNotificationLoading = false;
      },

      error: (error) => {
        console.error('Notification Load Error:', error);

        this.notifications = [];

        this.notificationCount = 0;

        this.isNotificationLoading = false;
      },
    });
  }

  // =========================================================
  // UPDATE NOTIFICATION COUNT
  // =========================================================

  private updateNotificationCount(): void {
    this.notificationCount = this.notifications.filter(
      (notification) => !notification.isRead,
    ).length;
  }

  // =========================================================
  // TOGGLE NOTIFICATION MENU
  // =========================================================

  toggleNotificationMenu(): void {
    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;

    if (this.isNotificationMenuOpen) {
      this.loadNotifications();
    }
  }

  // =========================================================
  // CLOSE NOTIFICATION MENU
  // =========================================================

  closeNotificationMenu(): void {
    this.isNotificationMenuOpen = false;
  }

  // =========================================================
  // MARK NOTIFICATION AS READ
  // =========================================================

  markNotificationAsRead(notification: Notification): void {
    if (!notification || notification.isRead) {
      return;
    }

    this.notificationService
      .markAsRead(notification.notificationId)
      .subscribe({
        next: () => {
          notification.isRead = true;

          notification.readDate = new Date().toISOString();

          this.updateNotificationCount();

          this.handleNotificationNavigation(notification);
        },

        error: (error) => {
          console.error('Mark Notification Read Error:', error);

          // Notification navigation read ke bina bhi
          // tabhi hogi jab reference available ho.
          this.handleNotificationNavigation(notification);
        },
      });
  }

  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  markAllNotificationsAsRead(): void {
    if (
      this.isMarkingAllAsRead ||
      this.notificationCount === 0
    ) {
      return;
    }

    this.isMarkingAllAsRead = true;

    this.notificationService
      .markAllAsRead()
      .subscribe({
        next: () => {
          this.notifications.forEach((notification) => {
            notification.isRead = true;

            notification.readDate =
              new Date().toISOString();
          });

          this.notificationCount = 0;

          this.isMarkingAllAsRead = false;
        },

        error: (error) => {
          console.error(
            'Mark All Notifications Read Error:',
            error,
          );

          this.isMarkingAllAsRead = false;
        },
      });
  }

  // =========================================================
  // NOTIFICATION NAVIGATION
  // =========================================================

  private handleNotificationNavigation(
    notification: Notification,
  ): void {
    this.closeNotificationMenu();

    if (
      notification.referenceType?.toLowerCase() ===
        'order' &&
      notification.referenceId
    ) {
      this.router.navigate([
        '/orders',
        notification.referenceId,
      ]);

      return;
    }

    // Future notification types can be handled here.
  }

  // =========================================================
  // NOTIFICATION TIME
  // =========================================================

  formatNotificationDate(date: string): string {
    if (!date) {
      return '';
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  }

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  getNotificationIcon(
    type: string | null | undefined,
  ): string {
    if (!type) {
      return 'bi-bell';
    }

    switch (type.toLowerCase()) {
      case 'order':
        return 'bi-box-seam';

      case 'payment':
        return 'bi-credit-card';

      case 'shipment':
        return 'bi-truck';

      case 'review':
        return 'bi-star';

      case 'wishlist':
        return 'bi-heart';

      default:
        return 'bi-bell';
    }
  }

  // =========================================================
  // PROFILE MENU
  // =========================================================

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  // =========================================================
  // CLOSE PROFILE MENU
  // =========================================================

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  // =========================================================
  // LOGOUT FROM PROFILE MENU
  // =========================================================

  logoutFromProfile(): void {
    this.closeProfileMenu();

    this.logout();
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {
    this.closeProfileMenu();

    this.closeNotificationMenu();

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}