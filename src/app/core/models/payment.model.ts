export interface Payment {
  paymentId: number;
  orderId: number;
  orderNumber: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  paymentStatus: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentDate?: string | null;
  remarks?: string | null;
}

export interface CreatePaymentRequest {
  orderId: number;
  paymentMethod: string;
}

export interface PaymentVerifyRequest {
  paymentId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
