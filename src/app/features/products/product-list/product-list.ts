import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService } from '../../../core/services/product';
import { CartService } from '../../../core/services/cart';

import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);

  private readonly cartService = inject(CartService);

  private readonly router = inject(Router);

  products: Product[] = [];

  isLoading = false;

  isAddingToCart = false;

  addingProductId: number | null = null;

  errorMessage = '';

  cartMessage = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load active products from backend
   *
   * Backend:
   * GET /api/Product
   */
  loadProducts(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.productService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (products) => {
          console.log('Product API Response:', products);

          this.products = products.filter((product) => product.isActive);
        },

        error: (error) => {
          console.error('Product API Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load products.';
        },
      });
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product): void {
    if (product.stock <= 0) {
      return;
    }

    if (this.isAddingToCart) {
      return;
    }

    this.isAddingToCart = true;

    this.addingProductId = product.productId;

    this.cartMessage = '';

    this.errorMessage = '';

    this.cartService
      .addItem({
        productId: product.productId,

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

          this.cartMessage = `${product.productName} added to cart.`;

          setTimeout(() => {
            this.cartMessage = '';
          }, 3000);
        },

        error: (error) => {
          console.error('Add To Cart Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to add product to cart.';
        },
      });
  }

  /**
   * Open cart page
   */
  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
