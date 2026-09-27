import { redirect } from "next/navigation";
import { weekdayNames } from "@/i18n/core";
import { getI18n } from "@/i18n/server";
import { getSessionUser } from "@/server/auth";
import { getCatalog } from "@/server/services/catalog";
import { GuideWizard } from "@/components/GuideWizard";

export const metadata = { robots: { index: false } };

export default async function GuideOnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/registro?role=GUIDE&next=/ser-guia/registro");
  if (user.role !== "GUIDE") redirect("/ser-guia");
  const { t, locale } = await getI18n();
  const { step } = await searchParams;
  const initialStep = step && /^[1-6]$/.test(step) ? Number(step) : undefined;
  return (
    <div className="container" style={{ maxWidth: 720, padding: "24px 16px 64px" }}>
      <h1 style={{ fontSize: "1.6rem" }}>{t("onboarding.title")}</h1>
      <GuideWizard catalog={await getCatalog(locale)} initialStep={initialStep} weekdays={weekdayNames(locale)} />
    </div>
  );
}
