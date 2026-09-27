import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { getStats } from "@/server/services/admin";

export const GET = api(async () => {
  await requireUser("ADMIN");
  return getStats();
});
