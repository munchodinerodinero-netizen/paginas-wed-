import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { quoteBooking } from "@/server/services/bookings";

const schema = z.object({ serviceId: z.string(), durationMin: z.number().int().min(30).max(24 * 60).optional() });

export const POST = api(async (req) => {
  const { breakdown, durationMin } = await quoteBooking(await parseBody(req, schema));
  return { ...breakdown, durationMin };
});
