'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAuthStore } from '@/store/authStore';
import { useAdminAnalytics, useUpdateUserRole } from '@/hooks/useAdminAnalytics';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, BarChart3, Users, MapPinned, Route, MessageSquareText, ThumbsUp, Eye, ShieldCheck, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<string, string> = {
  planning: '#f59e0b',
  ongoing: '#0ea5e9',
  completed: '#22c55e'
};

const PIE_COLORS = ['#f59e0b', '#0ea5e9', '#22c55e', '#64748b'];

function formatShortDate(dateValue: string | Date) {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatLongDate(dateValue: string | Date) {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading, isError, error, refetch, isRefetching } = useAdminAnalytics();
  const updateRoleMutation = useUpdateUserRole();

  const overview = data?.overview;

  const statusChartData = useMemo(() => {
    return (data?.tripStatusDistribution ?? []).map((item) => ({
      ...item,
      label: item.status[0].toUpperCase() + item.status.slice(1)
    }));
  }, [data?.tripStatusDistribution]);

  if (user && user.role !== 'admin') {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl">
          <div className="glass-card rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-syne font-bold text-aetherius-heading">Admin Access Required</h1>
            <p className="mt-2 text-aetherius-muted">This dashboard is available only to admin accounts.</p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="mt-5 rounded-lg bg-aetherius-nav px-4 py-2 text-sm font-semibold text-white hover:bg-black"
            >
              Back To Home
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-syne font-bold text-aetherius-heading">Admin Analytics Dashboard</h1>
            <p className="mt-1 text-aetherius-muted">Track platform adoption, trip trends, and engagement performance.</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center rounded-xl border border-aetherius-line bg-white px-4 py-2 text-sm font-semibold text-aetherius-heading hover:bg-aetherius-field"
            disabled={isRefetching}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="glass-card h-28 animate-pulse rounded-2xl border border-aetherius-line bg-white" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-500">
            {(error as Error)?.message || 'Unable to load admin analytics.'}
          </div>
        ) : null}

        {!isLoading && data && overview ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Total Users', value: overview.totalUsers, icon: Users, color: 'text-blue-400' },
                { label: 'Total Trips', value: overview.totalTrips, icon: Route, color: 'text-amber-500' },
                { label: 'Total Activities', value: overview.totalActivities, icon: Activity, color: 'text-purple-400' },
                { label: 'Total Stops', value: overview.totalStops, icon: MapPinned, color: 'text-green-400' },
                { label: 'Active Users (30d)', value: overview.activeUsers30, icon: BarChart3, color: 'text-slate-700' },
                { label: 'Avg Views / Trip', value: overview.engagement.avgViewsPerTrip, icon: Eye, color: 'text-cyan-500' }
              ].map((metric) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl border border-aetherius-line p-5"
                >
                  <metric.icon className={`mb-3 h-5 w-5 ${metric.color}`} />
                  <div className="text-2xl font-syne font-bold text-aetherius-heading">{metric.value}</div>
                  <p className="text-sm text-aetherius-muted">{metric.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="glass-card rounded-2xl border border-aetherius-line p-5 lg:col-span-2">
                <h2 className="mb-4 text-lg font-syne font-bold text-aetherius-heading">Trips Created (Last 30 Days)</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.tripCreationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                      <XAxis dataKey="date" tickFormatter={(value) => formatShortDate(value)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip labelFormatter={(value) => formatLongDate(String(value))} />
                      <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card rounded-2xl border border-aetherius-line p-5">
                <h2 className="mb-4 text-lg font-syne font-bold text-aetherius-heading">Trip Status Mix</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`${entry.label}-${index}`} fill={STATUS_COLORS[entry.status] || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="glass-card rounded-2xl border border-aetherius-line p-5">
                <h2 className="mb-4 text-lg font-syne font-bold text-aetherius-heading">User Growth (Last 30 Days)</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.userGrowthTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                      <XAxis dataKey="date" tickFormatter={(value) => formatShortDate(value)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip labelFormatter={(value) => formatLongDate(String(value))} />
                      <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card rounded-2xl border border-aetherius-line p-5">
                <h2 className="mb-4 text-lg font-syne font-bold text-aetherius-heading">Top Cities By Planned Trips</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topCities} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="cityName" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="tripsCount" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="glass-card rounded-2xl border border-aetherius-line p-5">
                <h2 className="mb-4 flex items-center text-lg font-syne font-bold text-aetherius-heading">
                  <ThumbsUp className="mr-2 h-5 w-5 text-amber-500" />
                  Engagement Snapshot
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-aetherius-line bg-white p-3">
                    <p className="text-sm text-aetherius-muted">Total Likes</p>
                    <p className="text-xl font-syne font-bold">{overview.engagement.totalLikes}</p>
                  </div>
                  <div className="rounded-xl border border-aetherius-line bg-white p-3">
                    <p className="text-sm text-aetherius-muted">Total Comments</p>
                    <p className="text-xl font-syne font-bold">{overview.engagement.totalComments}</p>
                  </div>
                  <div className="rounded-xl border border-aetherius-line bg-white p-3">
                    <p className="text-sm text-aetherius-muted">Total Views</p>
                    <p className="text-xl font-syne font-bold">{overview.engagement.totalViews}</p>
                  </div>
                  <div className="rounded-xl border border-aetherius-line bg-white p-3">
                    <p className="text-sm text-aetherius-muted">Total Forks</p>
                    <p className="text-xl font-syne font-bold">{overview.engagement.totalForks}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl border border-aetherius-line p-5">
                <h2 className="mb-4 flex items-center text-lg font-syne font-bold text-aetherius-heading">
                  <MessageSquareText className="mr-2 h-5 w-5 text-amber-500" />
                  Top Activities
                </h2>
                <div className="space-y-2">
                  {data.topActivities.map((activityType) => (
                    <div key={activityType.type} className="flex items-center justify-between rounded-lg border border-aetherius-line bg-white px-3 py-2">
                      <div>
                        <p className="font-medium capitalize">{activityType.type}</p>
                        <p className="text-xs text-aetherius-muted">{activityType.count} planned</p>
                      </div>
                      <p className="text-sm text-aetherius-muted">Avg ${activityType.avgCost}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-aetherius-line p-5">
              <h2 className="mb-4 text-lg font-syne font-bold text-aetherius-heading">Recent Trips</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-aetherius-line text-left text-aetherius-muted">
                      <th className="py-2 pr-2">Trip</th>
                      <th className="py-2 pr-2">Owner</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2">Views</th>
                      <th className="py-2 pr-2">Likes</th>
                      <th className="py-2 pr-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTrips.map((trip) => (
                      <tr key={trip._id} className="border-b border-aetherius-line/60">
                        <td className="py-2 pr-2 font-medium">{trip.name}</td>
                        <td className="py-2 pr-2">
                          <div>{trip.ownerName}</div>
                          <div className="text-xs text-aetherius-muted">{trip.ownerEmail}</div>
                        </td>
                        <td className="py-2 pr-2">
                          <span
                            className="rounded-full px-2 py-1 text-xs text-white"
                            style={{ backgroundColor: STATUS_COLORS[trip.status] || '#64748b' }}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="py-2 pr-2">{trip.viewCount}</td>
                        <td className="py-2 pr-2">{trip.likesCount}</td>
                        <td className="py-2 pr-2">{formatLongDate(trip.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-aetherius-line p-5">
              <h2 className="mb-4 text-lg font-syne font-bold text-aetherius-heading">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-aetherius-line text-left text-aetherius-muted">
                      <th className="py-2 pr-2">User</th>
                      <th className="py-2 pr-2">Role</th>
                      <th className="py-2 pr-2">Trips</th>
                      <th className="py-2 pr-2">Followers</th>
                      <th className="py-2 pr-2">Joined</th>
                      <th className="py-2 pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((account) => {
                      const isSelf = account._id === user?._id;
                      const nextRole: 'user' | 'admin' = account.role === 'admin' ? 'user' : 'admin';

                      return (
                        <tr key={account._id} className="border-b border-aetherius-line/60">
                          <td className="py-2 pr-2">
                            <div className="font-medium">{account.name}</div>
                            <div className="text-xs text-aetherius-muted">{account.email}</div>
                          </td>
                          <td className="py-2 pr-2">
                            <span className={`rounded-full px-2 py-1 text-xs ${account.role === 'admin' ? 'bg-amber-500/15 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                              {account.role}
                            </span>
                          </td>
                          <td className="py-2 pr-2">{account.tripsCount}</td>
                          <td className="py-2 pr-2">{account.followersCount}</td>
                          <td className="py-2 pr-2">{formatLongDate(account.createdAt)}</td>
                          <td className="py-2 pr-2">
                            <button
                              type="button"
                              className="rounded-lg border border-aetherius-line bg-white px-3 py-1.5 text-xs font-semibold hover:bg-aetherius-field disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={isSelf || updateRoleMutation.isPending}
                              onClick={() => updateRoleMutation.mutate({ userId: account._id, role: nextRole })}
                            >
                              {account.role === 'admin' ? 'Demote To User' : 'Promote To Admin'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </PageTransition>
  );
}
