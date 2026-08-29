import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { OrderService } from '../../../core/services/order';
import { Order } from '../../../core/models/order.model';

import { ShipmentService } from '../../../core/services/shipment';
import { Shipment } from '../../../core/models/shipment.model';

import { ReturnService } from '../../../core/services/return';
import { ReturnRequest, CreateReturn } from '../../../core/models/return.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetailComponent implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly orderService = inject(OrderService);

  private readonly shipmentService = inject(ShipmentService);

  private readonly returnService = inject(ReturnService);

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
  // RETURNS
  // =========================================================

  returns: ReturnRequest[] = [];

  isReturnsLoading = false;

  returnLoadError = '';

  // =========================================================
  // RETURN FORM / MODAL
  // =========================================================

  isReturnModalOpen = false;

  isSubmittingReturn = false;

  returnSuccessMessage = '';

  returnErrorMessage = '';

  selectedReturnItem: Order['items'][number] | null = null;

  returnReason = '';

  returnDescription = '';

  // =========================================================
  // RETURN REASONS
  // =========================================================

  returnReasons = [
    'Product is defective',
    'Product is damaged',
    'Wrong product received',
    'Product does not match description',
    'Product size or fit issue',
    'Changed my mind',
    'Other',
  ];

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

          // -----------------------------------------------
          // Load shipment
          // -----------------------------------------------

          this.loadShipment(id);

          // -----------------------------------------------
          // Load existing returns
          // -----------------------------------------------

          this.loadReturns();
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
  // LOAD CUSTOMER RETURNS
  // =========================================================

  loadReturns(): void {
    this.isReturnsLoading = true;

    this.returnLoadError = '';

    this.returnService
      .getMyReturns()
      .pipe(
        finalize(() => {
          this.isReturnsLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.returns = response ?? [];
        },

        error: (error: any) => {
          console.error('Returns API Error:', error);

          this.returns = [];

          this.returnLoadError = error?.error?.message || 'Unable to load return details.';
        },
      });
  }

  // =========================================================
  // CHECK ORDER IS DELIVERED
  // =========================================================

  isOrderDelivered(): boolean {
    return this.order?.orderStatus?.toLowerCase() === 'delivered';
  }

  // =========================================================
  // CHECK ITEM RETURN
  // =========================================================

  getReturnForItem(orderItemId: number): ReturnRequest | null {
    return this.returns.find((item) => item.orderItemId === orderItemId) ?? null;
  }

  // =========================================================
  // CHECK RETURN EXISTS
  // =========================================================

  hasReturnForItem(orderItemId: number): boolean {
    return !!this.getReturnForItem(orderItemId);
  }

  // =========================================================
  // OPEN RETURN MODAL
  // =========================================================

  openReturnModal(item: Order['items'][number]): void {
    // -----------------------------------------------
    // Order must be delivered
    // -----------------------------------------------

    if (!this.isOrderDelivered()) {
      this.returnErrorMessage = 'Return can only be requested after the order is delivered.';

      return;
    }

    // -----------------------------------------------
    // Duplicate return check
    // -----------------------------------------------

    if (this.hasReturnForItem(item.orderItemId)) {
      this.returnErrorMessage = 'A return request already exists for this product.';

      return;
    }

    this.selectedReturnItem = item;

    this.returnReason = '';

    this.returnDescription = '';

    this.returnSuccessMessage = '';

    this.returnErrorMessage = '';

    this.isReturnModalOpen = true;
  }

  // =========================================================
  // CLOSE RETURN MODAL
  // =========================================================

  closeReturnModal(): void {
    if (this.isSubmittingReturn) {
      return;
    }

    this.isReturnModalOpen = false;

    this.selectedReturnItem = null;

    this.returnReason = '';

    this.returnDescription = '';

    this.returnSuccessMessage = '';

    this.returnErrorMessage = '';
  }

  // =========================================================
  // SUBMIT RETURN
  // =========================================================

  submitReturn(): void {
    this.returnSuccessMessage = '';

    this.returnErrorMessage = '';

    if (this.isSubmittingReturn) {
      return;
    }

    if (!this.orderId || !this.order) {
      this.returnErrorMessage = 'Order details are not available.';

      return;
    }

    if (!this.selectedReturnItem) {
      this.returnErrorMessage = 'Please select a product to return.';

      return;
    }

    if (!this.isOrderDelivered()) {
      this.returnErrorMessage = 'Return can only be requested after the order is delivered.';

      return;
    }

    if (this.hasReturnForItem(this.selectedReturnItem.orderItemId)) {
      this.returnErrorMessage = 'A return request already exists for this product.';

      return;
    }

    if (!this.returnReason.trim()) {
      this.returnErrorMessage = 'Please select a return reason.';

      return;
    }

    const createData: CreateReturn = {
      orderId: this.orderId,

      orderItemId: this.selectedReturnItem.orderItemId,

      reason: this.returnReason.trim(),

      description: this.returnDescription.trim() ? this.returnDescription.trim() : null,
    };

    this.isSubmittingReturn = true;

    this.returnService
      .create(createData)
      .pipe(
        finalize(() => {
          this.isSubmittingReturn = false;
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Return Created:', response);

          this.returnSuccessMessage = 'Return request submitted successfully.';

          // ---------------------------------------------
          // Refresh returns
          // ---------------------------------------------

          this.loadReturns();

          // ---------------------------------------------
          // Close modal shortly after success
          // ---------------------------------------------

          setTimeout(() => {
            this.closeReturnModal();
          }, 900);
        },

        error: (error: any) => {
          console.error('Create Return API Error:', error);

          this.returnErrorMessage = error?.error?.message || 'Unable to submit return request.';
        },
      });
  }

  // =========================================================
  // VIEW RETURN
  // =========================================================

  viewReturn(returnRequest: ReturnRequest): void {
    this.router.navigate(['/returns', returnRequest.returnId]);
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
