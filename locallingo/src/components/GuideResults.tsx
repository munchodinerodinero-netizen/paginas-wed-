import { weekdayNames } from "@/i18n/core";
import { getI18n } from "@/i18n/server";
import { getMoney } from "@/server/format";
import type { GuideCard as Card } from "@/server/services/guides";
import { GuideCard } from "./GuideCard";

export async function GuideResults({ guides }: { guides: Card[] }) {
  const { t, locale } = await getI18n();
  const money = await getMoney();
  if (!guides.length) return <div className="card card-flat muted">{t("explore.empty")}</div>;
  return (
    <div className="grid grid-2">
      {guides.map((g) => <GuideCard key={g.id} g={g} t={t} price={money.withApprox} weekdays={weekdayNames(locale)} />)}
    </div>
  );
}
