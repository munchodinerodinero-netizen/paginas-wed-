"use client";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client/api";
import { useI18n } from "@/i18n/client";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <button
      className={className}
      onClick={async () => {
        await apiFetch("/auth/logout", { body: {} });
        router.push("/");
        router.refresh();
      }}
    >
      {t("nav.logout")}
    </button>
  );
}
