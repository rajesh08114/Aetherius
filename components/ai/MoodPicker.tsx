'use client';

import { useState } from 'react';
import { useAIMoodMatch } from '@/hooks/useAI';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, MapPin } from 'lucide-react';
import { AIRecommendation } from '@/types';

const MOODS = [
  { id: 'relaxing', emoji: 'Palm', label: 'Relaxing' },
  { id: 'adventure', emoji: 'Peak', label: 'Adventure' },
  { id: 'culture', emoji: 'Museum', label: 'Culture & History' },
  { id: 'foodie', emoji: 'Cuisine', label: 'Foodie' },
  { id: 'nightlife', emoji: 'Night', label: 'Nightlife' },
  { id: 'romantic', emoji: 'Romance', label: 'Romantic' }
];

export function MoodPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [hasRequested, setHasRequested] = useState(false);
  const { mutate: getRecommendations, data, isPending, error } = useAIMoodMatch();
  const recommendations = data?.recommendations || [];

  const toggleMood = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id].slice(0, 3)
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-syne font-bold text-aetherius-heading mb-2">How do you want to feel?</h3>
        <p className="text-aetherius-muted">Select up to 3 moods to get AI-powered destination matches.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => toggleMood(mood.id)}
            className={`px-5 py-3 rounded-xl border transition-all flex items-center gap-2 ${
              selected.includes(mood.id)
                ? 'bg-amber-500/20 border-amber-500 text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-white border-aetherius-line text-aetherius-muted hover:border-[#d3c8ad] hover:text-aetherius-heading'
            }`}
          >
            <span className="text-xs uppercase tracking-wide font-bold">{mood.emoji}</span>
            <span className="font-medium">{mood.label}</span>
          </button>
        ))}
      </div>

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={() => {
            setHasRequested(true);
            getRecommendations(selected);
          }}
          disabled={selected.length === 0 || isPending}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-bold text-slate-900 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 transition-all flex items-center mx-auto"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
          Generate Matches
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 text-center">
          Unable to fetch AI recommendations right now. Please try again.
        </div>
      )}

      {hasRequested && !isPending && !error && recommendations.length === 0 && (
        <div className="rounded-xl border border-aetherius-line bg-white p-4 text-sm text-aetherius-muted text-center">
          No recommendations found for this mood mix. Try a different combination.
        </div>
      )}

      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {recommendations.map((rec: AIRecommendation, idx: number) => (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-aetherius-line flex gap-4">
              <div className="w-20 h-20 bg-[#20304a] rounded-xl flex-shrink-0 flex items-center justify-center">
                <MapPin className="text-amber-500 w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-syne font-bold text-lg text-aetherius-heading">
                    {rec.cityName}, {rec.country}
                  </h4>
                  <span className="text-amber-500 font-bold">{rec.matchScore}%</span>
                </div>
                <p className="text-sm text-aetherius-muted mb-2">{rec.whyItMatches}</p>
                <div className="flex gap-2">
                  <span className="text-xs bg-aetherius-field px-2 py-1 rounded text-aetherius-heading">
                    ~${rec.estimatedDailyBudget}/day
                  </span>
                  <span className="text-xs bg-aetherius-field px-2 py-1 rounded text-aetherius-heading">
                    Best in {rec.bestMonth}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
