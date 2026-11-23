import { useState } from 'react';

// A poster image at 3:4, never cropped. Shows the blur placeholder until the
// real image loads, and a printed-looking block when there is no image.
export default function PosterArt({ poster, size = 'grid', alt }) {
  const [loaded, setLoaded] = useState(false);
  const src = size === 'large' ? poster.imageUrl || poster.gridUrl : size === 'small' ? poster.smallUrl || poster.gridUrl : poster.gridUrl || poster.imageUrl;
  const label = alt ?? [poster.band?.name || poster.name, 'poster', poster.venue?.name, poster.year].filter(Boolean).join(' ');

  if (!src) {
    return (
      <div className="poster-art poster-art--empty" role="img" aria-label={label}>
        <span>{poster.band?.name || poster.name}</span>
      </div>
    );
  }

  return (
    <div className="poster-art">
      {poster.blurUrl && !loaded && <img className="poster-art__blur" src={poster.blurUrl} alt="" aria-hidden="true" />}
      <img
        className="poster-art__img"
        src={src}
        alt={label}
        loading={size === 'large' ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        data-loaded={loaded ? 'true' : 'false'}
      />
    </div>
  );
}
