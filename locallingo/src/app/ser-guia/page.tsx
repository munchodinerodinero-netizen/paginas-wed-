import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { getSessionUser } from "@/server/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("nav.becomeGuide"), description: t("cta.guideDesc") };
}

export default async function BecomeGuidePage() {
  const { t } = await getI18n();
  const user = await getSessionUser();
  const cta = user?.role === "GUIDE" ? "/ser-guia/registro" : user ? "/panel" : "/registro?role=GUIDE";
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>{t("cta.guideTitle")}</h1>
          <p>{t("cta.guideDesc")}</p>
          <Link href={cta} className="btn btn-outline" style={{ marginTop: 12 }}>{t("cta.guideButton")} →</Link>
        </div>
      </section>
      <section className="section container">
        <h2>{t("how.guides")}</h2>
        <div className="grid grid-3" style={{ marginTop: 16 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card">
              <div className="step-num">{n}</div>
              <strong>{t(`how.g${n}.title`)}</strong>
              <p className="muted small">{t(`how.g${n}.desc`)}</p>
            </div>
          ))}
        </div>
        <p className="notice" style={{ marginTop: 24 }}>🪪 {t("onboarding.pendingNotice")}</p>
      </section>
    </>
  );
}
