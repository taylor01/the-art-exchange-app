import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PosterWall from '../../components/PosterWall';

const COPY = {
  join: {
    title: 'Start your wall',
    lead: "Free. Track what you own, list what you'd sell, hunt what you're missing.",
    slogan: ['Every show.', 'Every print.'],
    other: { text: 'Already collecting?', link: '/signin', label: 'Sign in' },
  },
  signin: {
    title: 'Welcome back',
    lead: "Enter your email and we'll send you an 8-digit code. No password.",
    slogan: ['Your wall', 'missed you.'],
    other: { text: 'New here?', link: '/join', label: 'Start your wall' },
  },
};

// Step 1 of both joining and signing in: ask for a code by email.
export default function EmailStart({ mode = 'signin' }) {
  const copy = COPY[mode];
  const navigate = useNavigate();
  const location = useLocation();
  const { requestCode, isLoading, error, pendingEmail } = useAuthStore();
  const [email, setEmail] = useState(pendingEmail || '');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await requestCode(email);
    if (result.success) {
      navigate('/verify', { state: { mode, from: location.state?.from } });
    }
  };

  return (
    <div className="auth">
      <div className="auth__form">
        <form onSubmit={handleSubmit} noValidate>
          {mode === 'join' && <p className="eyebrow">Step 1 of 3</p>}
          <h1 className="display-l">{copy.title}</h1>
          <p className="body-l muted" style={{ margin: 0 }}>{copy.lead}</p>

          <div className={`tax-field${error ? ' tax-field--error' : ''}`}>
            <label className="tax-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="tax-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby="email-help"
              required
              autoFocus
            />
            <span id="email-help" className="tax-help" role={error ? 'alert' : undefined}>
              {error || "No password to remember. We'll email you an 8-digit code."}
            </span>
          </div>

          <button type="submit" className="tax-btn tax-btn--ink tax-btn--lg" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send my code'}
          </button>

          {mode === 'join' && (
            <p className="body-s muted" style={{ margin: 0 }}>
              By joining you agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
              Your collection is private until you choose to share a list.
            </p>
          )}
          <p className="body-s" style={{ margin: 0 }}>
            {copy.other.text} <Link to={copy.other.link} style={{ fontWeight: 700 }}>{copy.other.label}</Link>
          </p>
        </form>
      </div>
      <PosterWall ink={mode === 'signin'} slogan={<>{copy.slogan[0]}<br />{copy.slogan[1]}</>} />
    </div>
  );
}
