'use client';

import { useState } from 'react';
import { useAIMoodMatch } from '@/hooks/useAI';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, MapPin } from 'lucide-react';

const MOODS = [
  { id: 'relaxing', emoji: '🌴', label: 'Relaxing' },
  { id: 'adventure', emoji: '🏔️', label: 'Adventure' },
  { id: 'culture', emoji: '🏛️', label: 'Culture & History' },
  { id: 'foodie', emoji: '🍜', label: 'Foodie' },
  { id: 'party', emoji: 's', label: 'Nightlife' },
  { id: 'romantic', emoji: '❤️', label: 'Romantic' },
];

export function MoodPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  const { mutate: getRecommendations, data: recommendations, isPending } = useAIMoodMatch();

  const toggleMood = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id].slice(0, 3)
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-syne font-bold text-slate-100 mb-2">How do you want to feel?</h3>
        <p className="text-slate-400">Select up to 3 moods to get AI-powered destination matches.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {MOODS.map(mood => (
          <button
            key={mood.id}
            onClick={() => toggleMood(mood.id)}
            className={`px-5 py-3 rounded-xl border transition-all flex items-center gap-2 ${
              selected.includes(mood.id)
                ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <span className="text-xl">{mood.emoji}</span>
            <span className="font-medium">{mood.label}</span>
          </button>
        ))}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => getRecommendations(selected)}
          disabled={selected.length === 0 || isPending}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-bold text-slate-900 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 transition-all flex items-center mx-auto"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
          Generate Matches
        </button>
      </div>

      {recommendations?.recommendations && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {recommendations.recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-800 flex gap-4">
              <div className="w-20 h-20 bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                <MapPin className="text-amber-500 w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-syne font-bold text-lg text-slate-100">{rec.cityName}, {rec.country}</h4>
                  <span className="text-amber-500 font-bold">{rec.matchScore}%</span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{rec.whyItMatches}</p>
                <div className="flex gap-2">
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">~${rec.estimatedDailyBudget}/day</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Best in {rec.bestMonth}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
