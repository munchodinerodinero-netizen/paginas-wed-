import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { getSessionUser } from "@/server/auth";
import { AppError } from "@/server/errors";
import { getConversation } from "@/server/services/social";
import { Chat } from "@/components/Chat";

export const metadata = { robots: { index: false } };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/mensajes/${id}`);
  const { t } = await getI18n();
  let conv;
  try {
    conv = await getConversation(user, id);
  } catch (e) {
    if (e instanceof AppError) notFound();
    throw e;
  }
  return (
    <div className="container" style={{ maxWidth: 720, padding: "24px 16px 64px" }}>
      <Link href="/mensajes" className="small">← {t("messages.title")}</Link>
      <div style={{ marginTop: 12 }}><Chat initial={conv} /></div>
    </div>
  );
}
