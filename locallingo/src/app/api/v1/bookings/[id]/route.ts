import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { getBooking } from "@/server/services/bookings";

export const GET = api<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  const { booking } = await getBooking(await requireUser(), (await params).id);
  return booking;
});
