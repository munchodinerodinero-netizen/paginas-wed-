import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api, errorCode } from "./api";
import { useAuth } from "./auth";

/** Carga un recurso de la API al enfocar la pantalla (y cuando cambia la ruta); `reload` para pull-to-refresh. */
export function useApi<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);
  // Esperar a que se restaure la sesión guardada, para no pedir datos privados sin token
  // (pasa al abrir la app directo en una pantalla, p. ej. desde un enlace o notificación).
  const { ready, user } = useAuth();

  const load = useCallback(async () => {
    if (!path || !ready) return;
    setLoading(true);
    try {
      setData(await api<T>(path));
      setError(null);
    } catch (e) {
      setError(errorCode(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ready, user?.id, ...deps]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  return { data, error, loading, reload: load, setData };
}
