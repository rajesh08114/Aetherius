'use client';

import { useCarbon } from '@/hooks/useCarbon';
import { Leaf } from 'lucide-react';

export function CarbonBadge({ tripId }: { tripId: string }) {
  const { data, isLoading } = useCarbon(tripId);

  if (isLoading || !data) return null;

  const gradeColors: Record<string, string> = {
    'A': 'text-green-400 bg-green-400/10 border-green-400/20',
    'B': 'text-lime-400 bg-lime-400/10 border-lime-400/20',
    'C': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'D': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'F': 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className={`flex items-center px-3 py-1.5 rounded-lg border ${gradeColors[data.grade] || gradeColors['C']}`}>
      <Leaf className="w-4 h-4 mr-2" />
      <div className="flex flex-col">
        <span className="text-xs font-bold leading-none">{data.totalCarbon} kg CO₂</span>
        <span className="text-[10px] opacity-80 leading-none mt-0.5">Grade {data.grade}</span>
      </div>
    </div>
  );
}
