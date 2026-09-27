import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { submitForVerification } from "@/server/services/guide-profile";

export const POST = api(async () => {
  const user = await requireUser("GUIDE");
  const g = await submitForVerification(user);
  return { status: g.status };
});
