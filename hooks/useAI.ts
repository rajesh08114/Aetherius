import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

export function useAIOptimize() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch('/api/v1/ai/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ tripId })
      });
      if (!res.ok) throw new Error('Failed to optimize');
      return res.json();
    }
  });
}

export function useAIHealth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch('/api/v1/ai/health-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ tripId })
      });
      if (!res.ok) throw new Error('Failed to get health score');
      return res.json();
    }
  });
}

export function useAIMoodMatch() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (moods: string[]) => {
      const res = await fetch('/api/v1/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ moods })
      });
      if (!res.ok) throw new Error('Failed to get recommendations');
      return res.json();
    }
  });
}

export function useAIChecklist() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch('/api/v1/ai/checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ tripId })
      });
      if (!res.ok) throw new Error('Failed to generate checklist');
      return res.json();
    }
  });
}
