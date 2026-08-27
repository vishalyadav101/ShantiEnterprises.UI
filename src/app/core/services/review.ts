import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Review, ReviewSummary, CreateReview, UpdateReview } from '../models/review.model';

// =========================================================
// REVIEW SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Review`;

  // =======================================================
  // GET ALL REVIEWS
  // ADMIN
  // GET /api/Review
  // =======================================================

  getAll(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  // =======================================================
  // GET REVIEWS BY PRODUCT
  // GET /api/Review/product/{productId}
  // =======================================================

  getByProductId(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  // =======================================================
  // GET REVIEW SUMMARY
  // GET /api/Review/product/{productId}/summary
  // =======================================================

  getSummary(productId: number): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.apiUrl}/product/${productId}/summary`);
  }

  // =======================================================
  // GET REVIEW BY ID
  // GET /api/Review/{id}
  // =======================================================

  getById(reviewId: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${reviewId}`);
  }

  // =======================================================
  // CREATE REVIEW
  // POST /api/Review
  // AUTHENTICATED USER
  // =======================================================

  create(data: CreateReview): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, data);
  }

  // =======================================================
  // UPDATE REVIEW
  // PUT /api/Review/{id}
  // AUTHENTICATED USER
  // =======================================================

  update(reviewId: number, data: UpdateReview): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, data);
  }

  // =======================================================
  // DELETE REVIEW
  // DELETE /api/Review/{id}
  // AUTHENTICATED USER
  // =======================================================

  delete(reviewId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${reviewId}`);
  }
}
