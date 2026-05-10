'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useTripStore } from '@/store/tripStore';
import { useAuthStore } from '@/store/authStore';
import { authFetch } from '@/lib/utils/authFetch';

const QUICK_PROMPTS = [
  'Suggest a 3-day itinerary',
  'Help me reduce trip cost',
  'What should I pack?',
  'Best local food spots?'
];

export function AIAssistant() {
  const { aiPanelOpen, setAIPanelOpen } = useUIStore();
  const { activeTrip } = useTripStore();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: "Hi! I'm Traveloop AI. How can I help you plan your trip today?" }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const sendPrompt = async (userMessage: string) => {
    if (!userMessage.trim() || isStreaming) return;

    if (!accessToken) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Please sign in to use the AI assistant.' }]);
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsStreaming(true);

    try {
      const tripContext = activeTrip
        ? {
            name: activeTrip.name,
            destinations: activeTrip.stops?.map((s: any) => s.cityName) || [],
            budget: activeTrip.totalBudget
          }
        : null;

      const res = await authFetch('/api/v1/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, tripContext })
      });

      if (res.status === 401) {
        throw new Error('Please sign in again to continue using AI features.');
      }

      if (!res.ok) {
        throw new Error('Unable to fetch AI response right now.');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let boundaryIndex = buffer.indexOf('\n\n');
          while (boundaryIndex !== -1) {
            const eventChunk = buffer.slice(0, boundaryIndex);
            buffer = buffer.slice(boundaryIndex + 2);

            const line = eventChunk.trim();
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (typeof data.text === 'string' && data.text.length > 0) {
                  setMessages((prev) => {
                    const next = [...prev];
                    next[next.length - 1].content += data.text;
                    return next;
                  });
                }
              } catch {
                // Ignore malformed event chunks and continue reading.
              }
            }

            boundaryIndex = buffer.indexOf('\n\n');
          }
        }
      }
    } catch (error: any) {
      const message = error?.message || "Sorry, I'm having trouble connecting right now.";
      setMessages((prev) => [...prev, { role: 'assistant', content: message }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input;
    setInput('');
    await sendPrompt(userMessage);
  };

  if (!aiPanelOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] md:hidden" onClick={() => setAIPanelOpen(false)} />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          className={`pointer-events-auto absolute bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            expanded
              ? 'top-4 bottom-4 left-4 right-4 md:top-8 md:bottom-8 md:right-8 md:left-auto md:w-[680px]'
              : 'bottom-20 left-4 right-4 h-[72vh] md:bottom-8 md:left-auto md:right-8 md:w-[420px] md:h-[520px]'
          }`}
        >
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex items-center justify-between">
            <div className="flex items-center text-white">
              <Sparkles className="w-5 h-5 mr-2" />
              <div>
                <h3 className="font-syne font-bold leading-tight">Traveloop AI</h3>
                <p className="text-xs text-white/80">Trip ideas, budgeting, and planning help</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMessages([{ role: 'assistant', content: "Hi! I'm Traveloop AI. How can I help you plan your trip today?" }])}
                className="text-white/80 hover:text-white transition-colors"
                title="New chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setExpanded(!expanded)} className="text-white/80 hover:text-white transition-colors" title="Resize">
                {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button type="button" onClick={() => setAIPanelOpen(false)} className="text-white/80 hover:text-white transition-colors" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90">
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendPrompt(prompt)}
                  disabled={isStreaming}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-900 rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about itinerary, budget, weather, or packing"
                className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="absolute right-2 w-8 h-8 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
