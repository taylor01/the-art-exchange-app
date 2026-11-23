import { useCallback, useEffect, useState } from 'react';

// Load data for a component. `load` returns a promise; `deps` re-run it.
// Loading is derived (the stored result belongs to other deps), so no
// state is set synchronously inside the effect.
export function useApi(load, deps) {
  const [nonce, setNonce] = useState(0);
  const key = JSON.stringify([deps, nonce]);
  const [result, setResult] = useState({ key: null, data: undefined, error: null });

  useEffect(() => {
    let live = true;
    Promise.resolve()
      .then(load)
      .then(
        (data) => { if (live) setResult({ key, data, error: null }); },
        (error) => { if (live) setResult({ key, data: undefined, error }); }
      );
    return () => { live = false; };
    // `load` is a fresh closure each render; `key` captures what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = result.key === key;
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const update = useCallback((fn) => setResult((r) => ({ ...r, data: fn(r.data) })), []);

  return {
    data: current ? result.data : undefined,
    error: current ? result.error : null,
    loading: !current,
    reload,
    update,
  };
}
