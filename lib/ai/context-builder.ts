import { Trip, User, Stop } from '@/types';

export function buildTripContext(trip: Trip, user: User): string {
  const stopsText = Array.isArray(trip.stops) 
    ? trip.stops.map((s: any, i) => `${i+1}. ${s.cityName}, ${s.country} (${s.nights || 2} nights)`).join(' -> ')
    : '';
    
  return `
Trip Name: ${trip.name}
Destinations: ${stopsText}
Start Date: ${trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'TBD'}
End Date: ${trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'TBD'}
Total Budget: ${trip.totalBudget ? `${trip.totalBudget} ${trip.currency}` : 'Flexible'}
User Language: ${user.languagePreference}
`;
}

export function buildUserContext(user: User): string {
  return `
Travel Personality: ${user.travelPersonality || 'Explorer'}
Mood Preferences: ${user.moodPreferences?.join(', ') || 'Any'}
Countries Visited: ${user.countriesVisited?.length || 0}
Total km Traveled: ${user.totalKmTraveled || 0}
`;
}
