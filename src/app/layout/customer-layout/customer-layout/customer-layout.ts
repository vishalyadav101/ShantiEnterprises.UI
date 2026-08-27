import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart';
import { WishlistService } from '../../../core/services/wishlist';

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

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadCartCount();
    this.loadWishlistCount();
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
  // LOGOUT
  // =========================================================

  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
