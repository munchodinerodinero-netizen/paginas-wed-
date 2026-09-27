import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { getConversation } from "@/server/services/social";

export const GET = api<{ params: Promise<{ id: string }> }>(async (_req, { params }) => getConversation(await requireUser(), (await params).id));
