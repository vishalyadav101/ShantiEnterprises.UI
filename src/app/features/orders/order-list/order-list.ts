import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { OrderService } from '../../../core/services/order';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList implements OnInit {
  private readonly orderService = inject(OrderService);

  private readonly router = inject(Router);

  orders: Order[] = [];

  isLoading = false;

  errorMessage = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Load current user's orders
   */
  loadOrders(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.orderService
      .getMyOrders()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: Order[]) => {
          console.log('Orders API Response:', response);

          this.orders = response;
        },

        error: (error: any) => {
          console.error('Orders API Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load your orders.';
        },
      });
  }

  /**
   * Open order detail
   */
  viewOrder(order: Order): void {
    this.router.navigate(['/orders', order.orderId]);
  }

  /**
   * Order status badge
   */
  getOrderStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';

      case 'confirmed':
        return 'bg-info text-dark';

      case 'processing':
        return 'bg-primary';

      case 'shipped':
        return 'bg-primary';

      case 'delivered':
        return 'bg-success';

      case 'cancelled':
        return 'bg-danger';

      default:
        return 'bg-secondary';
    }
  }

  /**
   * Payment status badge
   */
  getPaymentStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-success';

      case 'pending':
        return 'bg-warning text-dark';

      case 'failed':
        return 'bg-danger';

      case 'refunded':
        return 'bg-info text-dark';

      default:
        return 'bg-secondary';
    }
  }

  /**
   * Track orders
   */
  trackByOrder(index: number, order: Order): number {
    return order.orderId;
  }
}
