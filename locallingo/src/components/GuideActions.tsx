"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/client/api";
import { useI18n } from "@/i18n/client";
import { ErrorText } from "./ErrorText";

export function GuideActions({ guideId, slug, loggedIn, favorite: initialFav }: { guideId: string; slug: string; loggedIn: boolean; favorite: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [fav, setFav] = useState(initialFav);
  const [error, setError] = useState<string | null>(null);
  const requireLogin = () => {
    if (!loggedIn) {
      router.push(`/login?next=/guia/${slug}`);
      return true;
    }
    return false;
  };
  return (
    <div>
      <div className="row">
        <a href="#reservar" className="btn btn-primary">{t("guide.book")}</a>
        <button
          className="btn btn-outline"
          onClick={async () => {
            if (requireLogin()) return;
            try {
              const c = await apiFetch<{ id: string }>("/conversations", { body: { guideId } });
              router.push(`/mensajes/${c.id}`);
            } catch (e) {
              setError(e instanceof ApiError ? e.code : "INTERNAL_ERROR");
            }
          }}
        >
          💬 {t("guide.sendMessage")}
        </button>
        <button
          className="btn btn-ghost"
          aria-pressed={fav}
          onClick={async () => {
            if (requireLogin()) return;
            const r = await apiFetch<{ favorite: boolean }>("/favorites", { body: { guideId } });
            setFav(r.favorite);
          }}
        >
          {fav ? "♥ " + t("guide.unfavorite") : "♡ " + t("guide.favorite")}
        </button>
      </div>
      <ErrorText code={error} />
    </div>
  );
}
