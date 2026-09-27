import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { getI18n } from "@/i18n/server";

const DOCS: Record<string, string> = { privacidad: "privacy", terminos: "terms", cancelacion: "cancellation" };
type Props = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = DOCS[(await params).doc];
  if (!key) return {};
  const { t } = await getI18n();
  return { title: t(`legal.${key}.title`) };
}

export default async function LegalPage({ params }: Props) {
  const key = DOCS[(await params).doc];
  if (!key) notFound();
  const { t } = await getI18n();
  return (
    <div className="container" style={{ maxWidth: 760, padding: "32px 16px 64px" }}>
      <h1>{t(`legal.${key}.title`)}</h1>
      <p>{t(`legal.${key}.body`, { brand: brand.name, email: brand.supportEmail })}</p>
    </div>
  );
}
