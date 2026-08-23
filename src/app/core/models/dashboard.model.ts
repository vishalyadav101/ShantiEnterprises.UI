export interface Dashboard {
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
    