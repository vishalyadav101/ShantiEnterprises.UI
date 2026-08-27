import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../core/services/product';
import { ProductImageService, ProductImage } from '../../../core/services/product-image';

import { WishlistService } from '../../../core/services/wishlist';
import { CartService } from '../../../core/services/cart';
import { AuthService } from '../../../core/services/auth';

import { ReviewService } from '../../../core/services/review';

import {
  Review,
  ReviewSummary,
  CreateReview,
  UpdateReview,
} from '../../../core/models/review.model';

import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  private readonly authService = inject(AuthService);

  private readonly reviewService = inject(ReviewService);

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
  // REVIEWS
  // =========================================================

  reviews: Review[] = [];

  reviewSummary: ReviewSummary | null = null;

  isLoadingReviews = false;

  isLoadingReviewSummary = false;

  isSubmittingReview = false;

  isEditingReview = false;

  editingReviewId: number | null = null;

  // =========================================================
  // REVIEW FORM
  // =========================================================

  reviewRating = 5;

  reviewTitle = '';

  reviewComment = '';

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

  reviewErrorMessage = '';

  reviewSuccessMessage = '';

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

    this.loadReviews();

    this.loadReviewSummary();
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

          // FALLBACK TO PRODUCT IMAGE

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

          // FALLBACK

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
  // LOAD REVIEWS
  // GET /api/Review/product/{productId}
  // =========================================================

  loadReviews(): void {
    this.isLoadingReviews = true;

    this.reviewErrorMessage = '';

    this.reviewService
      .getByProductId(this.productId)
      .pipe(
        finalize(() => {
          this.isLoadingReviews = false;
        }),
      )
      .subscribe({
        next: (reviews) => {
          console.log('Product Reviews:', reviews);

          this.reviews = reviews;
        },

        error: (error) => {
          console.error('Reviews Error:', error);

          this.reviews = [];

          this.reviewErrorMessage = error?.error?.message || 'Unable to load reviews.';
        },
      });
  }

  // =========================================================
  // LOAD REVIEW SUMMARY
  // GET /api/Review/product/{productId}/summary
  // =========================================================

  loadReviewSummary(): void {
    this.isLoadingReviewSummary = true;

    this.reviewService
      .getSummary(this.productId)
      .pipe(
        finalize(() => {
          this.isLoadingReviewSummary = false;
        }),
      )
      .subscribe({
        next: (summary) => {
          console.log('Review Summary:', summary);

          this.reviewSummary = summary;
        },

        error: (error) => {
          console.error('Review Summary Error:', error);

          this.reviewSummary = {
            productId: this.productId,
            averageRating: 0,
            reviewCount: 0,
          };
        },
      });
  }

  // =========================================================
  // SELECT RATING
  // =========================================================

  setReviewRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      return;
    }

    this.reviewRating = rating;
  }

  // =========================================================
  // STAR ARRAY
  // =========================================================

  get ratingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  // =========================================================
  // CHECK FORM STAR
  // =========================================================

  isRatingStarFilled(star: number): boolean {
    return star <= this.reviewRating;
  }

  // =========================================================
  // CHECK SUMMARY STAR
  // =========================================================

  isSummaryStarFilled(star: number): boolean {
    if (!this.reviewSummary) {
      return false;
    }

    return star <= Math.round(this.reviewSummary.averageRating);
  }

  // =========================================================
  // CURRENT USER REVIEW CHECK
  // =========================================================

  isMyReview(review: Review): boolean {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      return false;
    }

    return Number(currentUser.id) === Number(review.userId);
  }

  // =========================================================
  // CREATE REVIEW
  // POST /api/Review
  // =========================================================

  submitReview(): void {
    if (this.isSubmittingReview) {
      return;
    }

    this.reviewErrorMessage = '';

    this.reviewSuccessMessage = '';

    if (this.reviewRating < 1 || this.reviewRating > 5) {
      this.reviewErrorMessage = 'Please select a rating between 1 and 5.';

      return;
    }

    const data: CreateReview = {
      productId: this.productId,
      rating: this.reviewRating,
      reviewTitle: this.reviewTitle.trim() || null,
      reviewComment: this.reviewComment.trim() || null,
    };

    this.isSubmittingReview = true;

    this.reviewService
      .create(data)
      .pipe(
        finalize(() => {
          this.isSubmittingReview = false;
        }),
      )
      .subscribe({
        next: (review) => {
          console.log('Review Created:', review);

          this.reviewSuccessMessage = 'Review submitted successfully.';

          this.resetReviewForm();

          this.loadReviews();

          this.loadReviewSummary();

          setTimeout(() => {
            this.reviewSuccessMessage = '';
          }, 3000);
        },

        error: (error) => {
          console.error('Create Review Error:', error);

          this.reviewErrorMessage = error?.error?.message || 'Unable to submit review.';
        },
      });
  }

  // =========================================================
  // START EDIT REVIEW
  // =========================================================

  editReview(review: Review): void {
    if (!this.isMyReview(review)) {
      return;
    }

    this.isEditingReview = true;

    this.editingReviewId = review.reviewId;

    this.reviewRating = review.rating;

    this.reviewTitle = review.reviewTitle || '';

    this.reviewComment = review.reviewComment || '';

    this.reviewErrorMessage = '';

    this.reviewSuccessMessage = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // =========================================================
  // UPDATE REVIEW
  // PUT /api/Review/{id}
  // =========================================================

  updateReview(): void {
    if (!this.isEditingReview || !this.editingReviewId) {
      return;
    }

    if (this.isSubmittingReview) {
      return;
    }

    this.reviewErrorMessage = '';

    this.reviewSuccessMessage = '';

    if (this.reviewRating < 1 || this.reviewRating > 5) {
      this.reviewErrorMessage = 'Please select a rating between 1 and 5.';

      return;
    }

    const data: UpdateReview = {
      rating: this.reviewRating,
      reviewTitle: this.reviewTitle.trim() || null,
      reviewComment: this.reviewComment.trim() || null,
    };

    this.isSubmittingReview = true;

    this.reviewService
      .update(this.editingReviewId, data)
      .pipe(
        finalize(() => {
          this.isSubmittingReview = false;
        }),
      )
      .subscribe({
        next: (review) => {
          console.log('Review Updated:', review);

          this.reviewSuccessMessage = 'Review updated successfully.';

          this.resetReviewForm();

          this.loadReviews();

          this.loadReviewSummary();

          setTimeout(() => {
            this.reviewSuccessMessage = '';
          }, 3000);
        },

        error: (error) => {
          console.error('Update Review Error:', error);

          this.reviewErrorMessage = error?.error?.message || 'Unable to update review.';
        },
      });
  }

  // =========================================================
  // DELETE REVIEW
  // DELETE /api/Review/{id}
  // =========================================================

  deleteReview(review: Review): void {
    if (!this.isMyReview(review)) {
      return;
    }

    const confirmed = confirm('Are you sure you want to delete your review?');

    if (!confirmed) {
      return;
    }

    this.reviewErrorMessage = '';

    this.reviewSuccessMessage = '';

    this.reviewService.delete(review.reviewId).subscribe({
      next: () => {
        console.log('Review Deleted:', review.reviewId);

        this.reviewSuccessMessage = 'Review deleted successfully.';

        if (this.editingReviewId === review.reviewId) {
          this.resetReviewForm();
        }

        this.loadReviews();

        this.loadReviewSummary();

        setTimeout(() => {
          this.reviewSuccessMessage = '';
        }, 3000);
      },

      error: (error) => {
        console.error('Delete Review Error:', error);

        this.reviewErrorMessage = error?.error?.message || 'Unable to delete review.';
      },
    });
  }

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  cancelEditReview(): void {
    this.resetReviewForm();

    this.reviewErrorMessage = '';

    this.reviewSuccessMessage = '';
  }

  // =========================================================
  // RESET REVIEW FORM
  // =========================================================

  resetReviewForm(): void {
    this.reviewRating = 5;

    this.reviewTitle = '';

    this.reviewComment = '';

    this.isEditingReview = false;

    this.editingReviewId = null;
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
