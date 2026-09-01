import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Cart, AddCartItemRequest, UpdateCartItemRequest } from '../models/cart.model';

// =========================================================
// CART ACTION RESPONSE
// =========================================================

export interface CartActionResponse {
  message: string;
}

// =========================================================
// CART SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Cart`;

  // =======================================================
  // GET CART
  // GET /api/Cart
  // =======================================================

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  // =======================================================
  // ADD ITEM TO CART
  // POST /api/Cart/items
  // =======================================================

  addItem(request: AddCartItemRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, request);
  }

  // =======================================================
  // UPDATE CART ITEM
  // PUT /api/Cart/items/{cartItemId}
  //
  // Backend quantity update ke baad
  // tier-wise UnitPrice recalculate karta hai.
  // =======================================================

  updateItem(cartItemId: number, request: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${cartItemId}`, request);
  }

  // =======================================================
  // REMOVE CART ITEM
  // DELETE /api/Cart/items/{cartItemId}
  //
  // Backend:
  // { message: "Item removed from cart." }
  // =======================================================

  removeItem(cartItemId: number): Observable<CartActionResponse> {
    return this.http.delete<CartActionResponse>(`${this.apiUrl}/items/${cartItemId}`);
  }

  // =======================================================
  // CLEAR CART
  // DELETE /api/Cart/clear
  //
  // Backend:
  // { message: "Cart cleared successfully." }
  // =======================================================

  clearCart(): Observable<CartActionResponse> {
    return this.http.delete<CartActionResponse>(`${this.apiUrl}/clear`);
  }
}
