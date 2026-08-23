import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  AdminOrder,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
} from '../models/admin-order';

@Injectable({
  providedIn: 'root',
})
export class AdminOrderService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/AdminOrder`;

  // =========================================================
  // GET ALL ORDERS
  // GET /api/AdminOrder
  // =========================================================

  getAllOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(this.apiUrl);
  }

  // =========================================================
  // GET ORDER BY ID
  // GET /api/AdminOrder/{id}
  // =========================================================

  getOrderById(orderId: number): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`${this.apiUrl}/${orderId}`);
  }

  // =========================================================
  // UPDATE ORDER STATUS
  // PUT /api/AdminOrder/{id}/status
  // =========================================================

  updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.apiUrl}/${orderId}/status`, request);
  }

  // =========================================================
  // UPDATE PAYMENT STATUS
  // PUT /api/AdminOrder/{id}/payment-status
  // =========================================================

  updatePaymentStatus(
    orderId: number,
    request: UpdatePaymentStatusRequest,
  ): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.apiUrl}/${orderId}/payment-status`, request);
  }
}
