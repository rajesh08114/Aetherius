import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { BudgetBreakdown } from '@/types';
import { authFetch } from '@/lib/utils/authFetch';

export function useBudget(tripId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ['budget', tripId],
    queryFn: async () => {
      const res = await authFetch(`/api/v1/trips/${tripId}/budget`);
      if (!res.ok) throw new Error('Failed to fetch budget');
      const json = await res.json();
      return json.data as BudgetBreakdown;
    },
    enabled: !!accessToken && !!tripId
  });
}
