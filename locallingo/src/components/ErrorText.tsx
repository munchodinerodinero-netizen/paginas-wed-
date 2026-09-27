"use client";
import { useI18n } from "@/i18n/client";

export function ErrorText({ code }: { code: string | null }) {
  const { t } = useI18n();
  if (!code) return null;
  const msg = t(`errors.${code}`);
  return <p className="error" role="alert">{msg.startsWith("errors.") ? t("common.error") : msg}</p>;
}
