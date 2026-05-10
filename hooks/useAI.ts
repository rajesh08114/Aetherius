import { useMutation } from '@tanstack/react-query';

export function useAIOptimize() {
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch('/api/v1/ai/optimize', {
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
      const res = await fetch('/api/v1/ai/health-score', {
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
      const res = await fetch('/api/v1/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moods })
      });
      if (!res.ok) throw new Error('Failed to get recommendations');
      return res.json();
    }
  });
}

export function useAIChecklist() {
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch('/api/v1/ai/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
      });
      if (!res.ok) throw new Error('Failed to generate checklist');
      return res.json();
    }
  });
}
