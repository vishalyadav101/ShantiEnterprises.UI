export interface OrderItem {
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

export interface Order {
  orderId: number;

  orderNumber: string;

  userId: number;

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

  couponDiscount: number;

  couponCode?: string | null;

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

  // =========================
  // ITEMS
  // =========================

  items: OrderItem[];
}
export interface CreateOrderRequest {
  addressId: number;
  couponCode?: string | null;
}
