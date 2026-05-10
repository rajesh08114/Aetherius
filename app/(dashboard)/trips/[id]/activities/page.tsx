'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { useTrip } from '@/hooks/useTrip';
import { authFetch } from '@/lib/utils/authFetch';
import { Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

type ActivityRecord = {
  _id: string;
  name: string;
  type: string;
  cost: number;
  duration?: number;
  description?: string;
};

const ACTIVITY_TYPES = ['sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nightlife'];

export default function ActivitySearchPage({ params }: { params: { id: string } }) {
  const { data: trip, isLoading } = useTrip(params.id);
  const [selectedStopId, setSelectedStopId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [query, setQuery] = useState('');
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ name: '', type: 'sightseeing', cost: '', duration: '', description: '' });

  const stops = useMemo(() => {
    if (!trip || !Array.isArray(trip.stops)) return [];
    return [...trip.stops].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }, [trip]);

  useEffect(() => {
    if (stops.length > 0 && !selectedStopId) {
      setSelectedStopId((stops[0] as any)._id);
    }
  }, [stops, selectedStopId]);

  const fetchActivities = async () => {
    if (!selectedStopId) return;
    setLoadingActivities(true);
    try {
      const paramsObj = new URLSearchParams({ stopId: selectedStopId });
      if (filterType) paramsObj.set('type', filterType);
      const res = await authFetch(`/api/v1/activities?${paramsObj.toString()}`);
      if (!res.ok) throw new Error('Failed to load activities');
      const json = await res.json();
      let rows = json.data || [];
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        rows = rows.filter((a: ActivityRecord) => a.name.toLowerCase().includes(q));
      }
      setActivities(rows);
    } catch (error: any) {
      toast.error(error?.message || 'Could not load activities');
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStopId, filterType]);

  const addActivity = async () => {
    if (!selectedStopId) {
      toast.error('Please select a stop first');
      return;
    }
    if (!draft.name.trim()) {
      toast.error('Activity name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch('/api/v1/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: params.id,
          stopId: selectedStopId,
          activity: {
            name: draft.name,
            type: draft.type,
            cost: Number(draft.cost || 0),
            duration: draft.duration ? Number(draft.duration) : undefined,
            description: draft.description
          }
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add activity');
      setDraft({ name: '', type: draft.type, cost: '', duration: '', description: '' });
      await fetchActivities();
      toast.success('Activity added');
    } catch (error: any) {
      toast.error(error?.message || 'Could not add activity');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-syne font-bold text-aetherius-heading">Activity Search & Planner</h1>
          <p className="text-aetherius-muted mt-1">Browse activities by category, cost, and duration for each stop.</p>
        </div>

        <div className="glass-card border border-aetherius-line rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              className="rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading"
            >
              <option value="">Select stop</option>
              {stops.map((stop: any) => (
                <option key={stop._id} value={stop._id}>{stop.cityName}, {stop.country}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading"
            >
              <option value="">All types</option>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-aetherius-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by activity name"
                className="w-full rounded-lg border border-aetherius-line bg-aetherius-field pl-9 pr-3 py-2 text-aetherius-heading"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Activity name"
              className="rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading"
            />
            <select
              value={draft.type}
              onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
              className="rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading"
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              value={draft.cost}
              onChange={(e) => setDraft((prev) => ({ ...prev, cost: e.target.value }))}
              placeholder="Cost"
              type="number"
              className="rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading"
            />
            <input
              value={draft.duration}
              onChange={(e) => setDraft((prev) => ({ ...prev, duration: e.target.value }))}
              placeholder="Duration (min)"
              type="number"
              className="rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading"
            />
            <button
              type="button"
              disabled={saving}
              onClick={addActivity}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add
            </button>
          </div>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Short description (optional)"
            className="w-full min-h-20 rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading"
          />
        </div>

        <div className="glass-card border border-aetherius-line rounded-2xl p-5">
          <h2 className="font-semibold text-aetherius-heading mb-3">Activities</h2>
          {loadingActivities ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          ) : activities.length === 0 ? (
            <p className="text-aetherius-muted">No activities found for the selected filters.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity._id} className="rounded-xl border border-aetherius-line bg-white p-4">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <h3 className="font-semibold text-aetherius-heading">{activity.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-aetherius-field text-aetherius-muted">{activity.type}</span>
                  </div>
                  <p className="text-sm text-aetherius-muted mt-2">{activity.description || 'No description provided.'}</p>
                  <div className="text-sm text-aetherius-muted mt-2">
                    Cost: ${activity.cost} {activity.duration ? `- Duration: ${activity.duration} min` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

