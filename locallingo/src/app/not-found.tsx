import Link from "next/link";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="container center" style={{ padding: "64px 16px" }}>
      <h1>404</h1>
      <p className="muted">{t("errors.NOT_FOUND")}</p>
      <Link href="/explorar" className="btn btn-primary">{t("nav.explore")}</Link>
    </div>
  );
}
