// =========================================================
// SHIPMENT MODEL
// Backend: ShipmentResponseDto
// =========================================================

export interface Shipment {
  shipmentId: number;

  orderId: number;

  orderNumber: string;

  courierName: string | null;

  trackingNumber: string | null;

  trackingUrl: string | null;

  shippingMethod: string;

  shipmentStatus: string;

  statusDescription: string | null;

  shippedDate: string | null;

  estimatedDeliveryDate: string | null;

  outForDeliveryDate: string | null;

  deliveredDate: string | null;

  deliveredTo: string | null;

  deliveryNotes: string | null;

  createdDate: string;

  updatedDate: string | null;
}
