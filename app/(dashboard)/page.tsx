'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { TripCard } from '@/components/trips/TripCard';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Plus, Globe, Navigation, Wallet, Clock, Activity, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useTrips } from '@/hooks/useTrips';
import { SkeletonCard } from '@/components/shared/SkeletonCard';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { data: trips, isLoading } = useTrips();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-syne font-bold text-slate-100">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Traveler'} 👋
            </h1>
            <p className="text-slate-400 mt-1">
              You have {isLoading ? '...' : trips?.length || 0} trips planned
            </p>
          </div>
          <Link href="/trips/new">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-medium text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all border border-amber-400/50 group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Plan New Trip
            </motion.button>
          </Link>
        </div>

        {/* STATS ROW */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Trips', value: trips?.length || 0, icon: Globe, color: 'text-blue-400' },
            { label: 'Countries Visited', value: user?.countriesVisited?.length || 0, icon: MapPin, color: 'text-green-400' },
            { label: 'Activities Planned', value: 0, icon: Activity, color: 'text-purple-400' },
            { label: 'Total Budget', value: '$0', icon: Wallet, color: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-slate-800/30 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              <stat.icon className={`w-6 h-6 mb-3 ${stat.color}`} />
              <div className="text-2xl font-syne font-bold text-slate-100 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* UPCOMING TRIP - placeholder for now */}
        {trips && trips.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6 border-l-4 border-l-amber-500 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <Clock className="w-5 h-5" />
              <h2 className="font-medium font-syne">Up Next</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
              <div>
                <h3 className="text-2xl font-syne font-bold text-slate-100 mb-1">{trips[0].name}</h3>
                <p className="text-slate-400">Starting in 14 days • {Array.isArray(trips[0].stops) ? trips[0].stops.length : 0} destinations</p>
              </div>
              <Link href={`/trips/${trips[0]._id}/builder`}>
                <button className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                  View Itinerary
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* RECENT TRIPS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-syne font-bold text-slate-100 flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-amber-500" />
              Recent Trips
            </h2>
            <Link href="/trips" className="text-sm text-amber-500 hover:text-amber-400 font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : trips && trips.length > 0 ? (
              trips.slice(0, 3).map((trip) => (
                <TripCard key={trip._id} trip={trip} />
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 text-center py-12 glass-card rounded-2xl border-dashed">
                <p className="text-slate-400 mb-4">No trips planned yet.</p>
                <Link href="/trips/new">
                  <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium text-amber-500 border border-slate-700 hover:border-amber-500/50 transition-colors">
                    Start your first journey
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
