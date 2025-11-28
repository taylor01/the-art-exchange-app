import { Link } from 'react-router-dom';

export default function PosterCard({ poster }) {
  const attributes = poster.attributes;
  const imageUrl = attributes.image_url || '/placeholder.jpg';

  return (
    <Link to={`/poster/${poster.id}`} className="text-decoration-none">
      <div className="bg-white rounded overflow-hidden h-100" style={{
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
      >
        {/* Poster Image */}
        <div className="position-relative overflow-hidden" style={{
          aspectRatio: '3/4',
          backgroundColor: 'var(--stone-100)'
        }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={attributes.title || 'Poster'}
              loading="lazy"
              className="w-100 h-100"
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{
              background: 'linear-gradient(to bottom right, var(--stone-200), var(--stone-300))'
            }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--stone-500)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Poster Info */}
        <div className="p-3">
          <h6
            className="fw-semibold mb-1"
            style={{
              fontSize: '0.875rem',
              color: 'var(--stone-900)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            title={attributes.title}
          >
            {attributes.title}
          </h6>
          {attributes.band_name && (
            <p className="mb-1 text-truncate" style={{ fontSize: '0.75rem', color: 'var(--stone-600)' }}>
              {attributes.band_name}
            </p>
          )}
          {attributes.venue_name && (
            <p className="mb-2 text-truncate" style={{ fontSize: '0.75rem', color: 'var(--stone-500)' }}>
              {attributes.venue_name}
            </p>
          )}
          <div className="d-flex align-items-center justify-content-between">
            <span style={{ fontSize: '0.75rem', color: 'var(--stone-500)' }}>
              {attributes.year || attributes.date}
            </span>
            {attributes.price && (
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--stone-600)' }}>
                ${(attributes.price / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

