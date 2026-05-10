'use client';

import { useState } from 'react';
import { useCommunityFeed, useLikeTrip } from '@/hooks/useCommunity';
import { PageTransition } from '@/components/shared/PageTransition';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { Heart, MessageCircle, Share2, Globe, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function CommunityPage() {
  const [sort, setSort] = useState('recent');
  const { data: feed, isLoading } = useCommunityFeed(sort);
  const { mutate: likeTrip } = useLikeTrip();

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-syne font-bold text-slate-100 flex items-center">
              <Globe className="w-8 h-8 mr-3 text-amber-500" />
              Community Inspiration
            </h1>
            <p className="text-slate-400 mt-1">Discover public itineraries from travelers worldwide</p>
          </div>
          
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-fit">
            <button 
              onClick={() => setSort('recent')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sort === 'recent' ? 'bg-slate-700 text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Clock className="w-4 h-4 mr-2" /> Recent
            </button>
            <button 
              onClick={() => setSort('popular')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sort === 'popular' ? 'bg-slate-700 text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <TrendingUp className="w-4 h-4 mr-2" /> Popular
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed?.map((trip: any) => (
              <motion.div 
                key={trip._id}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800"
              >
                <div className="h-48 relative bg-slate-800">
                  {trip.coverPhoto ? (
                    <Image src={trip.coverPhoto} alt={trip.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Globe className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  
                  {/* User Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center border border-slate-700/50">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-[10px] font-bold mr-2">
                      {trip.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-medium text-slate-200">{trip.userId?.name || 'Traveler'}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-syne font-bold text-lg text-slate-100 mb-2 line-clamp-2">{trip.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                    {trip.description || `${trip.stops?.length || 0} destinations included in this itinerary.`}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => likeTrip(trip._id)}
                        className={`flex items-center text-sm transition-colors ${trip.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                      >
                        <Heart className={`w-4 h-4 mr-1.5 ${trip.isLiked ? 'fill-current' : ''}`} />
                        {trip.likesCount || 0}
                      </button>
                      <button className="flex items-center text-sm text-slate-400 hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        {trip.commentsCount || 0}
                      </button>
                    </div>
                    <Link href={`/share/${trip.shareToken}`} className="text-amber-500 hover:text-amber-400 text-sm font-medium">
                      View Plan
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
