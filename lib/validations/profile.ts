import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  languagePreference: z.string().min(2).max(20).optional(),
  moodPreferences: z.array(z.string().min(2).max(40)).max(10).optional(),
  countriesVisited: z.array(z.string().min(2).max(60)).max(100).optional(),
});

