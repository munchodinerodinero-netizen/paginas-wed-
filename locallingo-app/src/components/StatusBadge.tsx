import { useI18n } from "@/lib/i18n";
import { Badge } from "./ui";

const TONE: Record<string, "ok" | "warn" | "bad"> = {
  PENDING_PAYMENT: "warn",
  PENDING: "warn",
  ACCEPTED: "ok",
  COMPLETED: "ok",
  REJECTED: "bad",
  CANCELLED: "bad",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return <Badge text={t(`booking.status.${status}`)} tone={TONE[status] ?? "neutral"} />;
}
