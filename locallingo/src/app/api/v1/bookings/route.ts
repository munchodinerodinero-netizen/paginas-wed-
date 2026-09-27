import { db } from "@/lib/db";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { createBooking, listGuideBookings, listTouristBookings } from "@/server/services/bookings";
import { bookingSchema } from "./schema";

export const GET = api(async () => {
  const user = await requireUser();
  if (user.role === "GUIDE") {
    const guide = await db.guideProfile.findUnique({ where: { userId: user.id } });
    return guide ? listGuideBookings(guide.id) : [];
  }
  return listTouristBookings(user.id);
});

export const POST = api(async (req) => {
  const user = await requireUser("TOURIST");
  const booking = await createBooking(user, await parseBody(req, bookingSchema));
  return { id: booking.id, code: booking.code };
});
