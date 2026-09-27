import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { setLanguages, languagesSchema } from "@/server/services/guide-profile";

export const PUT = api(async (req) => {
  const user = await requireUser("GUIDE");
  await setLanguages(user, await parseBody(req, languagesSchema));
  return { ok: true };
});
