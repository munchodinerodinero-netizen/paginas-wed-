"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/client/api";
import { ErrorText } from "./ErrorText";

/** Botón que llama a un endpoint de la API y refresca la vista. */
export function ActionButton({
  path,
  body,
  method = "POST",
  label,
  confirm,
  className = "btn btn-outline btn-sm",
  redirectTo,
}: {
  path: string;
  body?: unknown;
  method?: string;
  label: string;
  confirm?: string;
  className?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <span>
      <button
        className={className}
        disabled={busy}
        onClick={async () => {
          if (confirm && !window.confirm(confirm)) return;
          setBusy(true);
          setError(null);
          try {
            await apiFetch(path, { method, body: body ?? {} });
            if (redirectTo) router.push(redirectTo);
            router.refresh();
          } catch (e) {
            setError(e instanceof ApiError ? e.code : "INTERNAL_ERROR");
          } finally {
            setBusy(false);
          }
        }}
      >
        {label}
      </button>
      <ErrorText code={error} />
    </span>
  );
}
