import { z } from 'zod';

export const CreateTripSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  coverPhoto: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalBudget: z.number().optional(),
  currency: z.string().default('USD'),
  visibility: z.enum(['private', 'public', 'link-only']).default('private')
});

export const UpdateTripSchema = CreateTripSchema.partial();

export const CreateStopSchema = z.object({
  cityName: z.string(),
  country: z.string(),
  cityId: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  notes: z.string().optional()
});

export const UpdateStopSchema = CreateStopSchema.partial().extend({
  accommodation: z.object({
    name: z.string().optional(),
    cost: z.number().optional(),
    type: z.string().optional()
  }).optional(),
  transportTo: z.object({
    mode: z.enum(['flight', 'train', 'bus', 'drive', 'ferry']).optional(),
    cost: z.number().optional(),
    duration: z.number().optional(),
    distanceKm: z.number().optional()
  }).optional()
});

export const ReorderStopsSchema = z.object({
  stops: z.array(z.object({
    id: z.string(),
    order: z.number()
  }))
});

export const CreateActivitySchema = z.object({
  name: z.string(),
  type: z.enum(['sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nightlife']),
  description: z.string().optional(),
  cost: z.number(),
  duration: z.number().optional(),
  scheduledTime: z.string().optional()
});
