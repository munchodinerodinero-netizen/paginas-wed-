import { api } from "@/server/api";
import { notFound } from "@/server/errors";
import { getLocale } from "@/i18n/server";
import { getGuideBySlug, getGuideReviews, publicGuide } from "@/server/services/guides";

export const GET = api<{ params: Promise<{ slug: string }> }>(async (_req, { params }) => {
  const { slug } = await params;
  const g = await getGuideBySlug(slug);
  if (!g || g.status !== "APPROVED") throw notFound();
  const reviews = await getGuideReviews(g.userId);
  return {
    guide: publicGuide(g, await getLocale()),
    reviews: reviews.map((r) => ({ author: r.author.name.split(" ")[0], rating: r.rating, comment: r.comment, createdAt: r.createdAt })),
  };
});
