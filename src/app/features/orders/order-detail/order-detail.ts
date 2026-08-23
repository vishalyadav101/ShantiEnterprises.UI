import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { OrderService } from '../../../core/services/order';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetailComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  order: Order | null = null;

  isLoading = false;

  errorMessage = '';

  orderId: number | null = null;

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

  /**
   * Load order details
   */
  loadOrder(id: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.orderService
      .getMyOrderById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: Order) => {
          console.log('Order Detail Response:', response);

          this.order = response;
        },

        error: (error: any) => {
          console.error('Order Detail API Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load order details.';
        },
      });
  }

  /**
   * Go back to orders
   */
  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  /**
   * Continue shopping
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Track order items
   */
  trackByOrderItem(index: number, item: Order['items'][number]): number {
    return item.orderItemId;
  }

  /**
   * Get order status class
   */
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

  /**
   * Get payment status class
   */
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
}
