import "server-only";
import { db } from "@/lib/db";
import { toMinor } from "@/lib/money";
import { getSessionUser } from "../auth";
import type { SearchFilters } from "./guides";

const SORTS = ["relevance", "price_asc", "price_desc", "rating", "popular", "new"] as const;

function num(v?: string) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Query string → filtros tipados (lo usan /explorar y GET /api/v1/guides). */
export function parseSearchParams(sp: Record<string, string | string[] | undefined>): SearchFilters {
  const s = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const price = (k: string) => {
    const v = s(k);
    return v && /^\d+(\.\d+)?$/.test(v) ? toMinor(v, "MXN") : undefined;
  };
  const date = s("date");
  const sort = s("sort");
  const modality = s("modality");
  const hours = num(s("duration"));
  return {
    city: s("city"),
    country: s("country"),
    language: s("language"),
    category: s("service"),
    minPrice: price("minPrice"),
    maxPrice: price("maxPrice"),
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    maxDurationMin: hours ? Math.round(hours * 60) : undefined,
    minRating: num(s("rating")),
    modality: modality === "IN_PERSON" || modality === "REMOTE" ? modality : undefined,
    sort: (SORTS as readonly string[]).includes(sort ?? "") ? (sort as SearchFilters["sort"]) : "relevance",
  };
}

export async function recordSearch(filters: SearchFilters, resultsCount: number) {
  const user = await getSessionUser();
  await db.searchEvent.create({ data: { userId: user?.id, filters: JSON.stringify(filters), resultsCount } });
}
