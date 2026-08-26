import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { WishlistService, WishlistItem } from '../../core/services/wishlist';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly wishlistService = inject(WishlistService);

  private readonly cartService = inject(CartService);

  private readonly router = inject(Router);

  // =========================================================
  // WISHLIST
  // =========================================================

  wishlistId = 0;

  userId = 0;

  createdDate = '';

  items: WishlistItem[] = [];

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  isRemoving = false;

  removingProductId: number | null = null;

  isClearing = false;

  isAddingToCart = false;

  addingProductId: number | null = null;

  // =========================================================
  // MESSAGES
  // =========================================================

  errorMessage = '';

  successMessage = '';

  cartMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadWishlist();
  }

  // =========================================================
  // LOAD WISHLIST
  // GET /api/Wishlist
  // =========================================================

  loadWishlist(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.wishlistService
      .getWishlist()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Wishlist API Response:', response);

          this.wishlistId = response.wishlistId;

          this.userId = response.userId;

          this.createdDate = response.createdDate;

          this.items = response.items || [];
        },

        error: (error: unknown) => {
          console.error('Wishlist API Error:', error);

          this.items = [];

          this.errorMessage = this.getErrorMessage(error, 'Unable to load wishlist.');
        },
      });
  }

  // =========================================================
  // ADD TO WISHLIST
  // POST /api/Wishlist
  // =========================================================

  addToWishlist(productId: number): void {
    if (!productId) {
      return;
    }

    if (this.items.some((item) => item.productId === productId)) {
      this.errorMessage = 'Product is already in your wishlist.';

      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    this.wishlistService.addToWishlist(productId).subscribe({
      next: (response) => {
        console.log('Wishlist Updated:', response);

        this.wishlistId = response.wishlistId;

        this.userId = response.userId;

        this.createdDate = response.createdDate;

        this.items = response.items || [];

        this.successMessage = 'Product added to wishlist.';

        this.clearSuccessMessage();
      },

      error: (error: unknown) => {
        console.error('Add Wishlist Error:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to add product to wishlist.');
      },
    });
  }

  // =========================================================
  // REMOVE ITEM
  // DELETE /api/Wishlist/{productId}
  // =========================================================

  removeItem(item: WishlistItem): void {
    if (this.isRemoving || this.isClearing) {
      return;
    }

    if (!item.productId) {
      return;
    }

    const confirmed = window.confirm(`Remove "${item.productName}" from your wishlist?`);

    if (!confirmed) {
      return;
    }

    this.isRemoving = true;

    this.removingProductId = item.productId;

    this.errorMessage = '';

    this.successMessage = '';

    this.wishlistService
      .removeFromWishlist(item.productId)
      .pipe(
        finalize(() => {
          this.isRemoving = false;

          this.removingProductId = null;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Wishlist Item Removed:', response);

          this.wishlistId = response.wishlistId;

          this.userId = response.userId;

          this.createdDate = response.createdDate;

          this.items = response.items || [];

          this.successMessage = 'Product removed from wishlist.';

          this.clearSuccessMessage();
        },

        error: (error: unknown) => {
          console.error('Remove Wishlist Error:', error);

          this.errorMessage = this.getErrorMessage(
            error,
            'Unable to remove product from wishlist.',
          );
        },
      });
  }

  // =========================================================
  // CLEAR WISHLIST
  // DELETE /api/Wishlist/clear
  // =========================================================

  clearWishlist(): void {
    if (this.isClearing || this.isRemoving) {
      return;
    }

    if (this.items.length === 0) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to clear your entire wishlist?');

    if (!confirmed) {
      return;
    }

    this.isClearing = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.wishlistService
      .clearWishlist()
      .pipe(
        finalize(() => {
          this.isClearing = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Wishlist Cleared:', response);

          this.items = [];

          this.successMessage = response?.message || 'Wishlist cleared successfully.';

          this.clearSuccessMessage();
        },

        error: (error: unknown) => {
          console.error('Clear Wishlist Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to clear wishlist.');
        },
      });
  }

  // =========================================================
  // ADD TO CART
  // =========================================================

  addToCart(item: WishlistItem): void {
    if (this.isAddingToCart) {
      return;
    }

    if (!item.isActive) {
      this.errorMessage = 'This product is currently inactive.';

      return;
    }

    this.isAddingToCart = true;

    this.addingProductId = item.productId;

    this.errorMessage = '';

    this.cartMessage = '';

    this.cartService
      .addItem({
        productId: item.productId,
        quantity: 1,
      })
      .pipe(
        finalize(() => {
          this.isAddingToCart = false;

          this.addingProductId = null;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Cart Updated:', response);

          this.cartMessage = `${item.productName} added to cart.`;

          this.clearCartMessage();
        },

        error: (error: unknown) => {
          console.error('Add To Cart Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to add product to cart.');
        },
      });
  }

  // =========================================================
  // VIEW PRODUCT
  // =========================================================

  viewProduct(productId: number): void {
    if (!productId) {
      return;
    }

    this.router.navigate(['/products', productId]);
  }

  // =========================================================
  // GO TO CART
  // =========================================================

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  // =========================================================
  // GO TO PRODUCTS
  // =========================================================

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  // =========================================================
  // TOTAL ITEMS
  // =========================================================

  get totalItems(): number {
    return this.items.length;
  }

  // =========================================================
  // CHECK EMPTY
  // =========================================================

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  // =========================================================
  // REMOVING CHECK
  // =========================================================

  isRemovingItem(productId: number): boolean {
    return this.isRemoving && this.removingProductId === productId;
  }

  // =========================================================
  // ADDING TO CART CHECK
  // =========================================================

  isAddingItem(productId: number): boolean {
    return this.isAddingToCart && this.addingProductId === productId;
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
  // CART MESSAGE
  // =========================================================

  private clearCartMessage(): void {
    setTimeout(() => {
      this.cartMessage = '';
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
        message?: string;
      };

      return apiError.error?.message || apiError.message || fallback;
    }

    return fallback;
  }
}
