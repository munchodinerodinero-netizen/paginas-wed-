import Link from "next/link";
import { redirect } from "next/navigation";
import { intlLocale } from "@/i18n/core";
import { getI18n } from "@/i18n/server";
import { getSessionUser } from "@/server/auth";
import { listConversations } from "@/server/services/social";
import { Avatar } from "@/components/Avatar";

export const metadata = { robots: { index: false } };

export default async function MessagesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/mensajes");
  const { t, locale } = await getI18n();
  const convs = await listConversations(user);
  return (
    <div className="container" style={{ maxWidth: 720, padding: "24px 16px 64px" }}>
      <h1 style={{ fontSize: "1.6rem" }}>{t("messages.title")}</h1>
      {!convs.length && <p className="muted">{t("messages.empty")}</p>}
      <div className="stack">
        {convs.map((c) => (
          <Link key={c.id} href={`/mensajes/${c.id}`} className="card row" style={{ color: "var(--ink)", flexWrap: "nowrap" }}>
            <Avatar name={c.otherName} url={c.otherPhoto} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row between">
                <strong>{c.otherName}</strong>
                <span className="small muted">{new Date(c.lastMessageAt).toLocaleString(intlLocale(locale), { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
              <div className="small muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMessage}</div>
            </div>
            {c.unread > 0 && <span className="badge badge-ok">{c.unread}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
