import { z } from "zod";
import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { notFound } from "@/server/errors";
import { acceptBooking, cancelBooking, completeBooking, payBooking, rejectBooking } from "@/server/services/bookings";

const reasonSchema = z.object({ reason: z.string().max(500).optional() }).catch({});

export const POST = api<{ params: Promise<{ id: string; action: string }> }>(async (req, { params }) => {
  const { id, action } = await params;
  const user = await requireUser();
  const body = reasonSchema.parse(await req.json().catch(() => ({})));
  switch (action) {
    case "pay":
      return payBooking(user, id);
    case "accept":
      return acceptBooking(user, id);
    case "reject":
      return rejectBooking(user, id, body.reason);
    case "cancel":
      return cancelBooking(user, id, body.reason);
    case "complete":
      return completeBooking(user, id);
    default:
      throw notFound();
  }
});
