import { useEffect, useState } from 'react';

/** Loads once; keeps `fallback` (live=false) if the API is unreachable. */
export function useFetch<T>(load: () => Promise<T>, fallback: T) {
  const [data, setData] = useState(fallback);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let mounted = true;
    load()
      .then((result) => {
        if (mounted) {
          setData(result);
          setLive(true);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return { data, live, setData };
}
