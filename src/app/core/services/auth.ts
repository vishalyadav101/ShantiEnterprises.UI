import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  // =========================
  // REGISTER
  // =========================

  register(
    request: RegisterRequest
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/Register`,
      request
    );
  }

  // =========================
  // LOGIN
  // =========================

  login(
    request: LoginRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/Login`,
        request
      )
      .pipe(
        tap(response => {
          localStorage.setItem(
            'token',
            response.token
          );

          localStorage.setItem(
            'user',
            JSON.stringify({
              userId: response.userId,
              fullName: response.fullName,
              email: response.email,
              role: response.role
            })
          );
        })
      );
  }

  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('user');
  }

  // =========================
  // TOKEN
  // =========================

  getToken(): string | null {

    return localStorage.getItem('token');
  }

  // =========================
  // CURRENT USER
  // =========================

  getCurrentUser(): any | null {

    const user = localStorage.getItem('user');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  // =========================
  // AUTH CHECK
  // =========================

  isLoggedIn(): boolean {

    return !!this.getToken();
  }

  // =========================
  // ROLE CHECK
  // =========================

  hasRole(role: string): boolean {

    const user = this.getCurrentUser();

    return user?.role?.toLowerCase() ===
      role.toLowerCase();
  }
}