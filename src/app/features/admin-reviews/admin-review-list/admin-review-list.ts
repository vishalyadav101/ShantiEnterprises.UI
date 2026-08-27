import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReviewService } from '../../../core/services/review';

import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-admin-review-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-review-list.html',
  styleUrl: './admin-review-list.scss',
})
export class AdminReviewList implements OnInit {
  private readonly reviewService = inject(ReviewService);

  // =========================================================
  // DATA
  // =========================================================

  reviews: Review[] = [];

  // =========================================================
  // STATE
  // =========================================================

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadReviews();
  }

  // =========================================================
  // LOAD ALL REVIEWS
  // =========================================================

  loadReviews(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.reviewService.getAll().subscribe({
      next: (response) => {
        this.reviews = response ?? [];

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Admin Reviews API Error:', error);

        this.reviews = [];

        this.errorMessage = error?.error?.message || 'Unable to load reviews.';

        this.isLoading = false;
      },
    });
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    this.loadReviews();
  }

  // =========================================================
  // STAR ARRAY
  // =========================================================

  getStars(): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  formatDate(date: string): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // =========================================================
  // STATUS
  // =========================================================

  getStatus(review: Review): string {
    if (!review.isActive) {
      return 'Inactive';
    }

    if (!review.isApproved) {
      return 'Pending';
    }

    return 'Approved';
  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(review: Review): string {
    if (!review.isActive) {
      return 'inactive';
    }

    if (!review.isApproved) {
      return 'pending';
    }

    return 'approved';
  }
}
