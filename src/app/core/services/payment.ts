import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Payment, CreatePaymentRequest, PaymentVerifyRequest } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Payment`;

  // =========================================================
  // CREATE PAYMENT
  // =========================================================
  //
  // COD ke liye:
  //
  // POST /api/Payment
  //
  // Body:
  // {
  //   orderId: 1,
  //   paymentMethod: "COD"
  // }
  //
  // =========================================================

  createPayment(request: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, request);
  }

  // =========================================================
  // CREATE RAZORPAY ORDER
  // =========================================================
  //
  // POST:
  // /api/Payment/razorpay/create?orderId=1
  //
  // =========================================================

  createRazorpayOrder(orderId: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/razorpay/create`, null, {
      params: {
        orderId,
      },
    });
  }

  // =========================================================
  // VERIFY RAZORPAY PAYMENT
  // =========================================================
  //
  // POST:
  // /api/Payment/razorpay/verify
  //
  // =========================================================

  verifyRazorpayPayment(request: PaymentVerifyRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/razorpay/verify`, request);
  }

  // =========================================================
  // GET PAYMENT BY ORDER
  // =========================================================
  //
  // GET:
  // /api/Payment/order/{orderId}
  //
  // =========================================================

  getPaymentByOrder(orderId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/order/${orderId}`);
  }
}
