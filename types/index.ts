export type TripStatus = 'planning' | 'ongoing' | 'completed';
export type TripVisibility = 'private' | 'public' | 'link-only';
export type ActivityType = 'sightseeing' | 'food' | 'adventure' | 'culture' | 'shopping' | 'nightlife';
export type TransportMode = 'flight' | 'train' | 'bus' | 'drive' | 'ferry';
export type MoodPreference = 'adventurous' | 'romantic' | 'family' | 'budget' | 'luxury' | 'spiritual';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  languagePreference: string;
  savedDestinations: string[]; // CityIds
  moodPreferences: MoodPreference[];
  travelPersonality?: string;
  carbonScore: number;
  totalKmTraveled: number;
  countriesVisited: string[];
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trip {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  startDate?: Date;
  endDate?: Date;
  totalBudget?: number;
  currency: string;
  visibility: TripVisibility;
  shareToken?: string;
  status: TripStatus;
  stops: string[] | Stop[];
  collaborators: string[] | User[];
  tags: string[];
  aiHealthScore?: number;
  carbonKg: number;
  likesCount: number;
  viewCount: number;
  forkCount: number;
  forkedFrom?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stop {
  _id: string;
  tripId: string;
  cityId?: string;
  cityName: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  arrivalDate?: Date;
  departureDate?: Date;
  nights?: number;
  order: number;
  activities: string[] | Activity[];
  accommodation?: {
    name: string;
    cost: number;
    type: string;
  };
  transportTo?: {
    mode: TransportMode;
    cost: number;
    duration: number;
    distanceKm: number;
  };
  estimatedDailyCost?: number;
  notes?: string;
  weatherCache?: {
    temp: number;
    condition: string;
    rainProbability: number;
    fetchedAt: Date;
  };
  carbonKg: number;
}

export interface Activity {
  _id: string;
  stopId: string;
  tripId: string;
  name: string;
  type: ActivityType;
  description?: string;
  cost: number;
  duration?: number;
  scheduledTime?: Date;
  images: string[];
  location?: { lat: number; lng: number; address: string };
  status: 'planned' | 'booked' | 'done' | 'skipped';
  rating?: number;
}

export interface City {
  _id: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  coordinates: { lat: number; lng: number };
  costIndex: number;
  popularity: number;
  avgDailyCost: {
    budget: number;
    mid: number;
    luxury: number;
  };
  timezone: string;
  currency: string;
  description?: string;
  images: string[];
  tags: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'clothing' | 'documents' | 'electronics' | 'toiletries' | 'misc';
  packed: boolean;
  quantity: number;
  addedByAI: boolean;
}

export interface Checklist {
  _id: string;
  tripId: string;
  userId: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  _id: string;
  tripId: string;
  stopId?: string;
  userId: string;
  title: string;
  content: string;
  date: Date;
  pinned: boolean;
}

export interface Follow {
  _id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface TripLike {
  _id: string;
  userId: string;
  tripId: string;
  createdAt: Date;
}

export interface TripComment {
  _id: string;
  tripId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: Date;
}

export interface WeatherData {
  temp: number;
  condition: string;
  rainProbability: number;
  fetchedAt: Date;
}

export interface BudgetBreakdown {
  totalEstimated: number;
  breakdown: {
    transport: number;
    accommodation: number;
    activities: number;
    meals: number;
  };
  byDay: { date: Date; cost: number }[];
  overBudgetDays: { date: Date; cost: number }[];
  percentUsed: number;
  currency: string;
  budgetLimit: number;
}

export interface AIContext {
  tripContext?: string;
  userContext?: string;
}

export interface AIRecommendation {
  cityName: string;
  country: string;
  matchScore: number;
  whyItMatches: string;
  bestFor: string;
  estimatedDailyBudget: number;
  bestMonth: string;
  imageQuery: string;
}
