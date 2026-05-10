import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { Calendar, Users, Globe } from 'lucide-react';
import { ExportButton } from '@/components/trips/ExportButton';
import Image from 'next/image';
import { TripVisibility } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function PublicTripSharePage({ params }: { params: { token: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { shareToken: params.token },
    include: { user: { select: { name: true } } }
  });
  
  if (!trip) {
    notFound();
  }

  if (trip.visibility === 'private') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-syne font-bold text-slate-300 mb-2">Private Trip</h1>
        <p className="text-slate-500 text-center max-w-md">This trip has been marked as private by the creator and cannot be viewed via link.</p>
      </div>
    );
  }

  const stops = await prisma.stop.findMany({
    where: { tripId: trip.id },
    orderBy: { order: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <div className="relative h-64 md:h-96 w-full bg-slate-800">
        {trip.coverPhoto ? (
          <Image src={trip.coverPhoto} alt={trip.name} fill className="object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-amber-900/40" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-[#0f172a] to-transparent">
          <div className="max-w-4xl mx-auto flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-amber-500 mb-2 font-medium">
                <Globe className="w-4 h-4" />
                <span className="text-sm tracking-widest uppercase">Shared Itinerary</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-syne font-bold text-white mb-2">{trip.name}</h1>
              <p className="text-slate-300 max-w-2xl">{trip.description}</p>
            </div>
            <ExportButton tripName={trip.name} />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 md:p-12" id="printable-itinerary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center">
            <Calendar className="w-6 h-6 text-amber-500 mr-4" />
            <div>
              <div className="text-xs text-slate-500 uppercase">Duration</div>
              <div className="font-medium text-slate-200">{stops.length} Destinations</div>
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center">
            <Users className="w-6 h-6 text-amber-500 mr-4" />
            <div>
              <div className="text-xs text-slate-500 uppercase">Created By</div>
              <div className="font-medium text-slate-200">{trip.user?.name || 'Traveler'}</div>
            </div>
          </div>
          {trip.totalBudget && (
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center">
              <span className="text-xl text-amber-500 font-bold mr-4">{trip.currency}</span>
              <div>
                <div className="text-xs text-slate-500 uppercase">Budget</div>
                <div className="font-medium text-slate-200">{trip.totalBudget}</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:to-slate-800">
          {stops.map((stop, idx) => {
            const arrivalDate = stop.arrivalDate ? new Date(stop.arrivalDate) : null;
            const departureDate = stop.departureDate ? new Date(stop.departureDate) : null;
            const nights = arrivalDate && departureDate
              ? Math.ceil(Math.abs(departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#0f172a] bg-amber-500 text-slate-900 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  {idx + 1}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-card p-6 rounded-2xl">
                  <h3 className="font-syne font-bold text-xl text-amber-500 mb-1 flex items-center">
                    {stop.cityName}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">{stop.country} • {nights} Nights</p>
                  
                  {stop.notes && (
                    <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800 italic">
                      &ldquo;{stop.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
