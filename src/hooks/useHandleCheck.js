import { useEffect, useState } from 'react';
import { checkHandle } from '../api/collection';
import { isValidHandle, normalizeHandle } from '../lib/handles';

const DEBOUNCE_MS = 400;

// Live availability for a handle being typed. The format is checked here
// first, so most keystrokes never reach the API (which rate-limits checks).
// Returns { state, reason, suggestions } where state is one of:
//   'same'     — unchanged from the collector's current handle
//   'invalid'  — fails the format rule (no API call)
//   'checking' — waiting for the debounce or the API
//   'ok' | 'unavailable' | 'error'
export function useHandleCheck(value, current) {
  const handle = normalizeHandle(value);
  const same = handle === normalizeHandle(current);
  const valid = isValidHandle(handle);
  const [result, setResult] = useState({ handle: null });

  useEffect(() => {
    if (same || !valid) return undefined;
    let live = true;
    const timer = setTimeout(() => {
      checkHandle(handle).then(
        (r) => { if (live) setResult({ handle, ...r }); },
        () => { if (live) setResult({ handle, error: true }); }
      );
    }, DEBOUNCE_MS);
    return () => { live = false; clearTimeout(timer); };
  }, [handle, same, valid]);

  if (same) return { state: 'same', reason: null, suggestions: [] };
  if (!valid) return { state: 'invalid', reason: 'invalid', suggestions: [] };
  if (result.handle !== handle) return { state: 'checking', reason: null, suggestions: [] };
  if (result.error) return { state: 'error', reason: null, suggestions: [] };
  if (result.available) return { state: 'ok', reason: null, suggestions: [] };
  return { state: 'unavailable', reason: result.reason, suggestions: result.suggestions || [] };
}
