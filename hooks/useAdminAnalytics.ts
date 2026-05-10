import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authFetch } from '@/lib/utils/authFetch';

export interface AdminAnalyticsPayload {
  overview: {
    totalUsers: number;
    totalTrips: number;
    totalActivities: number;
    totalStops: number;
    activeUsers30: number;
    engagement: {
      totalLikes: number;
      totalComments: number;
      totalViews: number;
      totalForks: number;
      avgViewsPerTrip: number;
    };
  };
  tripStatusDistribution: Array<{ status: string; count: number }>;
  tripCreationTrend: Array<{ date: string; count: number }>;
  userGrowthTrend: Array<{ date: string; count: number }>;
  topCities: Array<{ cityName: string; country: string; stopsCount: number; tripsCount: number }>;
  topActivities: Array<{ type: string; count: number; avgCost: number }>;
  recentTrips: Array<{
    _id: string;
    name: string;
    status: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    likesCount: number;
    viewCount: number;
    forkCount: number;
    totalBudget: number | null;
    currency: string;
    ownerName: string;
    ownerEmail: string;
  }>;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
    followersCount: number;
    followingCount: number;
    tripsCount: number;
  }>;
}

export function useAdminAnalytics() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await authFetch('/api/v1/admin/analytics');
      if (!res.ok) {
        const message = await res.json().catch(() => ({}));
        throw new Error(message?.error || 'Failed to load admin analytics.');
      }
      const json = await res.json();
      return json.data as AdminAnalyticsPayload;
    },
    enabled: !!accessToken
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
      const res = await authFetch(`/api/v1/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!res.ok) {
        const message = await res.json().catch(() => ({}));
        throw new Error(message?.error || 'Unable to update role.');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}
