"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "@/lib/client/api";
import { useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/core";
import { ErrorText } from "./ErrorText";
import { ReportForm } from "./ReportForm";

type Conv = {
  id: string;
  otherId: string;
  otherName: string;
  otherSlug: string | null;
  blocked: boolean;
  blockedByMe: boolean;
  messages: { id: string; mine: boolean; body: string; redacted: boolean; createdAt: string }[];
};

// Polling cada 5 s: simple y suficiente para la beta. Al crecer: WebSockets/SSE con la misma API.
export function Chat({ initial }: { initial: Conv }) {
  const { t, locale } = useI18n();
  const [conv, setConv] = useState(initial);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      setConv(await apiFetch<Conv>(`/conversations/${initial.id}`));
    } catch {
      /* ignorar errores de red transitorios */
    }
  }, [initial.id]);

  useEffect(() => {
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [conv.messages.length]);

  return (
    <div className="card chat">
      <div className="row between" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
        <strong>{conv.otherSlug ? <Link href={`/guia/${conv.otherSlug}`}>{conv.otherName}</Link> : conv.otherName}</strong>
        <button
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            await apiFetch("/blocks", { body: { userId: conv.otherId, blocked: !conv.blockedByMe } });
            refresh();
          }}
        >
          {conv.blockedByMe ? t("messages.unblock") : "⛔ " + t("messages.block")}
        </button>
      </div>
      <div className="chat-messages" aria-live="polite">
        {conv.messages.map((m) => (
          <div key={m.id} className={`bubble ${m.mine ? "mine" : ""}`}>
            {m.body}
            <time>{new Date(m.createdAt).toLocaleString(intlLocale(locale), { dateStyle: "short", timeStyle: "short" })}</time>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      {notice && <p className="notice small">{notice}</p>}
      <ErrorText code={error} />
      {conv.blocked ? (
        <p className="muted small">{t("messages.blocked")}</p>
      ) : (
        <form
          className="chat-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!text.trim()) return;
            setError(null);
            setNotice(null);
            try {
              const r = await apiFetch<{ redacted: boolean }>(`/conversations/${conv.id}/messages`, { body: { body: text } });
              if (r.redacted) setNotice(t("messages.redacted"));
              setText("");
              refresh();
            } catch (err) {
              const code = err instanceof ApiError ? err.code : "INTERNAL_ERROR";
              if (code === "CARD_NUMBER") setNotice(t("messages.cardBlocked"));
              else setError(code);
            }
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("messages.placeholder")} maxLength={2000} aria-label={t("messages.placeholder")} />
          <button className="btn btn-primary">{t("messages.send")}</button>
        </form>
      )}
      <div style={{ marginTop: 8 }}>
        <ReportForm target={{ conversationId: conv.id }} label={t("messages.report")} />
      </div>
    </div>
  );
}
