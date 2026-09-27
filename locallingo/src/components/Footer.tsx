import Link from "next/link";
import { brand } from "@/config/brand";
import type { TFunction } from "@/i18n/core";

export function Footer({ t }: { t: TFunction }) {
  return (
    <footer className="footer">
      <div className="container row between">
        <div>
          <strong>{brand.name}</strong> — <span className="muted">{t("footer.tagline")}</span>
          <div className="muted small">© {new Date().getFullYear()} {brand.name}. {t("footer.rights")}</div>
        </div>
        <div className="row">
          <Link href="/legal/privacidad">{t("footer.privacy")}</Link>
          <Link href="/legal/terminos">{t("footer.terms")}</Link>
          <Link href="/legal/cancelacion">{t("footer.cancellation")}</Link>
          <Link href="/ayuda">{t("nav.help")}</Link>
        </div>
      </div>
    </footer>
  );
}
