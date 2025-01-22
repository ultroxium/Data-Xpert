import {create} from 'zustand';
import { toast } from 'sonner';
import { request } from '@/config/api-config';
import { ApiRoutes } from '@/config/api-routes';

interface Chat {
  speaker: string;
  message: string;
  created_at: string;
}

interface ChatState {
  isChatLoading: boolean;
  isChatSuccess: boolean;
  isMessageSending: boolean;
  isMessageSent: boolean;
  chats: Chat[];
}

export const useChatStore = create<ChatState>((set) => ({
  isChatLoading: false,
  isChatSuccess: false,
  isMessageSending: false,
  isMessageSent: false,
  chats: [],

  getChats: async (id, wid) => {
    set({ isChatLoading: true, isChatSuccess: false });
    try {
      const response = await request(
        'get',
        `${ApiRoutes.chats}/?workspace_id=${wid}&dataset_id=${id}`,
      );
      const newChats = response.data;

      set((state) => ({
        chats: newChats,
        isChatLoading: false,
        isChatSuccess: true,
      }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get notifications';
      toast.error(errorMessage);
      set({ isChatLoading: false, isChatSuccess: false });
    }
  },

  addChats: async (id: number, wid: number, message: string, speaker: string) => {
    const sendChat = {
      speaker: speaker,
      message: message,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      chats: [...state.chats, sendChat],
      isMessageSending: true,
      isMessageSent: false,
    }));

    try {
      const response = await request(
        'post',
        `${ApiRoutes.chats}/send_message?workspace_id=${wid}&dataset_id=${id}&message=${message}&speaker=${speaker}`,
      );
      const newChats = response.data;

      set((state) => ({
        chats: [...state.chats, newChats],
        isMessageSending: false,
        isMessageSent: true,
      }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get notifications';
      toast.error(errorMessage);
      set({ isMessageSending: false, isMessageSent: false });
    }
  },
}));
