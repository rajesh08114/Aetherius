'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { MoodPicker } from '@/components/ai/MoodPicker';
import { Compass } from 'lucide-react';

export default function ExploreCitiesPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-syne font-bold text-aetherius-heading mb-4">Discover Your Next Adventure</h1>
          <p className="text-aetherius-muted max-w-xl mx-auto">
            Not sure where to go? Let Traveloop AI match you with the perfect destination based on your current mood.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-aetherius-line max-w-3xl mx-auto">
          <MoodPicker />
        </div>
      </div>
    </PageTransition>
  );
}
