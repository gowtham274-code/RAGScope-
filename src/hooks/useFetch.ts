import { useCallback, useEffect, useState } from "react";

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => {
    setLoading(true);
    fn().then((d) => { setData(d); setError(null); }).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, deps);
  useEffect(load, [load]);
  return { data, error, loading, reload: load };
}
