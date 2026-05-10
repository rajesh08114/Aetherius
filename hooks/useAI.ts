import { useMutation } from '@tanstack/react-query';
import { authFetch } from '@/lib/utils/authFetch';

export function useAIOptimize() {
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await authFetch('/api/v1/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
      });
      if (!res.ok) throw new Error('Failed to optimize');
      return res.json();
    }
  });
}

export function useAIHealth() {
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await authFetch('/api/v1/ai/health-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
      });
      if (!res.ok) throw new Error('Failed to get health score');
      return res.json();
    }
  });
}

export function useAIMoodMatch() {
  return useMutation({
    mutationFn: async (moods: string[]) => {
      const res = await authFetch('/api/v1/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moods })
      });
      if (!res.ok) throw new Error('Failed to get recommendations');
      const json = await res.json();
      return json.data as { recommendations: any[] };
    }
  });
}

export function useAIChecklist() {
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await authFetch('/api/v1/ai/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
      });
      if (!res.ok) throw new Error('Failed to generate checklist');
      return res.json();
    }
  });
}
