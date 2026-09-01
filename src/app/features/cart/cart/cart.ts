import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart';
import { ProductImageService } from '../../../core/services/product-image';

import { Cart, CartItem, ProductPriceTier } from '../../../core/models/cart.model';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly cartService = inject(CartService);
  private readonly productImageService = inject(ProductImageService);
  private readonly router = inject(Router);
  // =========================================================
  // CART
  // =========================================================

  cart: Cart | null = null;

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  isUpdating = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadCart();
  }

  // =========================================================
  // LOAD CART
  // =========================================================
  loadCart(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.cartService.getCart().subscribe({
      next: (response: Cart) => {
        console.log('Cart Response:', response);

        this.cart = response;

        // Load actual product images
        this.cart.items.forEach((item) => {
          this.loadProductImage(item);
        });

        this.isLoading = false;
      },

      error: (error: unknown) => {
        console.error('Cart API Error:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to load your cart.');

        this.isLoading = false;
      },
    });
  }
  // =========================================================
  // GO TO CHECKOUT
  // =========================================================

  goToCheckout(): void {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      return;
    }

    this.router.navigate(['/checkout']);
  }
  // =========================================================
  // PRODUCT IMAGE
  // =========================================================

  private loadProductImage(item: CartItem): void {
    this.productImageService.getByProductId(item.productId).subscribe({
      next: (images) => {
        if (!images || images.length === 0) {
          return;
        }

        // Primary image first
        const sortedImages = [...images].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) {
            return -1;
          }

          if (!a.isPrimary && b.isPrimary) {
            return 1;
          }

          return a.productImageId - b.productImageId;
        });

        const primaryImage = sortedImages[0];

        if (primaryImage?.imageUrl && this.cart) {
          const cartItem = this.cart.items.find(
            (cartItem) => cartItem.cartItemId === item.cartItemId,
          );

          if (cartItem) {
            cartItem.imageUrl = primaryImage.imageUrl;
          }
        }
      },

      error: (error) => {
        console.error(`Cart Product Image Error (${item.productId}):`, error);
      },
    });
  }

  // =========================================================
  // IMAGE URL
  // =========================================================

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }
  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  increaseQuantity(item: CartItem): void {
    if (this.isUpdating) {
      return;
    }

    const newQuantity = item.quantity + 1;

    this.updateQuantity(item, newQuantity);
  }

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  decreaseQuantity(item: CartItem): void {
    if (this.isUpdating || item.quantity <= 1) {
      return;
    }

    const newQuantity = item.quantity - 1;

    this.updateQuantity(item, newQuantity);
  }

  // =========================================================
  // UPDATE QUANTITY
  // =========================================================

  updateQuantity(item: CartItem, quantity: number): void {
    if (this.isUpdating || quantity < 1) {
      return;
    }

    this.isUpdating = true;

    this.errorMessage = '';
    this.successMessage = '';

    // Preserve currently loaded product images
    const existingImages = new Map<number, string>();

    if (this.cart?.items) {
      this.cart.items.forEach((cartItem) => {
        if (cartItem.imageUrl) {
          existingImages.set(cartItem.productId, cartItem.imageUrl);
        }
      });
    }

    this.cartService
      .updateItem(item.cartItemId, {
        quantity,
      })
      .subscribe({
        next: (response: Cart) => {
          console.log('Updated Cart Response:', response);

          // Restore images from the previous cart state
          response.items.forEach((cartItem) => {
            const existingImage = existingImages.get(cartItem.productId);

            if (existingImage) {
              cartItem.imageUrl = existingImage;
            }
          });

          this.cart = response;

          // If any image is still missing, load it from ProductImage API
          this.cart.items.forEach((cartItem) => {
            if (!cartItem.imageUrl) {
              this.loadProductImage(cartItem);
            }
          });

          this.isUpdating = false;
        },

        error: (error: unknown) => {
          console.error('Update Cart Item Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update cart item.');

          this.isUpdating = false;
        },
      });
  }

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  removeItem(item: CartItem): void {
    if (this.isUpdating) {
      return;
    }

    const confirmed = window.confirm(`Remove "${item.productName}" from your cart?`);

    if (!confirmed) {
      return;
    }

    this.isUpdating = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.cartService.removeItem(item.cartItemId).subscribe({
      next: (response) => {
        console.log('Remove Cart Item Response:', response);

        this.successMessage = response.message || 'Item removed from cart.';

        this.loadCart();

        this.isUpdating = false;

        this.clearSuccessMessage();
      },

      error: (error: unknown) => {
        console.error('Remove Cart Item Error:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to remove item from cart.');

        this.isUpdating = false;
      },
    });
  }

  // =========================================================
  // CLEAR COMPLETE CART
  // =========================================================

  clearCart(): void {
    if (this.isUpdating || !this.cart || this.cart.items.length === 0) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to clear your entire cart?');

    if (!confirmed) {
      return;
    }

    this.isUpdating = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.cartService.clearCart().subscribe({
      next: (response) => {
        console.log('Clear Cart Response:', response);

        this.successMessage = response.message || 'Cart cleared successfully.';

        this.loadCart();

        this.isUpdating = false;

        this.clearSuccessMessage();
      },

      error: (error: unknown) => {
        console.error('Clear Cart Error:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to clear cart.');

        this.isUpdating = false;
      },
    });
  }

  // =========================================================
  // TOTAL SAVINGS
  // =========================================================

  getTotalSavings(): number {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      return 0;
    }

    return this.cart.items.reduce(
      (total, item) => {
        const savingPerUnit = Math.max(0, Number(item.retailPrice) - Number(item.unitPrice));

        return total + savingPerUnit * Number(item.quantity);
      },

      0,
    );
  }

  // =========================================================
  // ITEM TOTAL SAVING
  // =========================================================

  getItemSavings(item: CartItem): number {
    const savingPerUnit = Math.max(0, Number(item.retailPrice) - Number(item.unitPrice));

    return savingPerUnit * Number(item.quantity);
  }

  // =========================================================
  // SAVING PER UNIT
  // =========================================================

  getItemSavingPerUnit(item: CartItem): number {
    return Math.max(0, Number(item.retailPrice) - Number(item.unitPrice));
  }

  // =========================================================
  // WHOLESALE PRICE APPLIED
  // =========================================================

  isWholesalePriceApplied(item: CartItem): boolean {
    return Number(item.unitPrice) < Number(item.retailPrice);
  }

  // =========================================================
  // CURRENT PRICE TIER
  // =========================================================

  getCurrentPriceTier(item: CartItem): ProductPriceTier | null {
    if (!item.priceTiers || item.priceTiers.length === 0) {
      return null;
    }

    const matchingTiers = item.priceTiers.filter((tier) => {
      const minQuantity = Number(tier.minQuantity);

      const maxQuantity =
        tier.maxQuantity === null || tier.maxQuantity === undefined
          ? null
          : Number(tier.maxQuantity);

      return item.quantity >= minQuantity && (maxQuantity === null || item.quantity <= maxQuantity);
    });

    if (matchingTiers.length === 0) {
      return null;
    }

    return (
      matchingTiers.sort(
        (first, second) => Number(second.minQuantity) - Number(first.minQuantity),
      )[0] || null
    );
  }

  // =========================================================
  // NEXT PRICE TIER
  // =========================================================

  getNextPriceTier(item: CartItem): ProductPriceTier | null {
    if (!item.priceTiers || item.priceTiers.length === 0) {
      return null;
    }

    const nextTiers = item.priceTiers
      .filter((tier) => Number(tier.minQuantity) > Number(item.quantity))
      .sort((first, second) => Number(first.minQuantity) - Number(second.minQuantity));

    return nextTiers[0] || null;
  }

  // =========================================================
  // QUANTITY REQUIRED FOR NEXT TIER
  // =========================================================

  getQuantityToNextTier(item: CartItem): number {
    const nextTier = this.getNextPriceTier(item);

    if (!nextTier) {
      return 0;
    }

    return Math.max(0, Number(nextTier.minQuantity) - Number(item.quantity));
  }

  // =========================================================
  // NEXT TIER EXISTS
  // =========================================================

  hasNextPriceTier(item: CartItem): boolean {
    return this.getNextPriceTier(item) !== null;
  }

  // =========================================================
  // BEST PRICE UNLOCKED
  // =========================================================

  isBestPriceUnlocked(item: CartItem): boolean {
    return (
      !!item.priceTiers &&
      item.priceTiers.length > 0 &&
      !this.hasNextPriceTier(item) &&
      Number(item.unitPrice) < Number(item.retailPrice)
    );
  }

  // =========================================================
  // CURRENT TIER LABEL
  // =========================================================

  getCurrentTierLabel(item: CartItem): string {
    const tier = this.getCurrentPriceTier(item);

    if (!tier) {
      return 'Retail Price';
    }

    if (tier.maxQuantity === null || tier.maxQuantity === undefined) {
      return `${tier.minQuantity}+`;
    }

    return `${tier.minQuantity}-${tier.maxQuantity}`;
  }

  // =========================================================
  // NEXT TIER LABEL
  // =========================================================

  getNextTierLabel(item: CartItem): string {
    const tier = this.getNextPriceTier(item);

    if (!tier) {
      return '';
    }

    if (tier.maxQuantity === null || tier.maxQuantity === undefined) {
      return `${tier.minQuantity}+`;
    }

    return `${tier.minQuantity}-${tier.maxQuantity}`;
  }

  // =========================================================
  // CLEAR SUCCESS MESSAGE
  // =========================================================

  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  // =========================================================
  // TRACK BY CART ITEM
  // =========================================================

  trackByCartItem(index: number, item: CartItem): number {
    return item.cartItemId;
  }

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        error?: {
          message?: string;

          title?: string;
        };

        message?: string;
      };

      return apiError.error?.message || apiError.error?.title || apiError.message || fallback;
    }

    return fallback;
  }
}
