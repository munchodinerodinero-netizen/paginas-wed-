"use client";
import { useState } from "react";
import { REPORT_REASONS } from "@/lib/constants";
import { apiFetch, ApiError } from "@/lib/client/api";
import { useI18n } from "@/i18n/client";
import { ErrorText } from "./ErrorText";

export function ReportForm({ target, label }: { target: { guideId?: string; conversationId?: string; bookingId?: string }; label: string }) {
  const { t } = useI18n();
  const [reason, setReason] = useState<string>("OTHER");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (done) return <p className="success">{t("report.thanks")}</p>;
  return (
    <details>
      <summary className="small muted" style={{ cursor: "pointer" }}>🚩 {label}</summary>
      <form
        className="card card-flat"
        style={{ marginTop: 8 }}
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await apiFetch("/reports", { body: { ...target, reason, details } });
            setDone(true);
          } catch (err) {
            setError(err instanceof ApiError ? err.code : "INTERNAL_ERROR");
          }
        }}
      >
        <div className="field">
          <label>{t("report.reason")}</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            {REPORT_REASONS.map((r) => <option key={r} value={r}>{t(`report.reasons.${r}`)}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t("report.details")}</label>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} />
        </div>
        <ErrorText code={error} />
        <button className="btn btn-danger btn-sm" type="submit">{t("report.submit")}</button>
      </form>
    </details>
  );
}
