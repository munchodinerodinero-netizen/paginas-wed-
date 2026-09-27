import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { setServices, servicesSchema } from "@/server/services/guide-profile";

export const PUT = api(async (req) => {
  const user = await requireUser("GUIDE");
  await setServices(user, await parseBody(req, servicesSchema));
  return { ok: true };
});
