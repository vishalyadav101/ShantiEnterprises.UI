import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { OrderService } from '../../../core/services/order';
import { Order } from '../../../core/models/order.model';

import { ShipmentService } from '../../../core/services/shipment';
import { Shipment } from '../../../core/models/shipment.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetailComponent implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly orderService = inject(OrderService);

  private readonly shipmentService = inject(ShipmentService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // =========================================================
  // ORDER
  // =========================================================

  order: Order | null = null;

  orderId: number | null = null;

  isLoading = false;

  errorMessage = '';

  // =========================================================
  // SHIPMENT
  // =========================================================

  shipment: Shipment | null = null;

  isShipmentLoading = false;

  shipmentErrorMessage = '';

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
  // LOAD ORDER DETAILS
  // =========================================================

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

          // =================================================
          // LOAD SHIPMENT AFTER ORDER LOAD
          // =================================================

          this.loadShipment(id);
        },

        error: (error: any) => {
          console.error('Order Detail API Error:', error);

          this.errorMessage = error?.error?.message || 'Unable to load order details.';
        },
      });
  }

  // =========================================================
  // LOAD SHIPMENT
  // =========================================================

  loadShipment(orderId: number): void {
    this.isShipmentLoading = true;

    this.shipmentErrorMessage = '';

    this.shipmentService
      .getByOrderId(orderId)
      .pipe(
        finalize(() => {
          this.isShipmentLoading = false;
        }),
      )
      .subscribe({
        next: (response: Shipment) => {
          console.log('Shipment Response:', response);

          this.shipment = response;
        },

        error: (error: any) => {
          console.error('Shipment API Error:', error);

          this.shipment = null;

          this.shipmentErrorMessage =
            error?.error?.message || 'Shipment details are not available yet.';
        },
      });
  }

  // =========================================================
  // RETRY SHIPMENT
  // =========================================================

  retryShipment(): void {
    if (!this.orderId) {
      return;
    }

    this.loadShipment(this.orderId);
  }

  // =========================================================
  // GO BACK TO ORDERS
  // =========================================================

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  // =========================================================
  // CONTINUE SHOPPING
  // =========================================================

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  // =========================================================
  // TRACK SHIPMENT
  // =========================================================

  trackShipment(): void {
    if (!this.shipment?.trackingUrl) {
      return;
    }

    window.open(this.shipment.trackingUrl, '_blank', 'noopener,noreferrer');
  }

  // =========================================================
  // TRACK ORDER ITEMS
  // =========================================================

  trackByOrderItem(index: number, item: Order['items'][number]): number {
    return item.orderItemId;
  }

  // =========================================================
  // GET ORDER STATUS CLASS
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
  // GET PAYMENT STATUS CLASS
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
  // GET SHIPMENT STATUS CLASS
  // =========================================================

  getShipmentStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'shipment-pending';

      case 'processing':
        return 'shipment-processing';

      case 'readytoship':
        return 'shipment-ready';

      case 'shipped':
        return 'shipment-shipped';

      case 'intransit':
        return 'shipment-transit';

      case 'outfordelivery':
        return 'shipment-out';

      case 'delivered':
        return 'shipment-delivered';

      case 'cancelled':
        return 'shipment-cancelled';

      case 'failed':
        return 'shipment-failed';

      case 'returned':
        return 'shipment-returned';

      default:
        return 'shipment-default';
    }
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // =========================================================
  // FORMAT DATE TIME
  // =========================================================

  formatDateTime(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // =========================================================
  // CHECK TRACKING AVAILABILITY
  // =========================================================

  hasTracking(): boolean {
    return !!(this.shipment?.trackingUrl && this.shipment.trackingUrl.trim());
  }

  // =========================================================
  // CHECK SHIPMENT
  // =========================================================

  hasShipment(): boolean {
    return !!this.shipment;
  }
}
