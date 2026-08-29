import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Shipment } from '../models/shipment.model';

// =========================================================
// SHIPMENT CREATE MODEL
// Backend: ShipmentCreateDto
// =========================================================

export interface ShipmentCreate {
  orderId: number;

  courierName?: string | null;

  trackingNumber?: string | null;

  trackingUrl?: string | null;

  shippingMethod?: string | null;

  estimatedDeliveryDate?: string | null;

  deliveryNotes?: string | null;
}

// =========================================================
// SHIPMENT UPDATE MODEL
// Backend: ShipmentUpdateDto
// =========================================================

export interface ShipmentUpdate {
  courierName?: string | null;

  trackingNumber?: string | null;

  trackingUrl?: string | null;

  shippingMethod?: string | null;

  shipmentStatus?: string | null;

  statusDescription?: string | null;

  estimatedDeliveryDate?: string | null;

  deliveredTo?: string | null;

  deliveryNotes?: string | null;
}

// =========================================================
// SHIPMENT SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Shipment`;

  // =======================================================
  // GET ALL SHIPMENTS
  // GET /api/Shipment
  // ADMIN ONLY
  // =======================================================

  getAll(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(this.apiUrl);
  }

  // =======================================================
  // GET SHIPMENT BY ID
  // GET /api/Shipment/{id}
  // ADMIN ONLY
  // =======================================================

  getById(shipmentId: number): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.apiUrl}/${shipmentId}`);
  }

  // =======================================================
  // GET SHIPMENT BY ORDER
  // GET /api/Shipment/order/{orderId}
  // CUSTOMER / ADMIN
  // =======================================================

  getByOrderId(orderId: number): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.apiUrl}/order/${orderId}`);
  }

  // =======================================================
  // CREATE SHIPMENT
  // POST /api/Shipment
  // ADMIN ONLY
  // =======================================================

  create(data: ShipmentCreate): Observable<Shipment> {
    return this.http.post<Shipment>(this.apiUrl, data);
  }

  // =======================================================
  // UPDATE SHIPMENT
  // PUT /api/Shipment/{id}
  // ADMIN ONLY
  // =======================================================

  update(shipmentId: number, data: ShipmentUpdate): Observable<Shipment> {
    return this.http.put<Shipment>(`${this.apiUrl}/${shipmentId}`, data);
  }

  // =======================================================
  // DELETE SHIPMENT
  // DELETE /api/Shipment/{id}
  // ADMIN ONLY
  // =======================================================

  delete(shipmentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${shipmentId}`);
  }
}
