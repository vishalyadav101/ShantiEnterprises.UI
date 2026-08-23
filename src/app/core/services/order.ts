import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Order, CreateOrderRequest } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Order`;

  /**
   * Get all orders of current logged-in user
   *
   * GET: api/Order
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  /**
   * Get current user's order by id
   *
   * GET: api/Order/{id}
   */
  getMyOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new order
   *
   * POST: api/Order
   */
  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }
}
