import { api } from "@/server/api";
import { requireUser } from "@/server/auth";
import { requestPayout } from "@/server/services/bookings";

export const POST = api(async () => requestPayout(await requireUser("GUIDE")));
