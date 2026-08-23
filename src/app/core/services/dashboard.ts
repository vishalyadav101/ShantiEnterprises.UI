import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface DashboardResponse {
  totalUsers: number;
  totalCustomers: number;
  totalAdmins: number;

  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;

  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  totalPayments: number;
  pendingPayments: number;
  paidPayments: number;
  failedPayments: number;

  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  completedReturns: number;

  totalRefunds: number;
  pendingRefunds: number;
  completedRefunds: number;

  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Dashboard`;

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.apiUrl);
  }
}
