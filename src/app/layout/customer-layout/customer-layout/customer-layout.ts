import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart';
import { WishlistService } from '../../../core/services/wishlist';
import { NotificationService } from '../../../core/services/notification';
import { WebsiteSettingService } from '../../../core/services/website-setting';
import { WebsiteSetting } from '../../../core/models/website-setting.model';

import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
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

  private readonly websiteSettingService = inject(WebsiteSettingService);

  private readonly document = inject(DOCUMENT);

  private readonly router = inject(Router);

  // =========================================================
  // NOTIFICATION WRAPPER
  // =========================================================

  @ViewChild('notificationWrapper')
  notificationWrapper?: ElementRef<HTMLElement>;

  // =========================================================
  // PROFILE WRAPPER
  // =========================================================

  @ViewChild('profileWrapper')
  profileWrapper?: ElementRef<HTMLElement>;

  // =========================================================
  // USER
  // =========================================================

  user = this.authService.getCurrentUser();

  // =========================================================
  // WEBSITE SETTING
  // =========================================================

  websiteSetting: WebsiteSetting | null = null;

  currentYear = new Date().getFullYear();

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
  // ACTIVE NAVBAR ITEM
  // Only one navbar item can be active at a time.
  // =========================================================

  activeNavItem:
    'home' | 'viewall' | 'wishlist' | 'cart' | 'notification' | 'profile' | 'callus' | null =
    'home';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadWebsiteSetting();

    // Cart, wishlist and notifications require authentication.
    // Do not call these APIs for a guest user.
    if (this.user) {
      this.loadCartCount();
      this.loadWishlistCount();
      this.loadNotifications();
    }
  }

  // =========================================================
  // WEBSITE SETTING
  // =========================================================

  loadWebsiteSetting(): void {
    this.websiteSettingService.getSettings().subscribe({
      next: (setting) => {
        this.websiteSetting = setting;
        this.setFavicon(setting.faviconUrl);
      },
      error: (error) => {
        console.error('Website Setting Load Error:', error);
        this.websiteSetting = null;
      },
    });
  }

  setFavicon(faviconUrl: string | null): void {
    if (!faviconUrl) {
      return;
    }

    let faviconLink =
      this.document.head.querySelector<HTMLLinkElement>(
        'link[rel~="icon"]'
      );

    if (!faviconLink) {
      faviconLink = this.document.createElement('link');
      faviconLink.rel = 'icon';
      this.document.head.appendChild(faviconLink);
    }

    faviconLink.href = faviconUrl;
  }

  getPhoneLink(): string {
    const phone = this.websiteSetting?.phone?.trim();
    return phone ? `tel:${phone}` : 'tel:9199392833';
  }

  // =========================================================
  // DOCUMENT CLICK
  // CLOSE MENUS WHEN CLICKING OUTSIDE
  // =========================================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;

    // =======================================================
    // NOTIFICATION WRAPPER
    // =======================================================

    const notificationWrapper = this.notificationWrapper?.nativeElement;

    const clickedInsideNotification = notificationWrapper?.contains(clickedElement) ?? false;

    // =======================================================
    // PROFILE WRAPPER
    // =======================================================

    const profileWrapper = this.profileWrapper?.nativeElement;

    const clickedInsideProfile = profileWrapper?.contains(clickedElement) ?? false;

    // =======================================================
    // CLICK INSIDE NOTIFICATION / PROFILE
    // =======================================================

    if (clickedInsideNotification || clickedInsideProfile) {
      return;
    }

    // =======================================================
    // CLICK ON NAVBAR ITEM
    // =======================================================
    //
    // Home / Wishlist / Cart apna activeNavItem khud set
    // karte hain. Document click unko Home par reset nahi karega.
    // =======================================================

    const clickedNavbarItem = clickedElement.closest(
      '.nav-home-button, .nav-action, .user-profile-btn',
    );

    if (clickedNavbarItem) {
      // Clicking another navbar item must close any open dropdown.
      // The clicked navbar item's own click handler will set its active state.
      this.closeNotificationMenu();
      this.closeProfileMenu();
      return;
    }

    // =======================================================
    // CLICK OUTSIDE
    // =======================================================
    //
    // Sirf dropdowns close honge.
    // Active page/item ko change nahi karna hai.
    // =======================================================

    this.closeNotificationMenu();

    this.closeProfileMenu();
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
  // ACTIVE NAVBAR ITEM
  // =========================================================

  setActiveNavItem(
    item: 'home' | 'viewall' | 'wishlist' | 'cart' | 'notification' | 'profile' | 'callus',
  ): void {
    this.activeNavItem = item;
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
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;

    if (this.isNotificationMenuOpen) {
      // Notification becomes the ONLY active item.
      this.activeNavItem = 'notification';

      // Close profile menu.
      this.closeProfileMenu();

      // Fresh notifications load.
      this.loadNotifications();
    } else {
      // When notification closes, return to Home.
      this.activeNavItem = 'home';
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

    this.notificationService.markAsRead(notification.notificationId).subscribe({
      next: () => {
        notification.isRead = true;

        notification.readDate = new Date().toISOString();

        this.updateNotificationCount();

        this.handleNotificationNavigation(notification);
      },

      error: (error) => {
        console.error('Mark Notification Read Error:', error);

        this.handleNotificationNavigation(notification);
      },
    });
  }

  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  markAllNotificationsAsRead(): void {
    if (this.isMarkingAllAsRead || this.notificationCount === 0) {
      return;
    }

    this.isMarkingAllAsRead = true;

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((notification) => {
          notification.isRead = true;

          notification.readDate = new Date().toISOString();
        });

        this.notificationCount = 0;

        this.isMarkingAllAsRead = false;
      },

      error: (error) => {
        console.error('Mark All Notifications Read Error:', error);

        this.isMarkingAllAsRead = false;
      },
    });
  }

  // =========================================================
  // NOTIFICATION NAVIGATION
  // =========================================================

  private handleNotificationNavigation(notification: Notification): void {
    this.closeNotificationMenu();

    if (notification.referenceType?.toLowerCase() === 'order' && notification.referenceId) {
      this.router.navigate(['/orders', notification.referenceId]);

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

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  getNotificationIcon(type: string | null | undefined): string {
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
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isProfileMenuOpen = !this.isProfileMenuOpen;

    if (this.isProfileMenuOpen) {
      // Profile becomes the ONLY active item.
      this.activeNavItem = 'profile';

      // Close notification menu.
      this.closeNotificationMenu();
    } else {
      // When profile closes, return to Home.
      this.activeNavItem = 'home';
    }
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

    this.activeNavItem = 'home';

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
