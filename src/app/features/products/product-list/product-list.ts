import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService } from '../../../core/services/product';
import { CartService } from '../../../core/services/cart';
import { ProductImageService, ProductImage } from '../../../core/services/product-image';

import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly productService = inject(ProductService);

  private readonly productImageService = inject(ProductImageService);

  private readonly cartService = inject(CartService);

  private readonly router = inject(Router);

  // =========================================================
  // PRODUCTS
  // =========================================================

  products: Product[] = [];

  // =========================================================
  // PRODUCT IMAGES
  // =========================================================

  /**
   * Stores uploaded images for every product.
   *
   * Example:
   *
   * {
   *   1: [image1, image2, image3],
   *   2: [image4, image5]
   * }
   */
  productImages: Record<number, ProductImage[]> = {};

  /**
   * Current image index for each product.
   */
  currentImageIndex: Record<number, number> = {};

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  isLoadingImages: Record<number, boolean> = {};

  isAddingToCart = false;

  addingProductId: number | null = null;

  errorMessage = '';

  cartMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadProducts();
  }

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

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

          // Reset image state
          this.productImages = {};

          this.currentImageIndex = {};

          // Load uploaded images for every product
          this.products.forEach((product) => {
            this.loadProductImages(product);
          });
        },

        error: (error) => {
          console.error('Product API Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load products.';
        },
      });
  }

  // =========================================================
  // LOAD PRODUCT IMAGES
  // =========================================================

  private loadProductImages(product: Product): void {
    this.isLoadingImages[product.productId] = true;

    this.productImageService
      .getByProductId(product.productId)
      .pipe(
        finalize(() => {
          this.isLoadingImages[product.productId] = false;
        }),
      )
      .subscribe({
        next: (images) => {
          console.log(`Images for Product ${product.productId}:`, images);

          // ---------------------------------------------------
          // PRIMARY IMAGE FIRST
          // ---------------------------------------------------

          const sortedImages = [...images].sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) {
              return -1;
            }

            if (!a.isPrimary && b.isPrimary) {
              return 1;
            }

            return a.productImageId - b.productImageId;
          });

          this.productImages[product.productId] = sortedImages;

          // Always start from primary / first image
          this.currentImageIndex[product.productId] = 0;
        },

        error: (error) => {
          console.error(`Product Image Error (${product.productId}):`, error);

          // ---------------------------------------------------
          // FALLBACK TO PRODUCT.imageUrl
          // ---------------------------------------------------

          if (product.imageUrl) {
            this.productImages[product.productId] = [
              {
                productImageId: 0,
                productId: product.productId,
                imageUrl: product.imageUrl,
                isPrimary: true,
              },
            ];
          } else {
            this.productImages[product.productId] = [];
          }

          this.currentImageIndex[product.productId] = 0;
        },
      });
  }

  // =========================================================
  // GET PRODUCT IMAGES
  // =========================================================

  getImages(product: Product): ProductImage[] {
    return this.productImages[product.productId] || [];
  }

  // =========================================================
  // GET CURRENT IMAGE
  // =========================================================

  getCurrentImage(product: Product): ProductImage | null {
    const images = this.getImages(product);

    if (!images.length) {
      return null;
    }

    const index = this.currentImageIndex[product.productId] ?? 0;

    return images[index] || images[0];
  }

  // =========================================================
  // GET CURRENT IMAGE URL
  // =========================================================

  getCurrentImageUrl(product: Product): string {
    const image = this.getCurrentImage(product);

    if (!image?.imageUrl) {
      return '';
    }

    return this.getImageUrl(image.imageUrl);
  }

  // =========================================================
  // IMAGE URL
  // =========================================================

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }

  // =========================================================
  // NEXT IMAGE
  // =========================================================

  nextImage(product: Product): void {
    const images = this.getImages(product);

    if (images.length <= 1) {
      return;
    }

    const currentIndex = this.currentImageIndex[product.productId] ?? 0;

    this.currentImageIndex[product.productId] = (currentIndex + 1) % images.length;
  }

  // =========================================================
  // PREVIOUS IMAGE
  // =========================================================

  previousImage(product: Product): void {
    const images = this.getImages(product);

    if (images.length <= 1) {
      return;
    }

    const currentIndex = this.currentImageIndex[product.productId] ?? 0;

    this.currentImageIndex[product.productId] =
      currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  }

  // =========================================================
  // SELECT IMAGE
  // =========================================================

  selectImage(product: Product, index: number): void {
    const images = this.getImages(product);

    if (index < 0 || index >= images.length) {
      return;
    }

    this.currentImageIndex[product.productId] = index;
  }

  // =========================================================
  // IMAGE LOADING
  // =========================================================

  isImageLoading(product: Product): boolean {
    return !!this.isLoadingImages[product.productId];
  }

  // =========================================================
  // ADD TO CART
  // =========================================================

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

  // =========================================================
  // GO TO CART
  // =========================================================

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
