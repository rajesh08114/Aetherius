import { create } from 'zustand';
import { AIRecommendation } from '@/types';

interface AIStore {
  messages: { role: 'user' | 'assistant'; content: string }[];
  isStreaming: boolean;
  recommendations: AIRecommendation[];
  addMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void;
  setStreaming: (v: boolean) => void;
  setRecommendations: (recs: AIRecommendation[]) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  messages: [],
  isStreaming: false,
  recommendations: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setStreaming: (v) => set({ isStreaming: v }),
  setRecommendations: (recs) => set({ recommendations: recs }),
  clearMessages: () => set({ messages: [] })
}));
