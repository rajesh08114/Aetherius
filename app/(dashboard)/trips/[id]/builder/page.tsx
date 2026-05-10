'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTripStore } from '@/store/tripStore';
import { useTrip, useReorderStops, useAddStop, useDeleteStop } from '@/hooks/useTrip';
import { PageTransition } from '@/components/shared/PageTransition';
import { StopCard } from '@/components/builder/StopCard';
import { CitySearchModal } from '@/components/city/CitySearchModal';
import { Plus, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { City } from '@/types';
import { TripHealthScore } from '@/components/ai/TripHealthScore';
import { CarbonBadge } from '@/components/trips/CarbonBadge';

// Dynamically import Map to prevent SSR issues with MapLibre
const TripMap = dynamic(() => import('@/components/maps/TripMap'), { ssr: false, loading: () => <div className="w-full h-full bg-slate-800 animate-pulse rounded-2xl" /> });

export default function BuilderPage({ params }: { params: { id: string } }) {
  const { data: trip, isLoading } = useTrip(params.id);
  const { optimisticStops, reorderStops, addStop, removeStop } = useTripStore();
  const reorderMutation = useReorderStops(params.id);
  const addStopMutation = useAddStop(params.id);
  const deleteStopMutation = useDeleteStop(params.id);

  const [cityModalOpen, setCityModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = optimisticStops.findIndex((s) => s._id === active.id);
      const newIndex = optimisticStops.findIndex((s) => s._id === over.id);
      const newStops = arrayMove(optimisticStops, oldIndex, newIndex);
      
      // Update store optimistically
      reorderStops(newStops);
      
      // Fire mutation
      reorderMutation.mutate(newStops.map((s, idx) => ({ id: s._id, order: idx + 1 })));
    }
  };

  const handleAddStop = async (city: City) => {
    const stopData = {
      cityName: city.name,
      country: city.country,
      cityId: city._id,
      coordinates: city.coordinates,
      order: optimisticStops.length + 1
    };

    // Optimistic UI update
    const optimisticStop = { ...stopData, _id: `temp-${Date.now()}`, tripId: params.id, activities: [], carbonKg: 0 };
    addStop(optimisticStop as any);

    try {
      await addStopMutation.mutateAsync(stopData as any);
    } catch (e) {
      // Revert optimistic update via invalidateQueries in hook
    }
  };

  const handleDeleteStop = (stopId: string) => {
    removeStop(stopId);
    if (!stopId.startsWith('temp-')) {
      deleteStopMutation.mutate(stopId);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        
        {/* LEFT PANEL: Stop List */}
        <div className="w-full lg:w-[60%] flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h2 className="text-2xl font-syne font-bold text-slate-100">{trip?.name}</h2>
                <TripHealthScore tripId={params.id} initialScore={trip?.aiHealthScore} />
                <CarbonBadge tripId={params.id} />
              </div>
              <p className="text-slate-400 text-sm">{optimisticStops.length} Destinations</p>
            </div>
            <button 
              onClick={() => setCityModalOpen(true)}
              className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-500 rounded-lg font-medium transition-colors border border-slate-700 hover:border-amber-500/50"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Stop
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-20">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={optimisticStops.map(s => s._id)} strategy={verticalListSortingStrategy}>
                {optimisticStops.map((stop) => (
                  <StopCard key={stop._id} stop={stop} onRemove={handleDeleteStop} />
                ))}
              </SortableContext>
            </DndContext>

            {optimisticStops.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-400">No stops added yet.</p>
                <button 
                  onClick={() => setCityModalOpen(true)}
                  className="mt-4 text-amber-500 font-medium hover:text-amber-400"
                >
                  Search for a city →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Map */}
        <div className="hidden lg:block w-[40%] h-full relative">
          <TripMap stops={optimisticStops} />
        </div>
      </div>

      <CitySearchModal 
        isOpen={cityModalOpen} 
        onClose={() => setCityModalOpen(false)} 
        onSelect={handleAddStop} 
      />
    </PageTransition>
  );
}
