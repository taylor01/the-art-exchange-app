import { Link, useLocation } from 'react-router-dom';
import PosterArt from './PosterArt';

// The grid unit: a framed poster with at most one sticker, then band,
// venue and one meta line. The whole card is one link. `current` marks the
// poster you're already on (in a series).
export default function PosterCard({ poster, sticker, stickerKind, meta, to, current = false }) {
  const location = useLocation();
  const where = [poster.venue?.name, poster.venue?.city].filter(Boolean).join(', ');
  const metaLine = meta ?? (poster.artists?.length ? `Art: ${poster.artists.map((a) => a.name).join(', ')}` : poster.year);
  const stickerText = sticker ?? (poster.editionSize ? `Run of ${poster.editionSize}` : null);

  return (
    <Link to={to || poster.path} state={{ from: location.pathname + location.search }} className={`tax-poster${current ? ' tax-poster--current' : ''}`} aria-current={current ? 'page' : undefined}>
      <div className="tax-poster__frame">
        <PosterArt poster={poster} />
        {stickerText && (
          <span className={`tax-sticker${stickerKind ? ` tax-sticker--${stickerKind}` : ''}`}>{stickerText}</span>
        )}
      </div>
      <div>
        <div className="tax-poster__band">{poster.band?.name || poster.name}</div>
        {poster.band?.name && poster.name && poster.name !== poster.band.name && (
          <div className="tax-poster__where">{poster.name}</div>
        )}
        {where && <div className="tax-poster__where">{where}</div>}
        {metaLine && <div className="tax-poster__meta">{metaLine}</div>}
      </div>
    </Link>
  );
}
