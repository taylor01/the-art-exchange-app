import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorDetail, deleteAccount, requestAccountCode } from '../api/collection';
import { useAuthStore } from '../store/authStore';
import { useUnreadStore } from '../store/unreadStore';
import CodeInput from './CodeInput';
import { CODE_LENGTH } from '../config/auth';

// The bottom of Settings. Says plainly what goes and what stays, then asks
// for a fresh code from your email before deleting anything.
export default function DeleteAccount({ email }) {
  const { setUser, setTokens } = useAuthStore();
  const clearUnread = useUnreadStore((s) => s.clear);
  const navigate = useNavigate();
  const [step, setStep] = useState('closed'); // closed | explain | code
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async () => {
    setBusy(true);
    setError('');
    try {
      await requestAccountCode(email);
      setStep('code');
    } catch (err) {
      setError(err?.response?.status === 429 ? 'Too many codes asked for. Wait a few minutes and try again.' : apiErrorDetail(err) || "We couldn't send a code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (value = code) => {
    if (value.length !== CODE_LENGTH || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteAccount(value);
      // The session is gone with the account, so clear it here rather than
      // asking the API to sign out.
      clearUnread();
      setTokens(null, null);
      setUser(null);
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorDetail(err) || "We couldn't delete your account. Try again.");
      setBusy(false);
    }
  };

  return (
    <section className="stack" style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: 'var(--border-heavy) solid var(--ink)' }} aria-labelledby="delete-account">
      <h2 id="delete-account" className="display-s">Delete your account</h2>
      {step === 'closed' && (
        <div>
          <button type="button" className="tax-btn tax-btn--secondary" onClick={() => setStep('explain')}>Delete my account…</button>
        </div>
      )}
      {step !== 'closed' && (
        <>
          <div className="tax-panel tax-panel__body stack" style={{ gap: 'var(--space-3)' }}>
            <p style={{ margin: 0 }}><strong>Deleted for good:</strong> your wall (every copy and its photos), your shows, your hunt and for-sale lists, your profile and your sign-in. This can&apos;t be undone.</p>
            <p style={{ margin: 0 }}><strong>Kept for the other person:</strong> conversations you were in stay with them, with your messages blanked and your name shown as &ldquo;Deleted account&rdquo;. Confirmed trades stay with your side anonymized, so a poster&apos;s price history doesn&apos;t change. Open conversations close, and sales waiting to be confirmed are cancelled.</p>
            <p className="body-s muted" style={{ margin: 0 }}>Your handle becomes free for someone else to use.</p>
          </div>
          {step === 'explain' && (
            <div className="cluster">
              <button type="button" className="tax-btn tax-btn--ink" disabled={busy} onClick={sendCode}>{busy ? 'Sending…' : `Email a code to ${email}`}</button>
              <button type="button" className="tax-btn tax-btn--text" onClick={() => { setStep('closed'); setError(''); }}>Keep my account</button>
            </div>
          )}
          {step === 'code' && (
            <div className="stack">
              <p style={{ margin: 0 }}>Enter the {CODE_LENGTH}-digit code we sent to {email}.</p>
              <CodeInput value={code} onChange={(v) => { setCode(v); setError(''); }} disabled={busy} label="Code to delete your account" />
              <div className="cluster">
                <button type="button" className="tax-btn tax-btn--ink" style={{ background: 'var(--error)', borderColor: 'var(--error)' }} disabled={busy || code.length !== CODE_LENGTH} onClick={() => remove()}>
                  {busy ? 'Deleting…' : 'Delete my account'}
                </button>
                <button type="button" className="tax-btn tax-btn--text" onClick={() => { setStep('closed'); setCode(''); setError(''); }}>Keep my account</button>
              </div>
            </div>
          )}
          {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
        </>
      )}
    </section>
  );
}
