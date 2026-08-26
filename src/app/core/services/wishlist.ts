import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

// =========================================================
// WISHLIST ITEM
// Backend: WishlistItemResponseDto
// =========================================================

export interface WishlistItem {
  wishlistItemId: number;
  productId: number;
  productName: string;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  isActive: boolean;
  addedDate: string;
}

// =========================================================
// WISHLIST RESPONSE
// Backend: WishlistResponseDto
// =========================================================

export interface WishlistResponse {
  wishlistId: number;
  userId: number;
  createdDate: string;
  totalItems: number;
  items: WishlistItem[];
}

// =========================================================
// ADD WISHLIST REQUEST
// Backend: AddWishlistItemDto
// =========================================================

export interface AddWishlistItem {
  productId: number;
}

// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Wishlist`;

  // =======================================================
  // GET WISHLIST
  //
  // GET /api/Wishlist
  //
  // Returns current logged-in user's wishlist.
  // =======================================================

  getWishlist(): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(this.apiUrl);
  }

  // =======================================================
  // ADD PRODUCT TO WISHLIST
  //
  // POST /api/Wishlist
  //
  // Request:
  // {
  //   "productId": 1
  // }
  // =======================================================

  addToWishlist(productId: number): Observable<WishlistResponse> {
    const data: AddWishlistItem = {
      productId,
    };

    return this.http.post<WishlistResponse>(this.apiUrl, data);
  }

  // =======================================================
  // REMOVE PRODUCT FROM WISHLIST
  //
  // DELETE /api/Wishlist/{productId}
  // =======================================================

  removeFromWishlist(productId: number): Observable<WishlistResponse> {
    return this.http.delete<WishlistResponse>(`${this.apiUrl}/${productId}`);
  }

  // =======================================================
  // CLEAR WISHLIST
  //
  // DELETE /api/Wishlist/clear
  // =======================================================

  clearWishlist(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/clear`);
  }
}
