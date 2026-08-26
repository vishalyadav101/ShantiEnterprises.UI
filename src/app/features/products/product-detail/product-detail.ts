import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService } from '../../../core/services/product';
import { ProductImageService, ProductImage } from '../../../core/services/product-image';

import { WishlistService } from '../../../core/services/wishlist';
import { CartService } from '../../../core/services/cart';

import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly productService = inject(ProductService);

  private readonly productImageService = inject(ProductImageService);

  private readonly wishlistService = inject(WishlistService);

  private readonly cartService = inject(CartService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // =========================================================
  // PRODUCT
  // =========================================================

  product: Product | null = null;

  productId = 0;

  // =========================================================
  // IMAGES
  // =========================================================

  images: ProductImage[] = [];

  currentImageIndex = 0;

  // =========================================================
  // STATES
  // =========================================================

  isLoading = false;

  isLoadingImages = false;

  isAddingToWishlist = false;

  isAddingToCart = false;

  isInWishlist = false;

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid product ID.';
      return;
    }

    this.productId = id;

    this.loadProduct();

    this.loadProductImages();

    this.checkWishlist();
  }

  // =========================================================
  // LOAD PRODUCT
  // =========================================================

  private loadProduct(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.productService
      .getById(this.productId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (product) => {
          console.log('Customer Product Detail:', product);

          this.product = product;
        },

        error: (error) => {
          console.error('Product Detail Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load product details.';
        },
      });
  }

  // =========================================================
  // LOAD PRODUCT IMAGES
  // =========================================================

  private loadProductImages(): void {
    this.isLoadingImages = true;

    this.productImageService
      .getByProductId(this.productId)
      .pipe(
        finalize(() => {
          this.isLoadingImages = false;
        }),
      )
      .subscribe({
        next: (images) => {
          console.log('Product Images:', images);

          this.images = [...images].sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) {
              return -1;
            }

            if (!a.isPrimary && b.isPrimary) {
              return 1;
            }

            return a.productImageId - b.productImageId;
          });

          this.currentImageIndex = 0;

          // -----------------------------------------------
          // FALLBACK TO PRODUCT IMAGE
          // -----------------------------------------------

          if (this.images.length === 0 && this.product?.imageUrl) {
            this.images = [
              {
                productImageId: 0,
                productId: this.productId,
                imageUrl: this.product.imageUrl,
                isPrimary: true,
              },
            ];
          }
        },

        error: (error) => {
          console.error('Product Images Error:', error);

          // -----------------------------------------------
          // FALLBACK
          // -----------------------------------------------

          if (this.product?.imageUrl) {
            this.images = [
              {
                productImageId: 0,
                productId: this.productId,
                imageUrl: this.product.imageUrl,
                isPrimary: true,
              },
            ];
          }
        },
      });
  }

  // =========================================================
  // IMAGE URL
  // =========================================================

  getImageUrl(imageUrl: string | null): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://localhost:7266${imageUrl}`;
  }

  // =========================================================
  // CURRENT IMAGE
  // =========================================================

  getCurrentImage(): ProductImage | null {
    if (!this.images.length) {
      return null;
    }

    return this.images[this.currentImageIndex] || this.images[0];
  }

  // =========================================================
  // NEXT IMAGE
  // =========================================================

  nextImage(): void {
    if (this.images.length <= 1) {
      return;
    }

    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  // =========================================================
  // PREVIOUS IMAGE
  // =========================================================

  previousImage(): void {
    if (this.images.length <= 1) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex === 0 ? this.images.length - 1 : this.currentImageIndex - 1;
  }

  // =========================================================
  // SELECT IMAGE
  // =========================================================

  selectImage(index: number): void {
    if (index < 0 || index >= this.images.length) {
      return;
    }

    this.currentImageIndex = index;
  }

  // =========================================================
  // CHECK WISHLIST
  // =========================================================

  private checkWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.isInWishlist = wishlist.items.some((item) => item.productId === this.productId);
      },

      error: (error) => {
        console.error('Wishlist Check Error:', error);
      },
    });
  }

  // =========================================================
  // TOGGLE WISHLIST
  // =========================================================

  toggleWishlist(): void {
    if (this.isAddingToWishlist) {
      return;
    }

    this.isAddingToWishlist = true;

    this.errorMessage = '';

    const request$ = this.isInWishlist
      ? this.wishlistService.removeFromWishlist(this.productId)
      : this.wishlistService.addToWishlist(this.productId);

    request$
      .pipe(
        finalize(() => {
          this.isAddingToWishlist = false;
        }),
      )
      .subscribe({
        next: (wishlist) => {
          this.isInWishlist = wishlist.items.some((item) => item.productId === this.productId);

          this.successMessage = this.isInWishlist
            ? 'Product added to wishlist.'
            : 'Product removed from wishlist.';

          setTimeout(() => {
            this.successMessage = '';
          }, 2500);
        },

        error: (error) => {
          console.error('Wishlist Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to update wishlist.';
        },
      });
  }

  // =========================================================
  // ADD TO CART
  // =========================================================

  addToCart(): void {
    if (!this.product) {
      return;
    }

    if (this.product.stock <= 0) {
      return;
    }

    if (this.isAddingToCart) {
      return;
    }

    this.isAddingToCart = true;

    this.errorMessage = '';

    this.cartService
      .addItem({
        productId: this.product.productId,
        quantity: 1,
      })
      .pipe(
        finalize(() => {
          this.isAddingToCart = false;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = `${this.product?.productName} added to cart.`;

          setTimeout(() => {
            this.successMessage = '';
          }, 2500);
        },

        error: (error) => {
          console.error('Add To Cart Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to add product to cart.';
        },
      });
  }

  // =========================================================
  // BACK TO PRODUCTS
  // =========================================================

  backToProducts(): void {
    this.router.navigate(['/products']);
  }

  // =========================================================
  // GO TO CART
  // =========================================================

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  // =========================================================
  // GO TO WISHLIST
  // =========================================================

  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }
}
