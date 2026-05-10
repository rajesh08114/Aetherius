'use client';

import { useState } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Plane } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateTrip } from '@/hooks/useTrips';
import { toast } from 'sonner';
import { CitySearchModal } from '@/components/city/CitySearchModal';
import { City, TripVisibility } from '@/types';
import { authFetch } from '@/lib/utils/authFetch';

export default function NewTripPage() {
  const router = useRouter();
  const createTrip = useCreateTrip();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverPhoto: '',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    currency: 'USD',
    visibility: 'private' as TripVisibility,
  });

  const [firstCity, setFirstCity] = useState<City | null>(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step === 1 && !formData.name) {
      toast.error('Please enter a trip name');
      return;
    }
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Trip
      const trip = await createTrip.mutateAsync(formData);

      // 2. If first city selected, add it as a stop
      if (firstCity && trip._id) {
        const stopData = {
          tripId: trip._id,
          cityName: firstCity.name,
          country: firstCity.country,
          cityId: firstCity._id,
          coordinates: firstCity.coordinates,
          order: 1
        };
        
        await authFetch(`/api/v1/trips/${trip._id}/stops`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stopData)
        });
      }

      toast.success('Trip created successfully! 🎉');
      router.push(`/trips/${trip._id}/builder`);
    } catch (error) {
      toast.error('Failed to create trip');
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto py-8">
        {/* STEP INDICATOR */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-syne transition-colors ${
                  step >= i ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {i}
                </div>
                {i < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-colors ${
                    step > i ? 'bg-amber-500' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[500px]">
          <AnimatePresence custom={direction} mode="wait">
            
            {/* STEP 1: BASICS */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-syne font-bold mb-2">Let&apos;s start your journey</h2>
                  <p className="text-slate-400">Give your trip a name and describe what you want to experience.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Trip Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
                    placeholder="e.g. Summer in Tokyo 2026"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none h-32"
                    placeholder="What's the vibe? Who are you going with?"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATES & BUDGET */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-syne font-bold mb-2">Dates & Details</h2>
                  <p className="text-slate-400">When are you going and what&apos;s your budget?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total Budget (Optional)</label>
                  <div className="flex gap-4">
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-24 bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                      <option value="JPY">JPY</option>
                    </select>
                    <input
                      type="number"
                      value={formData.totalBudget || ''}
                      onChange={(e) => setFormData({ ...formData, totalBudget: parseInt(e.target.value) || 0 })}
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g. 2500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Visibility</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {([
                      { id: 'private', label: 'Private', desc: 'Only you and collaborators' },
                      { id: 'link-only', label: 'Link Only', desc: 'Anyone with the link' },
                      { id: 'public', label: 'Public', desc: 'Visible on explore page' }
                    ] as const).map(vis => (
                      <div 
                        key={vis.id}
                        onClick={() => setFormData({ ...formData, visibility: vis.id })}
                        className={`cursor-pointer border rounded-xl p-4 transition-all ${
                          formData.visibility === vis.id 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                            : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-medium mb-1">{vis.label}</div>
                        <div className="text-xs opacity-70">{vis.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* STEP 3: FIRST STOP */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-8 flex flex-col h-full justify-center"
              >
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-syne font-bold mb-2">Where to first?</h2>
                  <p className="text-slate-400">Add your first destination to start building the itinerary.</p>
                </div>

                {!firstCity ? (
                  <div 
                    onClick={() => setCityModalOpen(true)}
                    className="w-full border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                      <Plane className="w-8 h-8 text-slate-400 group-hover:text-amber-500" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-300 group-hover:text-amber-500 transition-colors">Search Destination</h3>
                    <p className="text-slate-500 mt-2">Click to search for cities worldwide</p>
                  </div>
                ) : (
                  <div className="glass-card border-amber-500/30 p-6 rounded-2xl relative">
                    <button 
                      onClick={() => setFirstCity(null)}
                      className="absolute top-4 right-4 text-xs text-slate-400 hover:text-white"
                    >
                      Remove
                    </button>
                    <div className="text-sm text-amber-500 mb-1 font-medium tracking-wider uppercase">First Stop</div>
                    <h3 className="text-2xl font-syne font-bold text-white mb-1">{firstCity.name}</h3>
                    <p className="text-slate-400">{firstCity.country}</p>
                  </div>
                )}
                
                <div className="text-center">
                  <button 
                    onClick={handleSubmit}
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    Skip and add later
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* BOTTOM NAVIGATION */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-between">
            <button
              onClick={handleBack}
              className={`flex items-center px-5 py-2.5 rounded-xl font-medium transition-colors ${
                step === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-xl font-medium shadow-lg shadow-amber-500/20 transition-all"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Create Trip 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
      <CitySearchModal 
        isOpen={cityModalOpen} 
        onClose={() => setCityModalOpen(false)} 
        onSelect={(city) => {
          setFirstCity(city);
          setCityModalOpen(false);
        }} 
      />
    </PageTransition>
  );
}
