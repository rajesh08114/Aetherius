'use client';

import { Stop } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPin, Calendar, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { WeatherWidget } from '@/components/weather/WeatherWidget';

interface StopCardProps {
  stop: Stop;
  onRemove: (id: string) => void;
}

export function StopCard({ stop, onRemove }: StopCardProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card rounded-xl border transition-all relative overflow-hidden group ${
        isDragging ? 'border-amber-500 shadow-amber-500/20 shadow-xl opacity-80' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-600" />
      
      <div className="flex items-center p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-600 hover:text-slate-300 mr-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-500 flex items-center justify-center text-xs font-bold mr-3 border border-amber-500/30">
                {stop.order}
              </span>
              <h3 className="font-syne font-bold text-lg text-slate-100">{stop.cityName}</h3>
            </div>
            <button 
              onClick={() => onRemove(stop._id)}
              className="text-xs text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Remove
            </button>
          </div>
          
          <div className="flex items-center text-sm text-slate-400 pl-9">
            <MapPin className="w-3 h-3 mr-1" /> {stop.country}
            <span className="mx-2">•</span>
            <Calendar className="w-3 h-3 mr-1" /> {stop.nights || 2} nights
          </div>
        </div>

        {/* Expand Toggle */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg ml-4 text-slate-400 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 pl-16">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-slate-300">Activities</h4>
            <button className="text-xs flex items-center text-amber-500 hover:text-amber-400">
              <Plus className="w-3 h-3 mr-1" /> Add
            </button>
          </div>
          
          {stop.coordinates && (
            <div className="mb-4 pt-2 border-t border-slate-800/50">
              <h4 className="text-xs text-slate-500 uppercase font-medium mb-2">Weather Forecast</h4>
              <WeatherWidget lat={stop.coordinates.lat} lon={stop.coordinates.lng} />
            </div>
          )}

          {Array.isArray(stop.activities) && stop.activities.length > 0 ? (
            <div className="space-y-2">
              {/* Render activities here */}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic py-2 border border-dashed border-slate-700 rounded-lg text-center">
              No activities planned yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
