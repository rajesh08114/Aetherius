import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trip, Stop } from '@/types';
import { useTripStore } from '@/store/tripStore';
import { useAuthStore } from '@/store/authStore';

export function useTrip(id: string) {
  const setActiveTrip = useTripStore(state => state.setActiveTrip);
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/trips/${id}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      });
      if (!res.ok) throw new Error('Failed to fetch trip');
      const json = await res.json();
      setActiveTrip(json.data);
      return json.data as Trip;
    }
  });
}

export function useUpdateTrip(id: string) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (data: Partial<Trip>) => {
      const res = await fetch(`/api/v1/trips/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update trip');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
}

export function useAddStop(tripId: string) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (data: Partial<Stop>) => {
      const res = await fetch(`/api/v1/trips/${tripId}/stops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add stop');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    }
  });
}

export function useDeleteStop(tripId: string) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (stopId: string) => {
      const res = await fetch(`/api/v1/trips/${tripId}/stops/${stopId}`, {
        method: 'DELETE',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      });
      if (!res.ok) throw new Error('Failed to delete stop');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    }
  });
}

export function useReorderStops(tripId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (stops: { id: string; order: number }[]) => {
      const res = await fetch(`/api/v1/trips/${tripId}/stops/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ stops })
      });
      if (!res.ok) throw new Error('Failed to reorder stops');
      return true;
    }
  });
}
