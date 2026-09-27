import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("help.title") };
}

export default async function HelpPage() {
  const { t } = await getI18n();
  const qs = [1, 2, 3];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qs.map((n) => ({ "@type": "Question", name: t(`help.q${n}`), acceptedAnswer: { "@type": "Answer", text: t(`help.a${n}`) } })),
  };
  return (
    <div className="container" style={{ maxWidth: 760, padding: "32px 16px 64px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <h1>{t("help.title")}</h1>
      <div className="stack">
        {qs.map((n) => (
          <details key={n} className="card" open={n === 1}>
            <summary><strong>{t(`help.q${n}`)}</strong></summary>
            <p style={{ marginTop: 8 }}>{t(`help.a${n}`)}</p>
          </details>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 24 }}>{t("help.contact", { email: brand.supportEmail })}</p>
    </div>
  );
}
