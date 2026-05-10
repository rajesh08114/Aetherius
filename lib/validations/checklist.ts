import { z } from 'zod';

export const ChecklistItemSchema = z.object({
  label: z.string(),
  category: z.enum(['clothing', 'documents', 'electronics', 'toiletries', 'misc']),
  packed: z.boolean().optional(),
  quantity: z.number().optional()
});

export const UpdateChecklistSchema = z.object({
  items: z.array(ChecklistItemSchema)
});
