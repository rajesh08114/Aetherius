import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authFetch } from '@/lib/utils/authFetch';

export function useCarbon(tripId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ['carbon', tripId],
    queryFn: async () => {
      const res = await authFetch(`/api/v1/carbon?tripId=${tripId}`);
      if (!res.ok) throw new Error('Failed to fetch carbon footprint');
      const json = await res.json();
      return json.data;
    },
    enabled: !!tripId && !!accessToken
  });
}
