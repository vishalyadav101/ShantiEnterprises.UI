// =========================================================
// NOTIFICATION MODEL
// =========================================================

export interface Notification {
  notificationId: number;

  userId: number;

  title: string;

  message: string;

  type: string | null;

  referenceType: string | null;

  referenceId: number | null;

  isRead: boolean;

  createdDate: string;

  readDate?: string | null;
}

// =========================================================
// CREATE NOTIFICATION
// Backend: CreateNotificationDto
// =========================================================

export interface CreateNotification {
  title: string;

  message: string;

  type?: string | null;

  referenceType?: string | null;

  referenceId?: number | null;
}