export interface AdminOrderItem {
  orderItemId: number;

  productId: number;

  productName: string;

  sku: string;

  quantity: number;

  unitPrice: number;

  gstPercentage: number;

  gstAmount: number;

  totalPrice: number;
}

export interface AdminOrder {
  orderId: number;

  orderNumber: string;

  userId: number;

  customerName: string;

  customerEmail: string;

  // =========================
  // SHIPPING ADDRESS
  // =========================

  shippingFullName: string;

  shippingMobile: string;

  shippingAddressLine1: string;

  shippingAddressLine2?: string | null;

  shippingCity: string;

  shippingState: string;

  shippingPincode: string;

  shippingCountry: string;

  // =========================
  // AMOUNTS
  // =========================

  subtotal: number;

  gstAmount: number;

  shippingCharge: number;

  grandTotal: number;

  // =========================
  // STATUS
  // =========================

  orderStatus: string;

  paymentStatus: string;

  // =========================
  // DATE
  // =========================

  createdDate: string;

  updatedDate?: string | null;

  // =========================
  // ITEMS
  // =========================

  items: AdminOrderItem[];
}

export interface UpdateOrderStatusRequest {
  orderStatus: string;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: string;
}
