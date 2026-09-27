import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
import { seoCombinations } from "@/server/services/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { paths, guides } = await seoCombinations();
  const base = brand.domain;
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ser-guia`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/ayuda`, changeFrequency: "monthly", priority: 0.4 },
    ...paths.map((p) => ({ url: `${base}${p}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...guides.map((g) => ({ url: `${base}/guia/${g.slug}`, lastModified: g.updatedAt, priority: 0.7 })),
  ];
}
