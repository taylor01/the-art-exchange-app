import { searchPosters } from '../api/catalog';
import { useApi } from '../hooks/useApi';
import PosterArt from './PosterArt';

// Decorative grid of recent posters for the sign-in and join pages.
export default function PosterWall({ ink = false, slogan }) {
  const { data } = useApi(() => searchPosters({ per_page: 6, sort: '-created_at' }), ['wall']);
  const posters = data?.posters || [];

  return (
    <section className={`auth__art${ink ? ' auth__art--ink' : ''}`} aria-hidden="true">
      <div className="auth__wall">
        {posters.map((poster) => (
          <div key={poster.id} style={{ position: 'relative', aspectRatio: '3 / 4' }}>
            <PosterArt poster={poster} size="small" alt="" />
          </div>
        ))}
      </div>
      {slogan && <p className="auth__slogan">{slogan}</p>}
    </section>
  );
}
