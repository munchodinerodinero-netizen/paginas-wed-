"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/client/api";
import { useI18n } from "@/i18n/client";
import { ErrorText } from "./ErrorText";

const KEYS = ["rating", "communication", "punctuality", "knowledge", "experience"] as const;

function StarInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="row between">
      <span className="small">{label}</span>
      <span className="star-input" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} className={n <= value ? "on" : ""} aria-label={`${n}`} aria-checked={n === value} role="radio" onClick={() => onChange(n)}>★</button>
        ))}
      </span>
    </div>
  );
}

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [vals, setVals] = useState<Record<string, number>>({ rating: 5, communication: 5, punctuality: 5, knowledge: 5, experience: 5 });
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="card"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await apiFetch(`/bookings/${bookingId}/review`, { body: { ...vals, comment } });
          router.refresh();
        } catch (err) {
          setError(err instanceof ApiError ? err.code : "INTERNAL_ERROR");
        }
      }}
    >
      <h3>{t("booking.leaveReview")}</h3>
      {KEYS.map((k) => (
        <StarInput key={k} label={t(k === "rating" ? "ratings.overall" : `ratings.${k}`)} value={vals[k]} onChange={(n) => setVals({ ...vals, [k]: n })} />
      ))}
      <div className="field" style={{ marginTop: 10 }}>
        <label htmlFor="comment">{t("booking.comment")}</label>
        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} />
      </div>
      <ErrorText code={error} />
      <button className="btn btn-primary">{t("booking.submitReview")}</button>
    </form>
  );
}
