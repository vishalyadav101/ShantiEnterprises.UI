import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AdminOrderService } from '../../../core/services/admin-order';
import {
  AdminOrder,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
} from '../../../core/models/admin-order';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-order-list.html',
  styleUrl: './admin-order-list.scss',
})
export class AdminOrderListComponent implements OnInit {
  private readonly adminOrderService = inject(AdminOrderService);

  private readonly router = inject(Router);

  // =========================================================
  // ORDERS
  // =========================================================

  orders: AdminOrder[] = [];

  filteredOrders: AdminOrder[] = [];

  // =========================================================
  // SEARCH
  // =========================================================

  searchTerm = '';

  // =========================================================
  // FILTERS
  // =========================================================

  selectedOrderStatus = 'All';

  selectedPaymentStatus = 'All';

  // =========================================================
  // LOADING
  // =========================================================

  isLoading = false;

  updatingOrderId: number | null = null;

  updatingPaymentOrderId: number | null = null;

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
    this.loadOrders();
  }

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  loadOrders(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.adminOrderService
      .getAllOrders()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: AdminOrder[]) => {
          console.log('Admin Orders Response:', response);

          this.orders = response ?? [];

          this.applyFilters();
        },

        error: (error: unknown) => {
          console.error('Admin Orders API Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load orders.');
        },
      });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {
    this.applyFilters();
  }

  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredOrders = this.orders.filter((order: AdminOrder) => {
      // -----------------------------------------------
      // Search
      // -----------------------------------------------

      const matchesSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search) ||
        order.shippingMobile.toLowerCase().includes(search);

      // -----------------------------------------------
      // Order status
      // -----------------------------------------------

      const matchesOrderStatus =
        this.selectedOrderStatus === 'All' || order.orderStatus === this.selectedOrderStatus;

      // -----------------------------------------------
      // Payment status
      // -----------------------------------------------

      const matchesPaymentStatus =
        this.selectedPaymentStatus === 'All' || order.paymentStatus === this.selectedPaymentStatus;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    });
  }

  // =========================================================
  // RESET FILTERS
  // =========================================================

  resetFilters(): void {
    this.searchTerm = '';

    this.selectedOrderStatus = 'All';

    this.selectedPaymentStatus = 'All';

    this.applyFilters();
  }

  // =========================================================
  // VIEW ORDER
  // =========================================================

  viewOrder(orderId: number): void {
    this.router.navigate(['/admin/orders', orderId]);
  }

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  updateOrderStatus(order: AdminOrder, status: string): void {
    if (!status) {
      return;
    }

    if (status === order.orderStatus) {
      return;
    }

    this.updatingOrderId = order.orderId;

    this.errorMessage = '';

    this.successMessage = '';

    const request: UpdateOrderStatusRequest = {
      orderStatus: status,
    };

    this.adminOrderService
      .updateOrderStatus(order.orderId, request)
      .pipe(
        finalize(() => {
          this.updatingOrderId = null;
        }),
      )
      .subscribe({
        next: (updatedOrder: AdminOrder) => {
          console.log('Order Status Updated:', updatedOrder);

          this.updateOrderInList(updatedOrder);

          this.successMessage = 'Order status updated successfully.';

          this.clearSuccessMessage();
        },

        error: (error: unknown) => {
          console.error('Update Order Status Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update order status.');

          this.loadOrders();
        },
      });
  }

  // =========================================================
  // UPDATE PAYMENT STATUS
  // =========================================================

  updatePaymentStatus(order: AdminOrder, status: string): void {
    if (!status) {
      return;
    }

    if (status === order.paymentStatus) {
      return;
    }

    this.updatingPaymentOrderId = order.orderId;

    this.errorMessage = '';

    this.successMessage = '';

    const request: UpdatePaymentStatusRequest = {
      paymentStatus: status,
    };

    this.adminOrderService
      .updatePaymentStatus(order.orderId, request)
      .pipe(
        finalize(() => {
          this.updatingPaymentOrderId = null;
        }),
      )
      .subscribe({
        next: (updatedOrder: AdminOrder) => {
          console.log('Payment Status Updated:', updatedOrder);

          this.updateOrderInList(updatedOrder);

          this.successMessage = 'Payment status updated successfully.';

          this.clearSuccessMessage();
        },

        error: (error: unknown) => {
          console.error('Update Payment Status Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to update payment status.');

          this.loadOrders();
        },
      });
  }

  // =========================================================
  // UPDATE ORDER IN LOCAL LIST
  // =========================================================

  private updateOrderInList(updatedOrder: AdminOrder): void {
    const index = this.orders.findIndex((order) => order.orderId === updatedOrder.orderId);

    if (index === -1) {
      this.loadOrders();

      return;
    }

    this.orders[index] = updatedOrder;

    this.applyFilters();
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
      case 'pending':
        return 'payment-pending';

      case 'paid':
        return 'payment-paid';

      case 'failed':
        return 'payment-failed';

      case 'refunded':
        return 'payment-refunded';

      default:
        return 'payment-default';
    }
  }

  // =========================================================
  // TOTAL ORDERS
  // =========================================================

  get totalOrders(): number {
    return this.orders.length;
  }

  // =========================================================
  // PENDING ORDERS
  // =========================================================

  get pendingOrders(): number {
    return this.orders.filter((order) => order.orderStatus === 'Pending').length;
  }

  // =========================================================
  // PROCESSING ORDERS
  // =========================================================

  get processingOrders(): number {
    return this.orders.filter(
      (order) => order.orderStatus === 'Processing' || order.orderStatus === 'Confirmed',
    ).length;
  }

  // =========================================================
  // SHIPPED ORDERS
  // =========================================================

  get shippedOrders(): number {
    return this.orders.filter((order) => order.orderStatus === 'Shipped').length;
  }

  // =========================================================
  // DELIVERED ORDERS
  // =========================================================

  get deliveredOrders(): number {
    return this.orders.filter((order) => order.orderStatus === 'Delivered').length;
  }

  // =========================================================
  // TRACK BY
  // =========================================================

  trackByOrder(index: number, order: AdminOrder): number {
    return order.orderId;
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
