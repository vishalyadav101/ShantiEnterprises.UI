import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AddressService } from '../../../core/services/address';
import { CartService } from '../../../core/services/cart';
import { OrderService } from '../../../core/services/order';
import { PaymentService } from '../../../core/services/payment';

import { Address } from '../../../core/models/address.model';
import { Cart } from '../../../core/models/cart.model';
import { CreateOrderRequest, Order } from '../../../core/models/order.model';
import { Payment } from '../../../core/models/payment.model';
import { ProductImageService } from '../../../core/services/product-image';
declare const Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutComponent implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly addressService = inject(AddressService);

  private readonly cartService = inject(CartService);
  private readonly productImageService = inject(ProductImageService);

  private readonly orderService = inject(OrderService);

  private readonly paymentService = inject(PaymentService);

  private readonly router = inject(Router);

  // =========================================================
  // DATA
  // =========================================================

  cart: Cart | null = null;

  addresses: Address[] = [];

  selectedAddressId: number | null = null;

  order: Order | null = null;

  payment: Payment | null = null;

  // =========================================================
  // PAYMENT METHOD
  // =========================================================

  paymentMethod: 'Razorpay' | 'COD' = 'Razorpay';

  // =========================================================
  // LOADING
  // =========================================================

  isLoading = false;

  isLoadingAddresses = false;

  isProcessing = false;

  // =========================================================
  // MESSAGES
  // =========================================================

  errorMessage = '';

  successMessage = '';

  // =========================================================
  // RAZORPAY TEST KEY
  // =========================================================

  private readonly razorpayKeyId = 'rzp_test_TVpwzAjLDlVilx';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadCheckoutData();
  }

  // =========================================================
  // LOAD CHECKOUT DATA
  // =========================================================

  loadCheckoutData(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.cartService
      .getCart()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: Cart) => {
          console.log('Checkout Cart Response:', response);

          this.cart = response;

          if (!response || !response.items || response.items.length === 0) {
            this.router.navigate(['/cart']);
            return;
          }

          // Load actual product images
          this.cart.items.forEach((item) => {
            this.loadProductImage(item);
          });

          this.loadAddresses();
        },

        error: (error: unknown) => {
          console.error('Checkout Cart API Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load checkout details.');
        },
      });
  }
  // =========================================================
  // PRODUCT IMAGE
  // =========================================================

  private loadProductImage(item: Cart['items'][number]): void {
    this.productImageService.getByProductId(item.productId).subscribe({
      next: (images) => {
        if (!images || images.length === 0) {
          return;
        }

        // Primary image first
        const sortedImages = [...images].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) {
            return -1;
          }

          if (!a.isPrimary && b.isPrimary) {
            return 1;
          }

          return a.productImageId - b.productImageId;
        });

        const primaryImage = sortedImages[0];

        if (primaryImage?.imageUrl && this.cart) {
          const cartItem = this.cart.items.find(
            (cartItem) => cartItem.cartItemId === item.cartItemId,
          );

          if (cartItem) {
            cartItem.imageUrl = primaryImage.imageUrl;
          }
        }
      },

      error: (error) => {
        console.error(`Checkout Product Image Error (${item.productId}):`, error);
      },
    });
  }
  // =========================================================
  // LOAD ADDRESSES
  // =========================================================

  loadAddresses(): void {
    this.isLoadingAddresses = true;

    this.errorMessage = '';

    this.addressService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoadingAddresses = false;
        }),
      )
      .subscribe({
        next: (response: Address[]) => {
          console.log('Checkout Address Response:', response);

          this.addresses = response;

          const defaultAddress = response.find((address) => address.isDefault);

          if (defaultAddress) {
            this.selectedAddressId = defaultAddress.addressId;
          } else if (response.length > 0) {
            this.selectedAddressId = response[0].addressId;
          }
        },

        error: (error: unknown) => {
          console.error('Address API Error:', error);

          this.errorMessage = this.getErrorMessage(error, 'Unable to load delivery addresses.');
        },
      });
  }

  // =========================================================
  // SELECT ADDRESS
  // =========================================================

  selectAddress(address: Address): void {
    if (this.isProcessing) {
      return;
    }

    this.selectedAddressId = address.addressId;

    this.errorMessage = '';
  }

  // =========================================================
  // ADD NEW ADDRESS
  // =========================================================

  addNewAddress(): void {
    if (this.isProcessing) {
      return;
    }

    this.router.navigate(['/addresses/new']);
  }

  // =========================================================
  // EDIT ADDRESS
  // =========================================================

  editAddress(address: Address): void {
    if (this.isProcessing) {
      return;
    }

    this.router.navigate(['/addresses/edit', address.addressId]);
  }

  // =========================================================
  // GO TO CART
  // =========================================================

  goToCart(): void {
    if (this.isProcessing) {
      return;
    }

    this.router.navigate(['/cart']);
  }

  // =========================================================
  // CREATE ORDER
  // =========================================================

  proceedToPayment(): void {
    if (this.isProcessing) {
      return;
    }

    // -------------------------------------------------------
    // Cart validation
    // -------------------------------------------------------

    if (!this.cart) {
      this.errorMessage = 'Cart information is not available.';

      return;
    }

    if (!this.cart.items || this.cart.items.length === 0) {
      this.errorMessage = 'Your cart is empty.';

      return;
    }

    // -------------------------------------------------------
    // Address validation
    // -------------------------------------------------------

    if (!this.selectedAddressId) {
      this.errorMessage = 'Please select a delivery address.';

      return;
    }

    // -------------------------------------------------------
    // Payment method validation
    // -------------------------------------------------------

    if (this.paymentMethod !== 'COD' && this.paymentMethod !== 'Razorpay') {
      this.errorMessage = 'Please select a payment method.';

      return;
    }

    // -------------------------------------------------------
    // Create order request
    // -------------------------------------------------------

    const request: CreateOrderRequest = {
      addressId: this.selectedAddressId,
      couponCode: null,
    };

    console.log('Create Order Request:', request);

    console.log('Selected Payment Method:', this.paymentMethod);

    this.isProcessing = true;

    this.errorMessage = '';

    this.successMessage = '';

    // =======================================================
    // STEP 1
    // CREATE ORDER
    // =======================================================

    this.orderService.createOrder(request).subscribe({
      next: (order: Order) => {
        console.log('Order Created:', order);

        this.order = order;

        // =================================================
        // COD
        // =================================================

        if (this.paymentMethod === 'COD') {
          this.createCodPayment(order);

          return;
        }

        // =================================================
        // RAZORPAY
        // =================================================

        this.createRazorpayOrder(order.orderId);
      },

      error: (error: unknown) => {
        console.error('Create Order Error:', error);

        this.isProcessing = false;

        this.errorMessage = this.getErrorMessage(error, 'Unable to create order.');
      },
    });
  }

  // =========================================================
  // COD PAYMENT
  // =========================================================

  private createCodPayment(order: Order): void {
    console.log('Creating COD Payment for Order:', order.orderId);

    this.paymentService
      .createPayment({
        orderId: order.orderId,

        // IMPORTANT:
        // Backend expects CashOnDelivery
        paymentMethod: 'CashOnDelivery',
      })
      .subscribe({
        next: (payment: Payment) => {
          console.log('COD Payment Created:', payment);

          this.payment = payment;

          this.isProcessing = false;

          this.successMessage = 'Order placed successfully with Cash on Delivery.';

          setTimeout(() => {
            this.router.navigate(['/orders', order.orderId]);
          }, 700);
        },

        error: (error: unknown) => {
          console.error('COD Payment Error:', error);

          this.isProcessing = false;

          this.errorMessage = this.getErrorMessage(error, 'Unable to place COD order.');
        },
      });
  }

  // =========================================================
  // CREATE RAZORPAY ORDER
  // =========================================================

  private createRazorpayOrder(orderId: number): void {
    console.log('Creating Razorpay Order for:', orderId);

    this.paymentService.createRazorpayOrder(orderId).subscribe({
      next: (payment: Payment) => {
        console.log('Razorpay Order Response:', payment);

        this.payment = payment;

        this.openRazorpayCheckout(payment);
      },

      error: (error: unknown) => {
        console.error('Create Razorpay Order Error:', error);

        this.isProcessing = false;

        this.errorMessage = this.getErrorMessage(error, 'Unable to start Razorpay payment.');
      },
    });
  }

  // =========================================================
  // OPEN RAZORPAY CHECKOUT
  // =========================================================

  private openRazorpayCheckout(payment: Payment): void {
    console.log('Opening Razorpay Checkout:', payment);

    // -------------------------------------------------------
    // Razorpay Order ID validation
    // -------------------------------------------------------

    if (!payment.razorpayOrderId) {
      this.isProcessing = false;

      this.errorMessage = 'Razorpay Order ID was not generated.';

      return;
    }

    // -------------------------------------------------------
    // Razorpay script validation
    // -------------------------------------------------------

    if (typeof Razorpay === 'undefined') {
      this.isProcessing = false;

      this.errorMessage = 'Razorpay checkout script is not loaded.';

      return;
    }

    // -------------------------------------------------------
    // Razorpay Key validation
    // -------------------------------------------------------

    if (!this.razorpayKeyId) {
      this.isProcessing = false;

      this.errorMessage = 'Razorpay Test Key ID is not configured.';

      return;
    }

    // =======================================================
    // RAZORPAY OPTIONS
    // =======================================================

    const options = {
      key: this.razorpayKeyId,

      amount: Math.round(payment.amount * 100),

      currency: 'INR',

      name: 'Shanti Enterprises',

      description: `Order #${payment.orderNumber}`,

      order_id: payment.razorpayOrderId,

      // -----------------------------------------------------
      // Payment Success
      // -----------------------------------------------------

      handler: (response: any) => {
        console.log('Razorpay Success Response:', response);

        this.verifyRazorpayPayment(payment, response);
      },

      // -----------------------------------------------------
      // Customer Details
      // -----------------------------------------------------

      prefill: {
        name: this.getSelectedAddressName(),

        contact: this.getSelectedAddressMobile(),
      },

      // -----------------------------------------------------
      // Notes
      // -----------------------------------------------------

      notes: {
        orderId: payment.orderId.toString(),
      },

      // -----------------------------------------------------
      // Theme
      // -----------------------------------------------------

      theme: {
        color: '#0d6efd',
      },

      // -----------------------------------------------------
      // Modal
      // -----------------------------------------------------

      modal: {
        ondismiss: () => {
          console.log('Razorpay Checkout Closed');

          this.isProcessing = false;

          this.errorMessage = 'Payment was cancelled.';
        },
      },
    };

    // =======================================================
    // CREATE RAZORPAY INSTANCE
    // =======================================================

    const razorpay = new Razorpay(options);

    // =======================================================
    // PAYMENT FAILED
    // =======================================================

    razorpay.on('payment.failed', (response: any) => {
      console.error('Razorpay Payment Failed:', response);

      this.isProcessing = false;

      this.errorMessage = response?.error?.description || 'Razorpay payment failed.';
    });

    // =======================================================
    // OPEN POPUP
    // =======================================================

    razorpay.open();
  }

  // =========================================================
  // VERIFY RAZORPAY PAYMENT
  // =========================================================

  private verifyRazorpayPayment(payment: Payment, response: any): void {
    // -------------------------------------------------------
    // Validate Razorpay response
    // -------------------------------------------------------

    if (
      !response?.razorpay_order_id ||
      !response?.razorpay_payment_id ||
      !response?.razorpay_signature
    ) {
      this.isProcessing = false;

      this.errorMessage = 'Invalid Razorpay payment response.';

      return;
    }

    // -------------------------------------------------------
    // Create verification request
    // -------------------------------------------------------

    const request = {
      paymentId: payment.paymentId,

      razorpayOrderId: response.razorpay_order_id,

      razorpayPaymentId: response.razorpay_payment_id,

      razorpaySignature: response.razorpay_signature,
    };

    console.log('Razorpay Verify Request:', request);

    this.isProcessing = true;

    // =======================================================
    // VERIFY PAYMENT
    // =======================================================

    this.paymentService.verifyRazorpayPayment(request).subscribe({
      next: (verifiedPayment: Payment) => {
        console.log('Razorpay Payment Verified:', verifiedPayment);

        this.payment = verifiedPayment;

        this.isProcessing = false;

        this.errorMessage = '';

        this.successMessage = 'Payment successful. Your order has been confirmed.';

        setTimeout(() => {
          this.router.navigate(['/orders', payment.orderId]);
        }, 700);
      },

      error: (error: unknown) => {
        console.error('Razorpay Verification Error:', error);

        this.isProcessing = false;

        this.errorMessage = this.getErrorMessage(error, 'Payment verification failed.');
      },
    });
  }

  // =========================================================
  // GET SELECTED ADDRESS NAME
  // =========================================================

  private getSelectedAddressName(): string {
    const address = this.addresses.find((item) => item.addressId === this.selectedAddressId);

    return address?.fullName || '';
  }

  // =========================================================
  // GET SELECTED ADDRESS MOBILE
  // =========================================================

  private getSelectedAddressMobile(): string {
    const address = this.addresses.find((item) => item.addressId === this.selectedAddressId);

    return address?.mobileNumber || '';
  }

  // =========================================================
  // TRACK ADDRESS
  // =========================================================

  trackByAddress(index: number, address: Address): number {
    return address.addressId;
  }

  // =========================================================
  // TRACK CART ITEM
  // =========================================================

  trackByCartItem(index: number, item: Cart['items'][number]): number {
    return item.cartItemId;
  }

  // =========================================================
  // API ERROR MESSAGE
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
