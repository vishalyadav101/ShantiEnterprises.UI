import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { ReturnRequest, CreateReturn, Refund, RefundStatusUpdate } from '../models/return.model';

@Injectable({
  providedIn: 'root',
})
export class ReturnService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Return`;

  // =======================================================
  // CUSTOMER - GET MY RETURNS
  // GET /api/Return/my
  // =======================================================

  getMyReturns(): Observable<ReturnRequest[]> {
    return this.http.get<ReturnRequest[]>(`${this.apiUrl}/my`);
  }
  // =======================================================
  // ADMIN
  // GET ALL RETURNS
  // GET /api/Return
  // =======================================================

  getAll(): Observable<ReturnRequest[]> {
    return this.http.get<ReturnRequest[]>(this.apiUrl);
  }
  // =======================================================
  // GET RETURN BY ID
  // GET /api/Return/{id}
  // CUSTOMER / ADMIN
  // =======================================================

  getById(returnId: number): Observable<ReturnRequest> {
    return this.http.get<ReturnRequest>(`${this.apiUrl}/${returnId}`);
  }

  // =======================================================
  // CREATE RETURN
  // POST /api/Return
  // CUSTOMER
  // =======================================================

  create(data: CreateReturn): Observable<ReturnRequest> {
    return this.http.post<ReturnRequest>(this.apiUrl, data);
  }

  // =======================================================
  // GET REFUND BY RETURN
  // GET /api/Return/{id}/refund
  // CUSTOMER / ADMIN
  // =======================================================

  getRefundByReturnId(returnId: number): Observable<Refund> {
    return this.http.get<Refund>(`${this.apiUrl}/${returnId}/refund`);
  }

  // =======================================================
  // DELETE RETURN
  // DELETE /api/Return/{id}
  // ADMIN
  // =======================================================

  delete(returnId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${returnId}`);
  }

  // =======================================================
  // ADMIN - UPDATE RETURN STATUS
  // PUT /api/Return/{id}
  // =======================================================

  updateStatus(
    returnId: number,
    returnStatus: string,
    adminComment?: string | null,
  ): Observable<ReturnRequest> {
    return this.http.put<ReturnRequest>(`${this.apiUrl}/${returnId}`, {
      returnStatus,
      adminComment: adminComment ?? null,
    });
  }

  // =======================================================
  // ADMIN - CREATE REFUND
  // POST /api/Return/{id}/refund
  // =======================================================

  createRefund(returnId: number): Observable<Refund> {
    return this.http.post<Refund>(`${this.apiUrl}/${returnId}/refund`, {});
  }

  // =======================================================
  // ADMIN - UPDATE REFUND STATUS
  // PUT /api/Return/refund/{id}/status
  // =======================================================

  updateRefundStatus(refundId: number, data: RefundStatusUpdate): Observable<Refund> {
    return this.http.put<Refund>(`${this.apiUrl}/refund/${refundId}/status`, data);
  }
}
