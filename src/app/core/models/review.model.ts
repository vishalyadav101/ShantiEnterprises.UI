// =========================================================
// REVIEW MODEL
// Backend: ReviewResponseDto
// =========================================================

export interface Review {
  reviewId: number;

  productId: number;

  userId: number;

  userName: string;

  rating: number;

  reviewTitle?: string | null;

  reviewComment?: string | null;

  isApproved: boolean;

  isActive: boolean;

  createdDate: string;

  updatedDate?: string | null;
}

// =========================================================
// REVIEW SUMMARY
// Backend: ReviewSummaryDto
// =========================================================

export interface ReviewSummary {
  productId: number;

  averageRating: number;

  reviewCount: number;
}

// =========================================================
// CREATE REVIEW
// Backend: CreateReviewDto
// =========================================================

export interface CreateReview {
  productId: number;

  rating: number;

  reviewTitle?: string | null;

  reviewComment?: string | null;
}

// =========================================================
// UPDATE REVIEW
// Backend: UpdateReviewDto
// =========================================================

export interface UpdateReview {
  rating: number;

  reviewTitle?: string | null;

  reviewComment?: string | null;
}
