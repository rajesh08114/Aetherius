import { create } from 'zustand';
import { Trip, Stop } from '@/types';

interface TripStore {
  activeTrip: Trip | null;
  optimisticStops: Stop[];
  setActiveTrip: (trip: Trip) => void;
  reorderStops: (stops: Stop[]) => void;
  addStop: (stop: Stop) => void;
  removeStop: (stopId: string) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  activeTrip: null,
  optimisticStops: [],
  
  setActiveTrip: (trip) => set({ 
    activeTrip: trip, 
    optimisticStops: Array.isArray(trip.stops) ? trip.stops as Stop[] : [] 
  }),
  
  reorderStops: (stops) => set((state) => {
    // Update optimistic stops array and update order property sequentially
    const updatedStops = stops.map((s, idx) => ({ ...s, order: idx + 1 }));
    
    // In a full implementation, you'd trigger a debounced API call here
    // or just let the component handle it via useReorderStops hook
    return { optimisticStops: updatedStops };
  }),
  
  addStop: (stop) => set((state) => ({ 
    optimisticStops: [...state.optimisticStops, stop] 
  })),
  
  removeStop: (stopId) => set((state) => ({
    optimisticStops: state.optimisticStops.filter(s => s._id !== stopId)
  }))
}));
