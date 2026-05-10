import { useQuery } from '@tanstack/react-query';

export function useCarbon(tripId: string) {
  return useQuery({
    queryKey: ['carbon', tripId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/carbon?tripId=${tripId}`);
      if (!res.ok) throw new Error('Failed to fetch carbon footprint');
      const json = await res.json();
      return json.data;
    },
    enabled: !!tripId
  });
}
