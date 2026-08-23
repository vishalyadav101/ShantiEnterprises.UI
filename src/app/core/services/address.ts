import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Address, AddressCreateRequest, AddressUpdateRequest } from '../models/address.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Address`;

  /**
   * Get all addresses of current user
   */
  getAll(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl);
  }

  /**
   * Get address by id
   */
  getById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new address
   */
  create(request: AddressCreateRequest): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, request);
  }

  /**
   * Update existing address
   */
  update(id: number, request: AddressUpdateRequest): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete address
   */
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Set address as default
   */
  setDefault(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/default`, {});
  }
}
