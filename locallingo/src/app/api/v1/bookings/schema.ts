import { z } from "zod";

export const bookingSchema = z.object({
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  durationMin: z.number().int().optional(),
  people: z.number().int().min(1).max(50),
  meetingPoint: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});
