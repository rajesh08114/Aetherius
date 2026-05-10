import { useQuery } from '@tanstack/react-query';
import { BudgetBreakdown } from '@/types';

export function useBudget(tripId: string) {
  return useQuery({
    queryKey: ['budget', tripId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/trips/${tripId}/budget`);
      if (!res.ok) throw new Error('Failed to fetch budget');
      const json = await res.json();
      return json.data as BudgetBreakdown;
    }
  });
}
