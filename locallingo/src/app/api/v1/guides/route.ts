import { api } from "@/server/api";
import { getLocale } from "@/i18n/server";
import { parseSearchParams, recordSearch } from "@/server/services/search-params";
import { searchGuides } from "@/server/services/guides";

export const GET = api(async (req) => {
  const filters = parseSearchParams(Object.fromEntries(new URL(req.url).searchParams));
  const results = await searchGuides(filters, await getLocale());
  await recordSearch(filters, results.length);
  return results;
});
