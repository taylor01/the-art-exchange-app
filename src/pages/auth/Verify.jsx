import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import CodeInput from '../../components/CodeInput';

const RESEND_AFTER = 30;

// Step 2: enter the emailed code. New addresses become accounts here.
export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || 'signin';
  const from = location.state?.from;
  const { pendingEmail, verifyCode, requestCode, isLoading, error, clearError } = useAuthStore();
  // Held locally: a successful verify clears pendingEmail before we navigate.
  const [email] = useState(pendingEmail);
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(RESEND_AFTER);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  if (!email) return <Navigate to={mode === 'join' ? '/join' : '/signin'} replace />;

  const submit = async (value = code) => {
    const result = await verifyCode(value, email);
    if (!result.success) return;
    if (!result.user?.name) navigate('/welcome', { replace: true, state: { from } });
    else navigate(from || '/wall', { replace: true });
  };

  const resend = async () => {
    const result = await requestCode(email);
    if (result.success) {
      setCode('');
      setResent(true);
      setWait(RESEND_AFTER);
    }
  };

  return (
    <div className="card-page">
      <form
        className="card-page__card"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        noValidate
      >
        <span className="tax-sticker tax-sticker--tilt" style={{ position: 'absolute', top: -18, right: 32, fontSize: 13 }}>
          Check your inbox
        </span>
        {mode === 'join' && <p className="eyebrow" style={{ margin: 0 }}>Step 2 of 3</p>}
        <h1 className="display-m">Enter the code</h1>
        <p className="body muted" style={{ margin: 0 }}>
          We sent a 6-digit code to <strong style={{ color: 'var(--ink)' }}>{email}</strong>.{' '}
          <Link to={mode === 'join' ? '/join' : '/signin'} onClick={clearError} style={{ fontWeight: 700 }}>Change</Link>
        </p>

        <CodeInput
          value={code}
          onChange={(v) => { setCode(v); if (error) clearError(); }}
          onComplete={(v) => submit(v)}
          disabled={isLoading}
          label="Sign-in code"
        />

        {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
        {resent && !error && <div className="tax-alert" role="status">New code sent. Any code from the last 10 minutes works.</div>}

        <button type="submit" className="tax-btn tax-btn--ink tax-btn--lg" disabled={isLoading || code.length < 6}>
          {isLoading ? 'Checking…' : mode === 'join' ? 'Verify' : 'Sign in'}
        </button>

        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <span className="body-s muted">The code works for 10 minutes. Check spam if it&apos;s not there.</span>
          <button type="button" className="tax-btn tax-btn--text" onClick={resend} disabled={wait > 0 || isLoading}>
            {wait > 0 ? `Resend in 0:${String(wait).padStart(2, '0')}` : 'Send a new code'}
          </button>
        </div>
      </form>
    </div>
  );
}
