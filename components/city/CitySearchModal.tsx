'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin } from 'lucide-react';
import { City } from '@/types';

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
}

export function CitySearchModal({ isOpen, onClose, onSelect }: CitySearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/cities?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch cities');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCities, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // If no API, mock some data for now
  const mockSelect = (name: string, country: string, lat: number, lng: number) => {
    onSelect({
      _id: Math.random().toString(),
      name,
      country,
      countryCode: '',
      region: '',
      coordinates: { lat, lng },
      costIndex: 3,
      popularity: 100,
      avgDailyCost: { budget: 50, mid: 100, luxury: 200 },
      timezone: '',
      currency: 'USD',
      images: [],
      tags: []
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden relative"
          >
            {/* Header / Search input */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-amber-500" />
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a city..."
                className="flex-1 bg-transparent border-none text-lg text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading...</div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((city) => (
                    <button
                      key={city._id}
                      onClick={() => { onSelect(city); onClose(); }}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mr-4 group-hover:bg-amber-500/20 transition-colors">
                          <MapPin className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-slate-200 font-medium">{city.name}</h4>
                          <p className="text-xs text-slate-500">{city.country}</p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Add to trip
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.length > 1 ? (
                <div className="p-8 text-center text-slate-400">No cities found.</div>
              ) : (
                <div className="p-8 space-y-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Popular Destinations</p>
                  <button onClick={() => mockSelect('Tokyo', 'Japan', 35.6762, 139.6503)} className="w-full text-left p-4 rounded-xl hover:bg-slate-800/50 text-slate-300">Tokyo, Japan</button>
                  <button onClick={() => mockSelect('Paris', 'France', 48.8566, 2.3522)} className="w-full text-left p-4 rounded-xl hover:bg-slate-800/50 text-slate-300">Paris, France</button>
                  <button onClick={() => mockSelect('New York', 'USA', 40.7128, -74.0060)} className="w-full text-left p-4 rounded-xl hover:bg-slate-800/50 text-slate-300">New York, USA</button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
