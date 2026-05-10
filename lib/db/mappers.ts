import { ActivityType, TripStatus, TripVisibility, UserRole } from '@prisma/client';

export const toDbVisibility = (value?: string | null): TripVisibility | undefined => {
  if (!value) return undefined;
  if (value === 'link-only') return 'link_only';
  if (value === 'link_only') return 'link_only';
  if (value === 'private' || value === 'public') return value;
  return undefined;
};

export const fromDbVisibility = (value: TripVisibility): 'private' | 'public' | 'link-only' => {
  if (value === 'link_only') return 'link-only';
  return value;
};

type AnyObj = Record<string, any>;

export function mapUser(user: AnyObj | null) {
  if (!user) return null;
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || undefined,
    role: (user.role || 'user') as UserRole,
    languagePreference: user.languagePreference || 'en',
    savedDestinations: user.savedDestinations || [],
    moodPreferences: user.moodPreferences || [],
    travelPersonality: user.travelPersonality || undefined,
    carbonScore: user.carbonScore ?? 0,
    totalKmTraveled: user.totalKmTraveled ?? 0,
    countriesVisited: user.countriesVisited || [],
    followersCount: user.followersCount ?? 0,
    followingCount: user.followingCount ?? 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export function mapCity(city: AnyObj | null) {
  if (!city) return null;
  return {
    _id: city.id,
    name: city.name,
    country: city.country,
    countryCode: city.countryCode || '',
    region: city.region || '',
    coordinates: city.coordinates,
    costIndex: city.costIndex ?? 0,
    popularity: city.popularity ?? 0,
    avgDailyCost: city.avgDailyCost ?? { budget: 0, mid: 0, luxury: 0 },
    timezone: city.timezone || '',
    currency: city.currency || '',
    description: city.description || '',
    images: city.images || [],
    tags: city.tags || [],
    createdAt: city.createdAt,
    updatedAt: city.updatedAt
  };
}

export function mapActivity(activity: AnyObj | null) {
  if (!activity) return null;
  return {
    _id: activity.id,
    stopId: activity.stopId,
    tripId: activity.tripId,
    name: activity.name,
    type: activity.type as ActivityType,
    description: activity.description || undefined,
    cost: activity.cost,
    duration: activity.duration ?? undefined,
    scheduledTime: activity.scheduledTime ?? undefined,
    images: activity.images || [],
    location: activity.location || undefined,
    status: activity.status || 'planned',
    rating: activity.rating ?? undefined,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt
  };
}

export function mapStop(stop: AnyObj | null) {
  if (!stop) return null;
  const arrivalDate = stop.arrivalDate ? new Date(stop.arrivalDate) : null;
  const departureDate = stop.departureDate ? new Date(stop.departureDate) : null;
  let nights = 0;
  if (arrivalDate && departureDate) {
    nights = Math.ceil(Math.abs(departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    _id: stop.id,
    tripId: stop.tripId,
    cityId: stop.cityId || undefined,
    cityName: stop.cityName,
    country: stop.country,
    coordinates: stop.coordinates || undefined,
    arrivalDate: stop.arrivalDate || undefined,
    departureDate: stop.departureDate || undefined,
    nights,
    order: stop.order,
    activities: Array.isArray(stop.activities) ? stop.activities.map((a: AnyObj) => mapActivity(a)) : [],
    accommodation: stop.accommodation || undefined,
    transportTo: stop.transportTo || undefined,
    estimatedDailyCost: stop.estimatedDailyCost ?? undefined,
    notes: stop.notes || undefined,
    weatherCache: stop.weatherCache || undefined,
    carbonKg: stop.carbonKg ?? 0,
    createdAt: stop.createdAt,
    updatedAt: stop.updatedAt
  };
}

export function mapTrip(trip: AnyObj | null) {
  if (!trip) return null;
  return {
    _id: trip.id,
    userId: trip.userId,
    name: trip.name,
    description: trip.description || undefined,
    coverPhoto: trip.coverPhoto || undefined,
    startDate: trip.startDate || undefined,
    endDate: trip.endDate || undefined,
    totalBudget: trip.totalBudget ?? undefined,
    currency: trip.currency || 'USD',
    visibility: fromDbVisibility(trip.visibility as TripVisibility),
    shareToken: trip.shareToken || undefined,
    status: (trip.status || 'planning') as TripStatus,
    stops: Array.isArray(trip.stops) ? trip.stops.map((s: AnyObj) => mapStop(s)) : [],
    collaborators: trip.collaborators || [],
    tags: trip.tags || [],
    aiHealthScore: trip.aiHealthScore ?? undefined,
    carbonKg: trip.carbonKg ?? 0,
    likesCount: trip.likesCount ?? 0,
    viewCount: trip.viewCount ?? 0,
    forkCount: trip.forkCount ?? 0,
    forkedFrom: trip.forkedFromId || undefined,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt
  };
}

export function mapChecklist(checklist: AnyObj | null) {
  if (!checklist) return null;
  return {
    _id: checklist.id,
    tripId: checklist.tripId,
    userId: checklist.userId,
    items: checklist.items || [],
    createdAt: checklist.createdAt,
    updatedAt: checklist.updatedAt
  };
}

export function mapNote(note: AnyObj | null) {
  if (!note) return null;
  return {
    _id: note.id,
    tripId: note.tripId,
    stopId: note.stopId || undefined,
    userId: note.userId,
    title: note.title,
    content: note.content || '',
    date: note.date,
    pinned: note.pinned || false,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

export function mapTripComment(comment: AnyObj | null) {
  if (!comment) return null;
  return {
    _id: comment.id,
    tripId: comment.tripId,
    userId: comment.userId,
    content: comment.content,
    parentId: comment.parentId || undefined,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  };
}
