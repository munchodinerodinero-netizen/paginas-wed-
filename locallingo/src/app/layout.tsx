import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { brand } from "@/config/brand";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/i18n/client";
import { getCurrency, getI18n } from "@/i18n/server";
import { getSessionUser } from "@/server/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    metadataBase: new URL(brand.domain),
    title: { default: `${brand.name} — ${t("footer.tagline")}`, template: `%s | ${brand.name}` },
    description: t("hero.subtitle"),
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: brand.colors.primary };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, t } = await getI18n();
  const currency = await getCurrency();
  const user = await getSessionUser();
  const c = brand.colors;
  const vars = `:root{--primary:${c.primary};--primary-dark:${c.primaryDark};--accent:${c.accent};--ink:${c.ink};--muted:${c.muted};--surface:${c.surface};--background:${c.background};--border:${c.border}}`;
  return (
    <html lang={locale}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: vars }} />
      </head>
      <body>
        <I18nProvider locale={locale} currency={currency}>
          <Header user={user} t={t} />
          <main>{children}</main>
          <Footer t={t} />
        </I18nProvider>
      </body>
    </html>
  );
}
