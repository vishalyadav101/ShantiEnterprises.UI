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
import { BulkEnquiryService } from '../../../core/services/bulk-enquiry';

import {
  Review,
  ReviewSummary,
  CreateReview,
  UpdateReview,
} from '../../../core/models/review.model';

import { CreateBulkEnquiry } from '../../../core/models/bulk-enquiry.model';

import { Product, ProductPriceTier } from '../../../core/models/product.model';

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
  private readonly bulkEnquiryService = inject(BulkEnquiryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // =========================================================
  // TEMPLATE SUPPORT
  // =========================================================

  readonly Math = Math;

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
  // QUANTITY
  // =========================================================

  quantity = 1;

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

  reviewRating = 5;
  reviewTitle = '';
  reviewComment = '';

  // =========================================================
  // BULK ENQUIRY
  // =========================================================

  isBulkEnquiryOpen = false;
  isSubmittingBulkEnquiry = false;

  bulkEnquirySuccessMessage = '';
  bulkEnquiryErrorMessage = '';

  bulkCustomerName = '';
  bulkMobile = '';
  bulkEmail = '';
  bulkQuantity = 1;
  bulkMessage = '';

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
      .getDetails(this.productId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (product) => {
          console.log('Customer Product Detail:', product);
          this.product = product;

          // Make sure selected quantity is always valid.
          if (product.stock <= 0) {
            this.quantity = 1;
          } else if (this.quantity > product.stock) {
            this.quantity = product.stock;
          }
        },

        error: (error: unknown) => {
          console.error('Product Detail Error:', error);
          this.errorMessage = this.getErrorMessage(error, 'Unable to load product details.');
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

        error: (error: unknown) => {
          console.error('Product Images Error:', error);

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
  // QUANTITY - INCREASE
  // =========================================================

  increaseQuantity(): void {
    if (!this.product || this.product.stock <= 0) {
      return;
    }

    if (this.quantity >= this.product.stock) {
      return;
    }

    this.quantity += 1;
  }

  // =========================================================
  // QUANTITY - DECREASE
  // =========================================================

  decreaseQuantity(): void {
    if (this.quantity <= 1) {
      return;
    }

    this.quantity -= 1;
  }

  // =========================================================
  // CHECK WISHLIST
  // =========================================================

  private checkWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.isInWishlist = wishlist.items.some((item) => item.productId === this.productId);
      },

      error: (error: unknown) => {
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

        error: (error: unknown) => {
          console.error('Wishlist Error:', error);
          this.errorMessage = this.getErrorMessage(error, 'Unable to update wishlist.');
        },
      });
  }

  // =========================================================
  // CURRENT PRICE TIER
  // =========================================================

  getCurrentPriceTier(): ProductPriceTier | null {
    if (!this.product?.priceTiers?.length) {
      return null;
    }

    const currentQuantity = this.quantity;

    return (
      this.product.priceTiers
        .filter(
          (tier) =>
            currentQuantity >= tier.minQuantity &&
            (tier.maxQuantity == null || currentQuantity <= tier.maxQuantity),
        )
        .sort((a, b) => b.minQuantity - a.minQuantity)[0] ?? null
    );
  }

  // =========================================================
  // NEXT PRICE TIER
  // =========================================================

  getNextPriceTier(): ProductPriceTier | null {
    if (!this.product?.priceTiers?.length) {
      return null;
    }

    return (
      this.product.priceTiers
        .filter((tier) => tier.minQuantity > this.quantity)
        .sort((a, b) => a.minQuantity - b.minQuantity)[0] ?? null
    );
  }

  // =========================================================
  // CURRENT UNIT PRICE
  // =========================================================

  getCurrentUnitPrice(): number {
    if (!this.product) {
      return 0;
    }

    const tier = this.getCurrentPriceTier();

    return tier?.price ?? this.product.retailPrice;
  }

  // =========================================================
  // RETAIL PRICE
  // =========================================================

  getRetailPrice(): number {
    return this.product?.retailPrice ?? 0;
  }

  // =========================================================
  // SAVING PER UNIT
  // =========================================================

  getSavingPerUnit(): number {
    return Math.max(0, this.getRetailPrice() - this.getCurrentUnitPrice());
  }

  // =========================================================
  // QUANTITY TO NEXT TIER
  // =========================================================

  getQuantityToNextTier(): number {
    const nextTier = this.getNextPriceTier();

    if (!nextTier) {
      return 0;
    }

    return Math.max(0, nextTier.minQuantity - this.quantity);
  }

  // =========================================================
  // NEXT TIER LABEL
  // =========================================================

  getNextTierLabel(tier: ProductPriceTier): string {
    if (tier.maxQuantity == null) {
      return `${tier.minQuantity}+`;
    }

    return `${tier.minQuantity}-${tier.maxQuantity}`;
  }

  // =========================================================
  // TIER RANGE LABEL
  // =========================================================

  getTierRangeLabel(tier: ProductPriceTier): string {
    return this.getNextTierLabel(tier);
  }

  // =========================================================
  // TIER SAVING
  // =========================================================

  getTierSaving(tier: ProductPriceTier): number {
    return Math.max(0, this.getRetailPrice() - tier.price);
  }

  // =========================================================
  // BEST PRICE
  // =========================================================

  isBestPrice(): boolean {
    if (!this.product?.priceTiers?.length) {
      return false;
    }

    const bestTier = Math.min(...this.product.priceTiers.map((tier) => tier.price));

    return (
      this.getCurrentUnitPrice() === bestTier &&
      this.quantity >= Math.min(...this.product.priceTiers.map((tier) => tier.minQuantity))
    );
  }

  // =========================================================
  // ADD TO CART
  // =========================================================

  addToCart(): void {
    if (!this.product || this.product.stock <= 0) {
      return;
    }

    if (this.isAddingToCart) {
      return;
    }

    const safeQuantity = Math.min(Math.max(1, this.quantity), this.product.stock);

    this.isAddingToCart = true;
    this.errorMessage = '';

    this.cartService
      .addItem({
        productId: this.product.productId,
        quantity: safeQuantity,
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

        error: (error: unknown) => {
          console.error('Add To Cart Error:', error);
          this.errorMessage = this.getErrorMessage(error, 'Unable to add product to cart.');
        },
      });
  }

  // =========================================================
  // BUY NOW
  // =========================================================

  buyNow(): void {
    if (!this.product || this.product.stock <= 0 || this.isAddingToCart) {
      return;
    }

    const safeQuantity = Math.min(Math.max(1, this.quantity), this.product.stock);

    this.isAddingToCart = true;
    this.errorMessage = '';

    this.cartService
      .addItem({
        productId: this.product.productId,
        quantity: safeQuantity,
      })
      .pipe(
        finalize(() => {
          this.isAddingToCart = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/cart']);
        },

        error: (error: unknown) => {
          console.error('Buy Now Error:', error);
          this.errorMessage = this.getErrorMessage(error, 'Unable to continue to checkout.');
        },
      });
  }

  // =========================================================
  // OPEN BULK ENQUIRY
  // =========================================================

  openBulkEnquiry(): void {
    this.isBulkEnquiryOpen = true;
    this.bulkEnquirySuccessMessage = '';
    this.bulkEnquiryErrorMessage = '';

    setTimeout(() => {
      document.getElementById('bulk-enquiry-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  }

  // =========================================================
  // CLOSE BULK ENQUIRY
  // =========================================================

  closeBulkEnquiry(): void {
    if (this.isSubmittingBulkEnquiry) {
      return;
    }

    this.isBulkEnquiryOpen = false;
    this.bulkEnquiryErrorMessage = '';
    this.bulkEnquirySuccessMessage = '';
  }

  // =========================================================
  // SUBMIT BULK ENQUIRY
  // =========================================================

  submitBulkEnquiry(): void {
    if (this.isSubmittingBulkEnquiry) {
      return;
    }

    this.bulkEnquiryErrorMessage = '';
    this.bulkEnquirySuccessMessage = '';

    if (!this.bulkCustomerName.trim()) {
      this.bulkEnquiryErrorMessage = 'Customer name is required.';
      return;
    }

    if (!this.bulkMobile.trim()) {
      this.bulkEnquiryErrorMessage = 'Mobile number is required.';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.bulkMobile.trim())) {
      this.bulkEnquiryErrorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    if (!this.bulkEmail.trim()) {
      this.bulkEnquiryErrorMessage = 'Email is required.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.bulkEmail.trim())) {
      this.bulkEnquiryErrorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!this.bulkQuantity || this.bulkQuantity <= 0) {
      this.bulkEnquiryErrorMessage = 'Quantity must be greater than 0.';
      return;
    }

    if (!this.bulkMessage.trim()) {
      this.bulkEnquiryErrorMessage = 'Message is required.';
      return;
    }

    if (!this.product) {
      this.bulkEnquiryErrorMessage = 'Product information is unavailable.';
      return;
    }

    const currentUser = this.authService.getCurrentUser();

    const data: CreateBulkEnquiry = {
      userId: currentUser ? Number(currentUser.id) : null,
      customerName: this.bulkCustomerName.trim(),
      mobile: this.bulkMobile.trim(),
      email: this.bulkEmail.trim(),
      productId: this.product.productId,
      quantity: Number(this.bulkQuantity),
      message: this.bulkMessage.trim(),
    };

    this.isSubmittingBulkEnquiry = true;

    this.bulkEnquiryService
      .create(data)
      .pipe(
        finalize(() => {
          this.isSubmittingBulkEnquiry = false;
        }),
      )
      .subscribe({
        next: () => {
          this.bulkEnquirySuccessMessage =
            'Your bulk enquiry has been submitted successfully. We will contact you shortly.';

          this.resetBulkEnquiryForm();

          setTimeout(() => {
            this.bulkEnquirySuccessMessage = '';
          }, 5000);
        },

        error: (error: unknown) => {
          console.error('Bulk Enquiry Error:', error);

          this.bulkEnquiryErrorMessage = this.getErrorMessage(
            error,
            'Unable to submit bulk enquiry. Please try again.',
          );
        },
      });
  }

  // =========================================================
  // RESET BULK ENQUIRY
  // =========================================================

  resetBulkEnquiryForm(): void {
    this.bulkCustomerName = '';
    this.bulkMobile = '';
    this.bulkEmail = '';
    this.bulkQuantity = 1;
    this.bulkMessage = '';
  }

  // =========================================================
  // LOAD REVIEWS
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
          this.reviews = reviews;
        },

        error: (error: unknown) => {
          console.error('Reviews Error:', error);
          this.reviews = [];
          this.reviewErrorMessage = this.getErrorMessage(error, 'Unable to load reviews.');
        },
      });
  }

  // =========================================================
  // LOAD REVIEW SUMMARY
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
          this.reviewSummary = summary;
        },

        error: (error: unknown) => {
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
  // RATING
  // =========================================================

  setReviewRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      return;
    }

    this.reviewRating = rating;
  }

  get ratingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  isRatingStarFilled(star: number): boolean {
    return star <= this.reviewRating;
  }

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
        next: () => {
          this.reviewSuccessMessage = 'Review submitted successfully.';
          this.resetReviewForm();
          this.loadReviews();
          this.loadReviewSummary();

          setTimeout(() => {
            this.reviewSuccessMessage = '';
          }, 3000);
        },

        error: (error: unknown) => {
          console.error('Create Review Error:', error);
          this.reviewErrorMessage = this.getErrorMessage(error, 'Unable to submit review.');
        },
      });
  }

  // =========================================================
  // EDIT REVIEW
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
        next: () => {
          this.reviewSuccessMessage = 'Review updated successfully.';
          this.resetReviewForm();
          this.loadReviews();
          this.loadReviewSummary();

          setTimeout(() => {
            this.reviewSuccessMessage = '';
          }, 3000);
        },

        error: (error: unknown) => {
          console.error('Update Review Error:', error);
          this.reviewErrorMessage = this.getErrorMessage(error, 'Unable to update review.');
        },
      });
  }

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  deleteReview(review: Review): void {
    if (!this.isMyReview(review)) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete your review?');

    if (!confirmed) {
      return;
    }

    this.reviewErrorMessage = '';
    this.reviewSuccessMessage = '';

    this.reviewService.delete(review.reviewId).subscribe({
      next: () => {
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

      error: (error: unknown) => {
        console.error('Delete Review Error:', error);
        this.reviewErrorMessage = this.getErrorMessage(error, 'Unable to delete review.');
      },
    });
  }

  // =========================================================
  // CANCEL REVIEW EDIT
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
  // NAVIGATION
  // =========================================================

  backToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
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
