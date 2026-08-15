import apiClient from './client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  metadata?: any;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const res: any = await apiClient.get('/notifications');
    return res.data || res;
  },

  markAsRead: async (id: string) => {
    const res: any = await apiClient.patch(`/notifications/${id}/read`);
    return res.data || res;
  },

  markAllAsRead: async () => {
    const res: any = await apiClient.patch('/notifications/read-all');
    return res.data || res;
  }
};
