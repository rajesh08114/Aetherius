import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { BudgetBreakdown } from '@/types';

export function useBudget(tripId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ['budget', tripId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/trips/${tripId}/budget`,
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined }
      );
      if (!res.ok) throw new Error('Failed to fetch budget');
      const json = await res.json();
      return json.data as BudgetBreakdown;
    }
  });
}
