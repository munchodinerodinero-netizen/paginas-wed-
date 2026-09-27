import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { setAvailability, availabilitySchema } from "@/server/services/guide-profile";

export const PUT = api(async (req) => {
  const user = await requireUser("GUIDE");
  await setAvailability(user, await parseBody(req, availabilitySchema));
  return { ok: true };
});
