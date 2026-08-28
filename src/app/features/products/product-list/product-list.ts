import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductService } from '../../../core/services/product';
import { CartService } from '../../../core/services/cart';
import { ProductImageService, ProductImage } from '../../../core/services/product-image';
import { WishlistService } from '../../../core/services/wishlist';
import { ReviewService } from '../../../core/services/review';

import { Product } from '../../../core/models/product.model';
import { ReviewSummary } from '../../../core/models/review.model';

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

  private readonly wishlistService = inject(WishlistService);

  private readonly reviewService = inject(ReviewService);

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
   */
  productImages: Record<number, ProductImage[]> = {};

  /**
   * Current image index for every product.
   */
  currentImageIndex: Record<number, number> = {};

  // =========================================================
  // REVIEWS
  // =========================================================

  /**
   * Stores review summary for every product.
   *
   * Example:
   *
   * {
   *   1: {
   *     productId: 1,
   *     averageRating: 4.5,
   *     reviewCount: 2
   *   }
   * }
   */
  reviewSummaries: Record<number, ReviewSummary> = {};

  /**
   * Review summary loading state for every product.
   */
  isLoadingReviews: Record<number, boolean> = {};

  // =========================================================
  // WISHLIST
  // =========================================================

  /**
   * Stores product IDs which are currently
   * available in user's wishlist.
   */
  wishlistProductIds = new Set<number>();

  /**
   * Wishlist API loading state.
   */
  isWishlistLoading = false;

  /**
   * Product currently being added/removed
   * from wishlist.
   */
  wishlistProductId: number | null = null;

  /**
   * Wishlist success message.
   */
  wishlistMessage = '';

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

    this.loadWishlist();
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

          // ---------------------------------------------------
          // RESET IMAGE STATE
          // ---------------------------------------------------

          this.productImages = {};

          this.currentImageIndex = {};

          this.isLoadingImages = {};

          // ---------------------------------------------------
          // RESET REVIEW STATE
          // ---------------------------------------------------

          this.reviewSummaries = {};

          this.isLoadingReviews = {};

          // ---------------------------------------------------
          // LOAD IMAGES + REVIEWS
          // ---------------------------------------------------

          this.products.forEach((product) => {
            this.loadProductImages(product);

            this.loadReviewSummary(product);
          });
        },

        error: (error) => {
          console.error('Product API Error:', error);

          this.products = [];

          this.errorMessage = error?.error?.message || 'Unable to load products.';
        },
      });
  }

  // =========================================================
  // LOAD WISHLIST
  // =========================================================

  loadWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        console.log('Wishlist Response:', response);

        this.wishlistProductIds = new Set(response.items.map((item) => item.productId));
      },

      error: (error) => {
        console.error('Wishlist Load Error:', error);

        // Wishlist error ko products page
        // ka main error nahi banayenge.
      },
    });
  }

  // =========================================================
  // CHECK WISHLIST
  // =========================================================

  isInWishlist(productId: number): boolean {
    return this.wishlistProductIds.has(productId);
  }

  // =========================================================
  // TOGGLE WISHLIST
  // =========================================================

  toggleWishlist(product: Product): void {
    // -------------------------------------------------------
    // PREVENT MULTIPLE REQUESTS
    // -------------------------------------------------------

    if (this.isWishlistLoading) {
      return;
    }

    this.isWishlistLoading = true;

    this.wishlistProductId = product.productId;

    this.wishlistMessage = '';

    this.errorMessage = '';

    const isAlreadyInWishlist = this.isInWishlist(product.productId);

    // -------------------------------------------------------
    // REMOVE
    // -------------------------------------------------------

    if (isAlreadyInWishlist) {
      this.wishlistService
        .removeFromWishlist(product.productId)
        .pipe(
          finalize(() => {
            this.isWishlistLoading = false;

            this.wishlistProductId = null;
          }),
        )
        .subscribe({
          next: (response) => {
            console.log('Wishlist Item Removed:', response);

            this.wishlistProductIds.delete(product.productId);

            this.wishlistProductIds = new Set(this.wishlistProductIds);

            this.wishlistMessage = `${product.productName} removed from wishlist.`;

            this.clearWishlistMessage();
          },

          error: (error) => {
            console.error('Remove Wishlist Error:', error);

            this.errorMessage = error?.error?.message || 'Unable to remove product from wishlist.';
          },
        });

      return;
    }

    // -------------------------------------------------------
    // ADD
    // -------------------------------------------------------

    this.wishlistService
      .addToWishlist(product.productId)
      .pipe(
        finalize(() => {
          this.isWishlistLoading = false;

          this.wishlistProductId = null;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Wishlist Item Added:', response);

          this.wishlistProductIds.add(product.productId);

          this.wishlistProductIds = new Set(this.wishlistProductIds);

          this.wishlistMessage = `${product.productName} added to wishlist.`;

          this.clearWishlistMessage();
        },

        error: (error) => {
          console.error('Add Wishlist Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to add product to wishlist.';
        },
      });
  }

  // =========================================================
  // CLEAR WISHLIST MESSAGE
  // =========================================================

  private clearWishlistMessage(): void {
    setTimeout(() => {
      this.wishlistMessage = '';
    }, 3000);
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

          // -------------------------------------------------
          // PRIMARY IMAGE FIRST
          // -------------------------------------------------

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

          // -------------------------------------------------
          // START FROM PRIMARY IMAGE
          // -------------------------------------------------

          this.currentImageIndex[product.productId] = 0;
        },

        error: (error) => {
          console.error(`Product Image Error (${product.productId}):`, error);

          // -------------------------------------------------
          // FALLBACK TO PRODUCT IMAGE URL
          // -------------------------------------------------

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
  // LOAD REVIEW SUMMARY
  // =========================================================

  private loadReviewSummary(product: Product): void {
    this.isLoadingReviews[product.productId] = true;

    this.reviewService
      .getSummary(product.productId)
      .pipe(
        finalize(() => {
          this.isLoadingReviews[product.productId] = false;
        }),
      )
      .subscribe({
        next: (summary) => {
          console.log(`Review Summary for Product ${product.productId}:`, summary);

          this.reviewSummaries[product.productId] = summary;
        },

        error: (error) => {
          console.error(`Review Summary Error (${product.productId}):`, error);

          // Review API fail hone par
          // product listing ko break nahi karenge.

          this.reviewSummaries[product.productId] = {
            productId: product.productId,

            averageRating: 0,

            reviewCount: 0,
          };
        },
      });
  }

  // =========================================================
  // GET REVIEW SUMMARY
  // =========================================================

  getReviewSummary(productId: number): ReviewSummary | null {
    return this.reviewSummaries[productId] ?? null;
  }

  // =========================================================
  // GET AVERAGE RATING
  // =========================================================

  getAverageRating(productId: number): number {
    return this.reviewSummaries[productId]?.averageRating ?? 0;
  }

  // =========================================================
  // GET REVIEW COUNT
  // =========================================================

  getReviewCount(productId: number): number {
    return this.reviewSummaries[productId]?.reviewCount ?? 0;
  }

  // =========================================================
  // GET ROUNDED RATING
  // =========================================================

  getRoundedRating(productId: number): number {
    return Math.round(this.getAverageRating(productId));
  }

  // =========================================================
  // GET IMAGES
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
  // REVIEW LOADING
  // =========================================================

  isReviewLoading(product: Product): boolean {
    return !!this.isLoadingReviews[product.productId];
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
  // VIEW PRODUCT
  // =========================================================

  viewProduct(productId: number): void {
    if (!productId || productId <= 0) {
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
}
