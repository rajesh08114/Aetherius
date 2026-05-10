'use client';

import { Activity } from 'lucide-react';
import { useAIHealth } from '@/hooks/useAI';
import { useEffect } from 'react';

interface TripHealthScoreProps {
  tripId: string;
  initialScore?: number;
}

export function TripHealthScore({ tripId, initialScore }: TripHealthScoreProps) {
  const { mutate: getHealth, data, isPending } = useAIHealth();

  useEffect(() => {
    if (initialScore == null) {
      getHealth(tripId);
    }
  }, [getHealth, initialScore, tripId]);

  const score = data?.score ?? initialScore ?? 0;
  
  let color = 'text-slate-500 border-slate-500';
  if (score >= 80) color = 'text-green-500 border-green-500 bg-green-500/10';
  else if (score >= 60) color = 'text-amber-500 border-amber-500 bg-amber-500/10';
  else if (score > 0) color = 'text-red-500 border-red-500 bg-red-500/10';

  if (isPending) {
    return <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (!score) return null;

  return (
    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${color} group cursor-help`}>
      <span className="font-bold text-sm">{score}</span>
      
      {/* Tooltip */}
      {data && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="flex items-center gap-2 mb-2 text-amber-500">
            <Activity className="w-4 h-4" />
            <span className="font-medium text-sm">AI Health Analysis</span>
          </div>
          <p className="text-xs text-slate-300 mb-2">{data.overallFeedback}</p>
          {data.issues?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-red-400 font-bold uppercase">Issues</span>
              <ul className="text-xs text-slate-400 mt-1 space-y-1 list-disc pl-3">
                {data.issues.slice(0, 2).map((i: any, idx: number) => <li key={idx}>{i.description}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
