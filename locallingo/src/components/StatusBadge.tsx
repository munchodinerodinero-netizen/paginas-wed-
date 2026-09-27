import type { TFunction } from "@/i18n/core";

const TONE: Record<string, string> = {
  PENDING_PAYMENT: "badge-warn",
  PENDING: "badge-warn",
  ACCEPTED: "badge-ok",
  COMPLETED: "badge-ok",
  REJECTED: "badge-bad",
  CANCELLED: "badge-bad",
};

export function StatusBadge({ status, t }: { status: string; t: TFunction }) {
  return <span className={`badge ${TONE[status] ?? ""}`}>{t(`booking.status.${status}`)}</span>;
}
