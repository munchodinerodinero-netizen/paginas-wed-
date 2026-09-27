import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { AppError, badRequest } from "@/server/errors";
import { rateLimit } from "@/server/rate-limit";
import { saveUpload } from "@/server/services/storage";

export const POST = api(async (req) => {
  const user = await requireUser("GUIDE");
  if (!rateLimit(`upload:${user.id}`, 30, 60 * 60_000)) throw new AppError(429, "RATE_LIMITED");
  const form = await req.formData();
  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof File) || (kind !== "photo" && kind !== "document")) throw badRequest();
  try {
    return await saveUpload(kind, file);
  } catch (e) {
    throw badRequest(e instanceof Error ? e.message : "UPLOAD_FAILED");
  }
});
