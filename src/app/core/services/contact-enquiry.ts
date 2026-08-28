import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ContactEnquiry,
  CreateContactEnquiry,
  UpdateContactEnquiry,
} from '../models/contact-enquiry.model';

// =========================================================
// CONTACT ENQUIRY SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class ContactEnquiryService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/ContactEnquiry`;

  // =======================================================
  // CREATE CONTACT ENQUIRY
  // POST /api/ContactEnquiry
  // PUBLIC
  // =======================================================

  create(data: CreateContactEnquiry): Observable<ContactEnquiry> {
    return this.http.post<ContactEnquiry>(this.apiUrl, data);
  }

  // =======================================================
  // GET ALL CONTACT ENQUIRIES
  // GET /api/ContactEnquiry
  // ADMIN
  // =======================================================

  getAll(): Observable<ContactEnquiry[]> {
    return this.http.get<ContactEnquiry[]>(this.apiUrl);
  }

  // =======================================================
  // GET CONTACT ENQUIRY BY ID
  // GET /api/ContactEnquiry/{id}
  // ADMIN
  // =======================================================

  getById(contactEnquiryId: number): Observable<ContactEnquiry> {
    return this.http.get<ContactEnquiry>(`${this.apiUrl}/${contactEnquiryId}`);
  }

  // =======================================================
  // UPDATE CONTACT ENQUIRY
  // PUT /api/ContactEnquiry/{id}
  // ADMIN
  // =======================================================

  update(contactEnquiryId: number, data: UpdateContactEnquiry): Observable<ContactEnquiry> {
    return this.http.put<ContactEnquiry>(`${this.apiUrl}/${contactEnquiryId}`, data);
  }

  // =======================================================
  // DELETE CONTACT ENQUIRY
  // DELETE /api/ContactEnquiry/{id}
  // ADMIN
  // =======================================================

  delete(contactEnquiryId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${contactEnquiryId}`);
  }
}
