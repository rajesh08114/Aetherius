'use client';

import { useMemo, useState } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { useTrip } from '@/hooks/useTrip';
import { CalendarDays, List, Loader2, MapPin } from 'lucide-react';

export default function ItineraryViewPage({ params }: { params: { id: string } }) {
  const { data: trip, isLoading } = useTrip(params.id);
  const [mode, setMode] = useState<'list' | 'calendar'>('list');

  const stops = useMemo(() => {
    if (!trip || !Array.isArray(trip.stops)) return [];
    return [...trip.stops].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }, [trip]);

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-syne font-bold text-aetherius-heading">Itinerary View</h1>
            <p className="text-aetherius-muted mt-1">Review your full plan grouped by stops with timeline context.</p>
          </div>
          <div className="inline-flex border border-aetherius-line rounded-lg p-1 bg-white">
            <button
              type="button"
              onClick={() => setMode('list')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${
                mode === 'list' ? 'bg-aetherius-nav text-white' : 'text-aetherius-muted'
              }`}
            >
              <List className="w-4 h-4 mr-1.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setMode('calendar')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${
                mode === 'calendar' ? 'bg-aetherius-nav text-white' : 'text-aetherius-muted'
              }`}
            >
              <CalendarDays className="w-4 h-4 mr-1.5" />
              Timeline
            </button>
          </div>
        </div>

        {stops.length === 0 ? (
          <div className="glass-card border border-aetherius-line rounded-2xl p-10 text-center text-aetherius-muted">
            No itinerary stops yet. Add stops in the builder screen.
          </div>
        ) : mode === 'list' ? (
          <div className="space-y-4">
            {stops.map((stop: any, index: number) => (
              <div key={stop._id || index} className="glass-card border border-aetherius-line rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-syne font-bold text-aetherius-heading flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    {stop.cityName}, {stop.country}
                  </h2>
                  <span className="text-xs text-aetherius-muted">Stop #{stop.order || index + 1}</span>
                </div>
                <p className="text-sm text-aetherius-muted mt-1">
                  {stop.arrivalDate ? new Date(stop.arrivalDate).toLocaleDateString() : 'Date not set'} to{' '}
                  {stop.departureDate ? new Date(stop.departureDate).toLocaleDateString() : 'Date not set'}
                </p>
                <div className="mt-4 text-sm text-aetherius-muted">
                  Activities: {Array.isArray(stop.activities) ? stop.activities.length : 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card border border-aetherius-line rounded-2xl p-6">
            <div className="relative pl-6 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px before:bg-aetherius-line">
              {stops.map((stop: any, index: number) => (
                <div key={stop._id || index} className="relative mb-8 last:mb-0">
                  <span className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-amber-500" />
                  <h3 className="font-syne font-semibold text-aetherius-heading">{stop.cityName}, {stop.country}</h3>
                  <p className="text-sm text-aetherius-muted mt-1">
                    {stop.arrivalDate ? new Date(stop.arrivalDate).toLocaleDateString() : 'Date not set'} to{' '}
                    {stop.departureDate ? new Date(stop.departureDate).toLocaleDateString() : 'Date not set'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

