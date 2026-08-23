import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUser {
  userId: number;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  isActive: boolean;
  createdDate: string;
}

export interface AdminUserUpdate {
  fullName: string;
  email: string;
  mobile: string;
  role: string;
}

export interface AdminUserStatus {
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://localhost:7266/api/AdminUser';

  // ==========================================
  // GET ALL USERS
  // ==========================================

  getAll(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.apiUrl);
  }

  // ==========================================
  // GET USER BY ID
  // ==========================================

  getById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // UPDATE USER
  // ==========================================

  update(id: number, data: AdminUserUpdate): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${id}`, data);
  }

  // ==========================================
  // UPDATE USER STATUS
  // ==========================================

  updateStatus(id: number, data: AdminUserStatus): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${id}/status`, data);
  }

  // ==========================================
  // DELETE USER
  // ==========================================

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
