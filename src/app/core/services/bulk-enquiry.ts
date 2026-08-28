import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { BulkEnquiry, CreateBulkEnquiry, UpdateBulkEnquiry } from '../models/bulk-enquiry.model';

// =========================================================
// BULK ENQUIRY SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class BulkEnquiryService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/BulkEnquiry`;

  // =======================================================
  // GET ALL BULK ENQUIRIES
  // GET /api/BulkEnquiry
  // ADMIN ONLY
  // =======================================================

  getAll(): Observable<BulkEnquiry[]> {
    return this.http.get<BulkEnquiry[]>(this.apiUrl);
  }

  // =======================================================
  // GET BULK ENQUIRY BY ID
  // GET /api/BulkEnquiry/{id}
  // ADMIN ONLY
  // =======================================================

  getById(bulkEnquiryId: number): Observable<BulkEnquiry> {
    return this.http.get<BulkEnquiry>(`${this.apiUrl}/${bulkEnquiryId}`);
  }

  // =======================================================
  // CREATE BULK ENQUIRY
  // POST /api/BulkEnquiry
  // PUBLIC
  // =======================================================

  create(data: CreateBulkEnquiry): Observable<BulkEnquiry> {
    return this.http.post<BulkEnquiry>(this.apiUrl, data);
  }

  // =======================================================
  // UPDATE BULK ENQUIRY
  // PUT /api/BulkEnquiry/{id}
  // ADMIN ONLY
  // =======================================================

  update(bulkEnquiryId: number, data: UpdateBulkEnquiry): Observable<BulkEnquiry> {
    return this.http.put<BulkEnquiry>(`${this.apiUrl}/${bulkEnquiryId}`, data);
  }

  // =======================================================
  // DELETE BULK ENQUIRY
  // DELETE /api/BulkEnquiry/{id}
  // ADMIN ONLY
  // =======================================================

  delete(bulkEnquiryId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${bulkEnquiryId}`);
  }
}
