import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getProfile } from '../../api/collection';
import { useApi } from '../../hooks/useApi';
import ProfileForm from '../../components/ProfileForm';
import { ErrorNote, Loading } from '../../components/Feedback';

// Step 3 for new accounts: name, city, handle (a generated one they can keep)
// and whether their lists are public; then where to start.
export default function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(user?.name ? 'start' : 'profile');
  const [query, setQuery] = useState('');
  const profile = useApi(() => getProfile(), ['profile']);

  if (step === 'profile') {
    return (
      <div className="card-page">
        <div className="card-page__card">
          <p className="eyebrow" style={{ margin: 0 }}>Step 3 of 3</p>
          <h1 className="display-m">Who&apos;s collecting?</h1>
          <p className="body muted" style={{ margin: 0 }}>This is how other collectors see you. Change it any time.</p>
          {profile.loading && <Loading label="Loading your profile" />}
          {profile.error && <ErrorNote onRetry={profile.reload}>We couldn&apos;t load your profile.</ErrorNote>}
          {profile.data && (
            <ProfileForm
              profile={profile.data}
              submitLabel="Continue"
              onSaved={(next) => {
                setUser({ ...user, name: next.name, location: next.location, handle: next.handle });
                setStep('start');
              }}
              secondary={<button type="button" className="tax-btn tax-btn--text" onClick={() => setStep('start')}>Skip for now</button>}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="cluster" style={{ alignItems: 'flex-end', gap: 'var(--space-5)', marginBottom: 'var(--space-7)' }}>
        <h1 className="display-xl">You&apos;re in.</h1>
        <p className="body-l muted" style={{ margin: '0 0 10px', maxWidth: 520 }}>Now put something on the wall. Pick whichever&apos;s easiest.</p>
      </div>

      <div className="poster-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <section className="tax-panel stack" style={{ padding: 'var(--space-6)', background: 'var(--accent)', boxShadow: 'var(--shadow-lg)' }}>
          <span className="label">Fastest</span>
          <h2 className="display-s" style={{ fontSize: 36 }}>Snap it with your phone</h2>
          <p style={{ margin: 0 }}>Point the Art Exchange app at a poster and it&apos;s on your wall. Works at the merch table, too.</p>
        </section>

        <form
          className="tax-panel stack"
          style={{ padding: 'var(--space-6)' }}
          onSubmit={(e) => { e.preventDefault(); navigate(`/gallery?q=${encodeURIComponent(query)}`); }}
        >
          <span className="label">Know what you have</span>
          <h2 className="display-s" style={{ fontSize: 36 }}>Search the archive</h2>
          <p className="muted" style={{ margin: 0 }}>Find it by band, venue, artist or year and add it in one click.</p>
          <div className="tax-field">
            <label className="tax-label" htmlFor="first-search">Search</label>
            <div style={{ display: 'flex' }}>
              <input id="first-search" className="tax-input" style={{ flex: 1, minWidth: 0, borderRight: 'none' }} placeholder="e.g. Red Rocks 2022" value={query} onChange={(e) => setQuery(e.target.value)} />
              <button type="submit" className="tax-btn tax-btn--ink" style={{ minHeight: 52 }}>Search</button>
            </div>
          </div>
        </form>

        <section className="tax-panel stack" style={{ padding: 'var(--space-6)' }}>
          <span className="label">Just looking</span>
          <h2 className="display-s" style={{ fontSize: 36 }}>Go to your wall</h2>
          <p className="muted" style={{ margin: 0 }}>It&apos;s empty for now. Everything you add lands here.</p>
          <Link to={location.state?.from || '/wall'} className="tax-btn tax-btn--secondary" style={{ alignSelf: 'flex-start' }}>My wall →</Link>
        </section>
      </div>
    </div>
  );
}
