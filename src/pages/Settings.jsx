import { Link } from 'react-router-dom';
import { getProfile } from '../api/collection';
import { useApi } from '../hooks/useApi';
import { useAuthStore } from '../store/authStore';
import ProfileForm from '../components/ProfileForm';
import DeleteAccount from '../components/DeleteAccount';
import { ErrorNote, Loading } from '../components/Feedback';
import { collectorPath } from '../lib/handles';

// Profile, handle and list visibility for the signed-in collector.
export default function Settings() {
  const { user, setUser } = useAuthStore();
  const profile = useApi(() => getProfile(), ['profile']);
  const p = profile.data;
  const anyPublic = p && (p.forSalePublic || p.wantedPublic);

  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <h1 className="display-l" style={{ marginBottom: 'var(--space-3)' }}>Settings</h1>
      {p && (
        <p className="body muted" style={{ margin: '0 0 var(--space-6)' }}>
          Signed in as {p.email}.{' '}
          {anyPublic && <Link to={collectorPath(p.handle)} style={{ fontWeight: 700 }}>See your public page →</Link>}
        </p>
      )}
      {profile.loading && <Loading label="Loading your settings" />}
      {profile.error && <ErrorNote onRetry={profile.reload}>We couldn&apos;t load your settings.</ErrorNote>}
      {p && (
        <ProfileForm
          profile={p}
          onSaved={(next) => {
            setUser({ ...user, name: next.name, location: next.location, handle: next.handle });
            profile.update(() => next);
          }}
        />
      )}
      {p && <DeleteAccount email={p.email} />}
    </div>
  );
}
