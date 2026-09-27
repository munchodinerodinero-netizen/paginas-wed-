import { api, parseBody } from "@/server/api";
import { requireUser } from "@/server/auth";
import { loadOwnProfile, profileSchema, updateProfile } from "@/server/services/guide-profile";

// Perfil propio del guía (incluye datos privados: solo lo ve su dueño).
export const GET = api(async () => {
  const user = await requireUser("GUIDE");
  const g = await loadOwnProfile(user);
  return { ...g, hasIdDocument: !!g.idDocumentKey, hasLegalDocument: !!g.legalDocumentKey, idDocumentKey: undefined, legalDocumentKey: undefined };
});

export const PUT = api(async (req) => {
  const user = await requireUser("GUIDE");
  await updateProfile(user, await parseBody(req, profileSchema));
  return { ok: true };
});
