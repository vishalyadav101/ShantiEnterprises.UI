export interface Refund {
  refundId: number;
  returnId: number;
  orderId: number;
  paymentId: number;
  refundAmount: number;
  refundStatus: string;
  refundReference: string | null;
  refundDate: string | null;
  failureReason: string | null;
  createdDate: string;
  updatedDate: string | null;
}

export interface ReturnRequest {
  returnId: number;
  orderId: number;
  orderNumber: string;
  orderItemId: number;
  userId: number;
  customerName: string;
  productName: string;
  quantity: number;
  refundAmount: number;
  reason: string;
  description: string | null;
  returnStatus: string;
  adminComment: string | null;
  requestedDate: string;
  approvedDate: string | null;
  receivedDate: string | null;
  completedDate: string | null;
  createdDate: string;
  updatedDate: string | null;
  refund: Refund | null;
}

export interface CreateReturn {
  orderId: number;
  orderItemId: number;
  reason: string;
  description?: string | null;
}

export interface UpdateReturn {
  returnStatus: string;
  adminComment?: string | null;
}

export interface RefundStatusUpdate {
  refundStatus: string;
  refundReference?: string | null;
  failureReason?: string | null;
}
