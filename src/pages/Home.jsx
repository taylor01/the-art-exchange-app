import { Link } from 'react-router-dom';
import { searchPosters } from '../api/catalog';
import { useApi } from '../hooks/useApi';
import { useAuthStore } from '../store/authStore';
import { accountsEnabled } from '../config/features';
import PosterCard from '../components/PosterCard';
import PosterArt from '../components/PosterArt';
import { ErrorNote, PosterGridSkeleton } from '../components/Feedback';

export default function Home() {
  const { user } = useAuthStore();
  const { data, error, loading, reload } = useApi(() => searchPosters({ per_page: 8, sort: '-created_at' }), ['home']);
  const posters = data?.posters || [];

  return (
    <>
      <section className="container hero">
        <div className="hero__copy">
          <p className="eyebrow">For gig poster collectors</p>
          <h1 className="display-xl">Catalog<br />the wall.</h1>
          <p className="hero__lead">
            Track every poster you own — artist, edition, condition, what you paid — and keep a list of the ones you&apos;re still hunting.
          </p>
          <div className="hero__actions">
            {accountsEnabled && !user && <Link to="/join" className="tax-btn tax-btn--primary tax-btn--lg">Start your wall</Link>}
            {accountsEnabled && user && <Link to="/wall" className="tax-btn tax-btn--primary tax-btn--lg">Go to my wall</Link>}
            <Link to="/gallery" className={accountsEnabled ? 'tax-btn tax-btn--text' : 'tax-btn tax-btn--primary tax-btn--lg'}>
              Browse the archive{accountsEnabled ? ' →' : ''}
            </Link>
          </div>
        </div>
        <div className="hero__fan" aria-hidden="true">
          {posters.slice(0, 3).map((poster) => (
            <div key={poster.id} style={{ aspectRatio: '3 / 4' }}>
              <PosterArt poster={poster} alt="" />
            </div>
          ))}
        </div>
      </section>

      <section className="section--deep">
        <div className="container section">
          <div className="section__head">
            <h2 className="section__title">Fresh off the press</h2>
            <Link to="/gallery" style={{ fontWeight: 700 }}>See the whole archive →</Link>
          </div>
          {error && <ErrorNote onRetry={reload}>We couldn&apos;t load recent posters.</ErrorNote>}
          {loading && <PosterGridSkeleton count={8} label="Loading posters" />}
          {!loading && !error && (
            <div className="poster-grid">
              {posters.map((poster) => <PosterCard key={poster.id} poster={poster} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
