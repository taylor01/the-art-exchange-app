import { HANDLE_RULE, handleReasonMessage, normalizeHandle } from '../lib/handles';
import { formatDate } from '../lib/format';

// Handle input showing a live check (from useHandleCheck, owned by the form
// so it can block saving), the reason a handle won't work, and tappable
// suggestions. `lockedUntil` disables it during the 30-day wait.
export default function HandleField({ value, onChange, check, lockedUntil }) {
  const locked = Boolean(lockedUntil);
  const bad = check.state === 'invalid' || check.state === 'unavailable';

  let help = HANDLE_RULE;
  if (locked) help = `You can change your handle again on ${formatDate(lockedUntil)}. Your old handles stay yours for 90 days after a change.`;
  else if (check.state === 'same') help = 'This is your handle. Keep it, or pick your own.';
  else if (check.state === 'checking') help = 'Checking…';
  else if (check.state === 'ok') help = '✓ Available';
  else if (check.state === 'error') help = "We couldn't check that right now. You can still try saving.";
  else if (bad) help = handleReasonMessage(check.reason) || HANDLE_RULE;

  return (
    <div className={`tax-field${bad ? ' tax-field--error' : ''}`}>
      <label className="tax-label" htmlFor="handle">Handle</label>
      <div style={{ height: 52, border: 'var(--border-heavy) solid var(--ink)', background: 'var(--card)', display: 'flex', alignItems: 'center' }}>
        <span aria-hidden="true" style={{ paddingLeft: 14, color: 'var(--ink-muted)' }}>@</span>
        <input
          id="handle"
          className="tax-input"
          style={{ border: 'none', flex: 1, minWidth: 0, height: '100%', paddingLeft: 4 }}
          value={value}
          onChange={(e) => onChange(normalizeHandle(e.target.value))}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          disabled={locked}
          aria-invalid={bad ? 'true' : undefined}
          aria-describedby="handle-help"
        />
      </div>
      <span id="handle-help" className="tax-help" aria-live="polite" style={check.state === 'ok' ? { color: 'var(--ink)', fontWeight: 700 } : undefined}>
        {help}
      </span>
      {check.suggestions.length > 0 && (
        <div className="cluster" role="group" aria-label="Suggested handles">
          {check.suggestions.map((s) => (
            <button key={s} type="button" className="tax-chip" aria-pressed="false" onClick={() => onChange(s)}>@{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
