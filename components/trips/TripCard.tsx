import { Trip } from '@/types';
import { motion } from 'framer-motion';
import { Calendar, MapPin, MoreVertical, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ongoing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formattedDate = trip.startDate
    ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No date set';

  const stopsCount = Array.isArray(trip.stops) ? trip.stops.length : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group border border-aetherius-line hover:border-[#d3c8ad] transition-all"
    >
      <div className="relative h-48 w-full bg-[#20304a]">
        {trip.coverPhoto ? (
          <Image src={trip.coverPhoto} alt={trip.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#20304a]">
            <MapPin className="w-10 h-10 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusColor(trip.status)}`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-syne font-bold text-lg text-aetherius-heading line-clamp-2 leading-tight flex-1 pr-2">{trip.name}</h3>
          <button type="button" className="text-aetherius-muted hover:text-aetherius-heading transition-colors p-1 -mr-1 rounded-md hover:bg-aetherius-field">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center text-aetherius-muted text-sm mb-4">
          <Calendar className="w-4 h-4 mr-1.5" />
          <span>{formattedDate}</span>
          <span className="mx-2">-</span>
          <span>{stopsCount} {stopsCount === 1 ? 'stop' : 'stops'}</span>
        </div>

        {trip.totalBudget && (
          <div className="mt-auto pt-4 border-t border-aetherius-line">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-xs text-aetherius-muted">Budget Progress</span>
              <span className="text-xs font-medium text-aetherius-heading">0 / {trip.currency} {trip.totalBudget}</span>
            </div>
            <div className="w-full h-1.5 bg-aetherius-line rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-0 rounded-full" />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-aetherius-field/80 border-t border-aetherius-line flex justify-between items-center opacity-100">
        <Link href={`/trips/${trip._id}/builder`} className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors">
          Open Builder
        </Link>
        <div className="flex items-center gap-3">
          <button type="button" className="text-aetherius-muted hover:text-aetherius-heading" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
          <button type="button" className="text-aetherius-muted hover:text-red-400" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
