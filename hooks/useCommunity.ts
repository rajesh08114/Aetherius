import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

export function useCommunityFeed(sort: string = 'recent') {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ['community', sort],
    queryFn: async () => {
      const res = await fetch(`/api/v1/community?sort=${sort}`,
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined }
      );
      if (!res.ok) throw new Error('Failed to fetch feed');
      const json = await res.json();
      return json.data;
    }
  });
}

export function useLikeTrip() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch(`/api/v1/trips/${tripId}/like`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      });
      if (!res.ok) throw new Error('Failed to like trip');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
    }
  });
}

export function useComments(tripId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ['comments', tripId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/trips/${tripId}/comment`,
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined }
      );
      if (!res.ok) throw new Error('Failed to fetch comments');
      const json = await res.json();
      return json.data;
    },
    enabled: !!tripId
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async ({ tripId, content }: { tripId: string, content: string }) => {
      const res = await fetch(`/api/v1/trips/${tripId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to add comment');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    }
  });
}
