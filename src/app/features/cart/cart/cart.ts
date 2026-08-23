import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart';
import { Cart, CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);

  cart: Cart | null = null;

  isLoading = false;

  isUpdating = false;

  errorMessage = '';

  successMessage = '';

  ngOnInit(): void {
    this.loadCart();
  }

  /**
   * Load current user's cart
   *
   * GET /api/Cart
   */
  loadCart(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.cartService.getCart().subscribe({
      next: (response: Cart) => {
        console.log('Cart Response:', response);

        this.cart = response;

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Cart API Error:', error);

        this.errorMessage = error?.error?.message || 'Unable to load your cart.';

        this.isLoading = false;
      },
    });
  }

  /**
   * Increase item quantity
   */
  increaseQuantity(item: CartItem): void {
    const newQuantity = item.quantity + 1;

    this.updateQuantity(item, newQuantity);
  }

  /**
   * Decrease item quantity
   */
  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      return;
    }

    const newQuantity = item.quantity - 1;

    this.updateQuantity(item, newQuantity);
  }

  /**
   * Update cart item quantity
   *
   * PUT /api/Cart/items/{cartItemId}
   */
  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1) {
      return;
    }

    this.isUpdating = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.cartService
      .updateItem(item.cartItemId, {
        quantity,
      })
      .subscribe({
        next: (response: Cart) => {
          console.log('Updated Cart Response:', response);

          this.cart = response;

          this.isUpdating = false;
        },

        error: (error) => {
          console.error('Update Cart Item Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to update cart item.';

          this.isUpdating = false;
        },
      });
  }

  /**
   * Remove single cart item
   *
   * DELETE /api/Cart/items/{cartItemId}
   *
   * Backend returns only a message,
   * so cart is loaded again after deletion.
   */
  removeItem(item: CartItem): void {
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

      error: (error) => {
        console.error('Remove Cart Item Error:', error);

        this.errorMessage = error?.error?.message || 'Unable to remove item from cart.';

        this.isUpdating = false;
      },
    });
  }

  /**
   * Clear complete cart
   *
   * DELETE /api/Cart/clear
   *
   * Backend returns only a message,
   * so cart is loaded again after clearing.
   */
  clearCart(): void {
    if (!this.cart || this.cart.items.length === 0) {
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

      error: (error) => {
        console.error('Clear Cart Error:', error);

        this.errorMessage = error?.error?.message || 'Unable to clear cart.';

        this.isUpdating = false;
      },
    });
  }

  /**
   * Clear success message after 3 seconds
   */
  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Track cart items efficiently
   */
  trackByCartItem(index: number, item: CartItem): number {
    return item.cartItemId;
  }
}
