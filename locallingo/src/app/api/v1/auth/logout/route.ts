import { api } from "@/server/api";
import { clearSessionCookie } from "@/server/auth";

export const POST = api(async () => {
  await clearSessionCookie();
  return { ok: true };
});
