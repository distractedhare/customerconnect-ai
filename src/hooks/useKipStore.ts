import { create } from 'zustand';

interface KipMessage {
  id: string;
  role: 'user' | 'kip';
  text: string;
  timestamp: number;
}

interface KipState {
  isOpen: boolean;
  messages: KipMessage[];
  isTyping: boolean;
  openKip: () => void;
  closeKip: () => void;
  toggleKip: () => void;
  sendMessage: (text: string) => Promise<void>;
}

import { askKip } from '../lib/kip/askKip';

export const useKipStore = create<KipState>((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: 'initial',
      role: 'kip',
      text: "Ready up. Let's stack a shift.",
      timestamp: Date.now(),
    },
  ],
  isTyping: false,
  openKip: () => set({ isOpen: true }),
  closeKip: () => set({ isOpen: false }),
  toggleKip: () => set((state) => ({ isOpen: !state.isOpen })),
  sendMessage: async (text: string) => {
    const userMessage: KipMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
    }));

    try {
      const reply = await askKip(text);
      const kipMessage: KipMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'kip',
        text: reply.text,
        timestamp: Date.now(),
      };
      set((state) => ({
        messages: [...state.messages, kipMessage],
        isTyping: false,
      }));
    } catch (error) {
      set({ isTyping: false });
      // Handle error silently or with a fallback
    }
  },
}));
