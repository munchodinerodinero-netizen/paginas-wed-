import { z } from "zod";
import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { AppError } from "@/server/errors";
import { rateLimit } from "@/server/rate-limit";
import { sendMessage } from "@/server/services/social";

export const POST = api<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const user = await requireUser();
  if (!rateLimit(`msg:${user.id}`, 30, 60_000)) throw new AppError(429, "RATE_LIMITED");
  const { body } = await parseBody(req, z.object({ body: z.string().min(1).max(2000) }));
  return sendMessage(user, (await params).id, body);
});
