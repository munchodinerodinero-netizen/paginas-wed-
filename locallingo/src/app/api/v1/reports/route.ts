import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { AppError } from "@/server/errors";
import { rateLimit } from "@/server/rate-limit";
import { createReport, reportSchema } from "@/server/services/social";

export const POST = api(async (req) => {
  const user = await requireUser();
  if (!rateLimit(`report:${user.id}`, 10, 60 * 60_000)) throw new AppError(429, "RATE_LIMITED");
  const r = await createReport(user, await parseBody(req, reportSchema));
  return { id: r.id };
});
