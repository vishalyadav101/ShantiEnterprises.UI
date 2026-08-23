import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminOrderService } from '../../../core/services/admin-order';

import {
  AdminOrder,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
} from '../../../core/models/admin-order';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-order-detail.html',
  styleUrl: './admin-order-detail.scss',
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly adminOrderService = inject(AdminOrderService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // =========================================================
  // ORDER
  // =========================================================

  order: AdminOrder | null = null;

  orderId: number | null = null;

  // =========================================================
  // LOADING
  // =========================================================

  isLoading = false;

  isUpdatingOrderStatus = false;

  isUpdatingPaymentStatus = false;

  // =========================================================
  // MESSAGES
  // =========================================================

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  readonly orderStatuses = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  readonly paymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Invalid order ID.';

      return;
    }

    const parsedId = Number(id);

    if (Number.isNaN(parsedId) || parsedId <= 0) {
      this.errorMessage = 'Invalid order ID.';

      return;
    }

    this.orderId = parsedId;

    this.loadOrder(parsedId);
  }

  // =========================================================
  // LOAD ORDER
  // =========================================================

  loadOrder(orderId: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.adminOrderService
      .getOrderById(orderId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: AdminOrder) => {
          console.log('Admin Order Detail Response:', response);

          this.order = response;
        },

        error: (error: unknown) => {
          console.error('Admin Order Detail API Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load order details.');
        },
      });
  }

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  updateOrderStatus(status: string): void {
    if (!this.order) {
      return;
    }

    if (!status) {
      return;
    }

    if (status === this.order.orderStatus) {
      return;
    }

    this.isUpdatingOrderStatus = true;

    this.errorMessage = '';

    this.successMessage = '';

    const request: UpdateOrderStatusRequest = {
      orderStatus: status,
    };

    this.adminOrderService
      .updateOrderStatus(this.order.orderId, request)
      .pipe(
        finalize(() => {
          this.isUpdatingOrderStatus = false;
        }),
      )
      .subscribe({
        next: (response: AdminOrder) => {
          console.log('Order Status Updated:', response);

          this.order = response;

          this.successMessage = 'Order status updated successfully.';

          this.clearSuccessMessage();
        },

        error: (error: unknown) => {
          console.error('Update Order Status Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update order status.');
        },
      });
  }

  // =========================================================
  // UPDATE PAYMENT STATUS
  // =========================================================

  updatePaymentStatus(status: string): void {
    if (!this.order) {
      return;
    }

    if (!status) {
      return;
    }

    if (status === this.order.paymentStatus) {
      return;
    }

    this.isUpdatingPaymentStatus = true;

    this.errorMessage = '';

    this.successMessage = '';

    const request: UpdatePaymentStatusRequest = {
      paymentStatus: status,
    };

    this.adminOrderService
      .updatePaymentStatus(this.order.orderId, request)
      .pipe(
        finalize(() => {
          this.isUpdatingPaymentStatus = false;
        }),
      )
      .subscribe({
        next: (response: AdminOrder) => {
          console.log('Payment Status Updated:', response);

          this.order = response;

          this.successMessage = 'Payment status updated successfully.';

          this.clearSuccessMessage();
        },

        error: (error: unknown) => {
          console.error('Update Payment Status Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update payment status.');
        },
      });
  }

  // =========================================================
  // BACK TO ORDERS
  // =========================================================

  goToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  // =========================================================
  // REFRESH
  // =========================================================

  refreshOrder(): void {
    if (!this.orderId) {
      return;
    }

    this.loadOrder(this.orderId);
  }

  // =========================================================
  // ORDER STATUS CLASS
  // =========================================================

  getOrderStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';

      case 'confirmed':
        return 'status-confirmed';

      case 'processing':
        return 'status-processing';

      case 'shipped':
        return 'status-shipped';

      case 'delivered':
        return 'status-delivered';

      case 'cancelled':
        return 'status-cancelled';

      default:
        return 'status-default';
    }
  }

  // =========================================================
  // PAYMENT STATUS CLASS
  // =========================================================

  getPaymentStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'payment-paid';

      case 'pending':
        return 'payment-pending';

      case 'failed':
        return 'payment-failed';

      case 'refunded':
        return 'payment-refunded';

      default:
        return 'payment-default';
    }
  }

  // =========================================================
  // ITEM COUNT
  // =========================================================

  get totalItems(): number {
    if (!this.order) {
      return 0;
    }

    return this.order.items.reduce((total, item) => total + item.quantity, 0);
  }

  // =========================================================
  // TRACK ORDER ITEM
  // =========================================================

  trackByOrderItem(index: number, item: AdminOrder['items'][number]): number {
    return item.orderItemId;
  }

  // =========================================================
  // SUCCESS MESSAGE
  // =========================================================

  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        error?: {
          message?: string;
        };
      };

      return apiError.error?.message || fallback;
    }

    return fallback;
  }
}
