import Link from "next/link";
import { brand } from "@/config/brand";
import type { GuideCard } from "@/server/services/guides";
import { GuideResults } from "./GuideResults";

export function SeoLanding({ title, description, guides, exploreHref, crumbs, ctaLabel }: {
  title: string; description: string; guides: GuideCard[]; exploreHref: string; crumbs: { name: string; href: string }[]; ctaLabel: string;
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${brand.domain}${c.href}` })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title,
      itemListElement: guides.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: `${brand.domain}/guia/${g.slug}`, name: g.displayName })),
    },
  ];
  return (
    <div className="container" style={{ padding: "24px 16px 64px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="small muted" aria-label="breadcrumb">
        {crumbs.map((c, i) => <span key={c.href}>{i > 0 && " › "}<Link href={c.href}>{c.name}</Link></span>)}
      </nav>
      <h1 style={{ marginTop: 8 }}>{title}</h1>
      <p className="muted">{description}</p>
      <GuideResults guides={guides} />
      <Link href={exploreHref} className="btn btn-primary" style={{ marginTop: 20 }}>{ctaLabel}</Link>
    </div>
  );
}
