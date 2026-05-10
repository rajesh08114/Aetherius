'use client';

import { useWeather } from '@/hooks/useWeather';
import { Cloud, CloudRain, Sun, Loader2 } from 'lucide-react';

interface WeatherWidgetProps {
  lat: number;
  lon: number;
  startDate?: string;
  endDate?: string;
}

export function WeatherWidget({ lat, lon, startDate, endDate }: WeatherWidgetProps) {
  const { data, isLoading } = useWeather(lat, lon, startDate, endDate);

  if (isLoading) return <div className="flex items-center text-slate-500 text-sm"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching weather...</div>;
  if (!data || data.length === 0) return null;

  // Just show first 3 days
  const days = data.slice(0, 3);

  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="w-5 h-5 text-amber-400" />;
    if (code <= 48) return <Cloud className="w-5 h-5 text-slate-400" />;
    return <CloudRain className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="flex gap-4">
      {days.map((day: any, i: number) => (
        <div key={i} className="flex flex-col items-center bg-slate-900/50 rounded-lg p-2 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <div className="my-1">{getWeatherIcon(day.weatherCode)}</div>
          <span className="text-xs font-bold text-slate-200">{Math.round(day.maxTemp)}°</span>
        </div>
      ))}
    </div>
  );
}
