'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { TripCard } from '@/components/trips/TripCard';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTrips } from '@/hooks/useTrips';
import { useState } from 'react';
import { Map as MapIcon, Plus, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MyTripsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('createdAt');

  const { data: trips, isLoading } = useTrips(statusFilter, sort);

  const tabs = [
    { id: 'all', label: 'All Trips' },
    { id: 'planning', label: 'Planning' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-syne font-bold text-aetherius-heading flex items-center">
              <MapIcon className="w-8 h-8 mr-3 text-amber-500" />
              My Trips
            </h1>
            <p className="text-aetherius-muted mt-1">Manage and organize your travel itineraries</p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/trips/new"
              className="inline-flex items-center px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Trip
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-2 rounded-xl border border-aetherius-line backdrop-blur-md">
          <div className="flex space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-aetherius-nav text-amber-400 shadow-sm border border-black/10'
                    : 'text-aetherius-muted hover:text-aetherius-heading hover:bg-aetherius-field border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center text-sm text-aetherius-muted bg-aetherius-field rounded-lg border border-aetherius-line px-3 py-2">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <select
                className="bg-transparent border-none outline-none text-aetherius-heading cursor-pointer appearance-none pr-4"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="createdAt">Newest First</option>
                <option value="startDate">Upcoming</option>
                <option value="budget">Highest Budget</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : trips && trips.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </motion.div>
        ) : (
          <div className="glass-card border-dashed py-20 mt-8 border border-aetherius-line">
            <EmptyState
              icon={<Globe className="w-12 h-12" />}
              title="No trips found"
              description={
                statusFilter === 'all'
                  ? "You haven't planned any trips yet. Start exploring!"
                  : `No trips with status '${statusFilter}'.`
              }
              action={
                <Link
                  href="/trips/new"
                  className="mt-4 inline-flex px-6 py-2.5 bg-aetherius-nav hover:bg-black rounded-lg text-sm font-medium text-white border border-black/10 transition-colors"
                >
                  Plan your first trip
                </Link>
              }
            />
          </div>
        )}
      </div>
    </PageTransition>
  );
}

const Globe = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
