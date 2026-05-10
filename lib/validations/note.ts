import { z } from 'zod';

export const NoteSchema = z.object({
  title: z.string().max(200),
  content: z.string().max(10000).optional(),
  stopId: z.string().optional(),
  pinned: z.boolean().optional()
});
