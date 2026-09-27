import { api } from "@/server/api";
import { getLocale } from "@/i18n/server";
import { getCatalog } from "@/server/services/catalog";

export const GET = api(async () => getCatalog(await getLocale()));
