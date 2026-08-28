import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Notification, CreateNotification } from '../models/notification.model';

// =========================================================
// NOTIFICATION SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Notification`;

  // =======================================================
  // GET MY NOTIFICATIONS
  // GET /api/Notification
  // AUTHENTICATED USER
  // =======================================================

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  // =======================================================
  // GET UNREAD NOTIFICATIONS
  // GET /api/Notification/unread
  // AUTHENTICATED USER
  // =======================================================

  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  // =======================================================
  // GET NOTIFICATION BY ID
  // GET /api/Notification/{id}
  // AUTHENTICATED USER
  // =======================================================

  getById(notificationId: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${notificationId}`);
  }

  // =======================================================
  // CREATE NOTIFICATION
  // POST /api/Notification
  // AUTHENTICATED USER
  // =======================================================

  create(data: CreateNotification): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, data);
  }

  // =======================================================
  // MARK AS READ
  // PUT /api/Notification/{id}/read
  // =======================================================

  markAsRead(notificationId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // =======================================================
  // MARK ALL AS READ
  // PUT /api/Notification/read-all
  // =======================================================

  markAllAsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/read-all`, {});
  }

  // =======================================================
  // DELETE NOTIFICATION
  // DELETE /api/Notification/{id}
  // =======================================================

  delete(notificationId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${notificationId}`);
  }
}
