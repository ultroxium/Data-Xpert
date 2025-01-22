import {create} from 'zustand';
import { request } from '@/config/api-config';
import { ApiRoutes } from '@/config/api-routes';
import { toast } from 'sonner';

interface Notification {
  id: number
  title: string
  message: string
  tag: string
  created_at: string
  isRead: boolean
}
interface NotificationsState {
  isLoading: boolean;
  isSuccess: boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  getApiNotifications: (status?: string) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  isLoading: false,
  isSuccess: false,
  notifications: [],

  addNotification: (notification) =>
    set((state) => {
      const exists = state.notifications.some(
        (n) =>
          n.title === notification.title &&
          n.message === notification.message &&
          n.tag === notification.tag,
      );

      if (!exists) {
        return { notifications: [notification, ...state.notifications] };
      }

      return state;
    }),

  getApiNotifications: async (status: string = 'unread') => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await request('get', `${ApiRoutes.notifications}/?status=${status}`);

      set((state) => {
        const newNotifications = response.data.filter(
          (notification: Notification) =>
            !state.notifications.some(
              (n) =>
                n.title === notification.title &&
                n.message === notification.message &&
                n.tag === notification.tag,
            ),
        );

        return {
          notifications: [...state.notifications, ...newNotifications],
          isLoading: false,
          isSuccess: true,
        };
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get notifications';
      toast.error(errorMessage);
      set({ isLoading: false, isSuccess: false });
    }
  },
}));
