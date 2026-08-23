import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Cart, AddCartItemRequest, UpdateCartItemRequest } from '../models/cart.model';

export interface CartActionResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Cart`;

  /**
   * GET /api/Cart
   */
  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  /**
   * POST /api/Cart/items
   */
  addItem(request: AddCartItemRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, request);
  }

  /**
   * PUT /api/Cart/items/{cartItemId}
   */
  updateItem(cartItemId: number, request: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${cartItemId}`, request);
  }

  /**
   * DELETE /api/Cart/items/{cartItemId}
   *
   * Backend returns:
   * { message: "Item removed from cart." }
   */
  removeItem(cartItemId: number): Observable<CartActionResponse> {
    return this.http.delete<CartActionResponse>(`${this.apiUrl}/items/${cartItemId}`);
  }

  /**
   * DELETE /api/Cart/clear
   *
   * Backend returns:
   * { message: "Cart cleared successfully." }
   */
  clearCart(): Observable<CartActionResponse> {
    return this.http.delete<CartActionResponse>(`${this.apiUrl}/clear`);
  }
}
