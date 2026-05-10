import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trip, TripVisibility } from '@/types';

export interface CreateTripInput {
  name: string;
  description?: string;
  coverPhoto?: string;
  startDate?: string;
  endDate?: string;
  totalBudget?: number;
  currency?: string;
  visibility?: TripVisibility;
}

export function useTrips(status: string = 'all', sort: string = 'createdAt') {
  return useQuery({
    queryKey: ['trips', status, sort],
    queryFn: async () => {
      const res = await fetch(`/api/v1/trips?status=${status}&sort=${sort}`);
      if (!res.ok) throw new Error('Failed to fetch trips');
      const json = await res.json();
      return json.data as Trip[];
    }
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTripInput) => {
      const res = await fetch('/api/v1/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create trip');
      const json = await res.json();
      return json.data as Trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/trips/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete trip');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
}
