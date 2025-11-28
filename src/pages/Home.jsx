import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <>
      {/* Hero Section */}
      <div className="position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #fef7f0 0%, #ffffff 50%, #ecfdf5 100%)'
      }}>
        {/* Background Grid Pattern */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ opacity: 0.05 }}>
          <svg className="w-100 h-100" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container text-center position-relative" style={{ padding: '5rem 1rem' }}>
          <div className="animate-fade-in">
            <h1 className="fw-bold mb-4" style={{
              fontSize: 'clamp(3rem, 8vw, 4.5rem)',
              lineHeight: '1.1',
              color: 'var(--stone-900)'
            }}>
              <span className="d-block">Discover</span>
              <span className="d-block" style={{
                background: 'linear-gradient(to right, #ef4444, #dc2626)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Art Posters</span>
              <span className="d-block">You'll Love</span>
            </h1>

            <p className="mx-auto mb-5" style={{
              maxWidth: '42rem',
              fontSize: '1.25rem',
              color: 'var(--stone-600)',
              lineHeight: '1.75'
            }}>
              Join our community of passionate collectors. Track your collection, discover rare finds, and connect with fellow art enthusiasts from around the world.
            </p>
          </div>

          {!user ? (
            <>
              {/* Guest User CTAs */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center mx-auto mb-4" style={{ maxWidth: '28rem' }}>
                <Link to="/signup" className="btn btn-primary d-inline-flex align-items-center justify-content-center" style={{ minWidth: '200px' }}>
                  <svg className="me-2" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Start Collecting Free
                </Link>

                <Link to="/login" className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center" style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--stone-300)',
                  color: 'var(--stone-700)',
                  minWidth: '150px'
                }}>
                  <svg className="me-2" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Sign In
                </Link>
              </div>

              <div className="mt-4">
                <p style={{ color: 'var(--stone-500)', fontSize: '0.875rem' }}>
                  Join <span className="fw-semibold" style={{ color: 'var(--brand-red-light)' }}>thousands</span> of collectors worldwide
                </p>
                <p style={{ color: 'var(--stone-400)', fontSize: '0.75rem' }}>
                  <Link to="/gallery" className="text-decoration-none" style={{ color: 'inherit' }}>
                    or just browse the art →
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Authenticated User CTAs */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center mx-auto" style={{ maxWidth: '28rem' }}>
                <Link to="/profile" className="btn btn-primary w-100 w-sm-auto px-5 py-2 d-inline-flex align-items-center justify-content-center">
                  <svg className="me-2" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  View My Profile
                </Link>

                <Link to="/collection" className="btn btn-outline-secondary w-100 w-sm-auto px-5 py-2 d-inline-flex align-items-center justify-content-center" style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--stone-300)',
                  color: 'var(--stone-700)'
                }}>
                  <svg className="me-2" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  Browse Collection
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5 bg-white" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ fontSize: '2.25rem', color: 'var(--stone-900)' }}>
              Why Collectors Choose Us
            </h2>
            <p className="mx-auto" style={{
              fontSize: '1.25rem',
              color: 'var(--stone-600)',
              maxWidth: '42rem'
            }}>
              Everything you need to manage, discover, and connect through art poster collecting
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="text-center">
                <div className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded" style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(to bottom right, #ef4444, #dc2626)',
                  borderRadius: '1rem'
                }}>
                  <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
                <h3 className="fw-semibold mb-3" style={{ fontSize: '1.25rem', color: 'var(--stone-900)' }}>
                  Track Collections
                </h3>
                <p style={{ color: 'var(--stone-600)', lineHeight: '1.75' }}>
                  Organize and catalog your art poster collection with detailed records, photos, and provenance tracking.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="text-center">
                <div className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded" style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(to bottom right, #34d399, #10b981)',
                  borderRadius: '1rem'
                }}>
                  <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <h3 className="fw-semibold mb-3" style={{ fontSize: '1.25rem', color: 'var(--stone-900)' }}>
                  Discover Art
                </h3>
                <p style={{ color: 'var(--stone-600)', lineHeight: '1.75' }}>
                  Explore rare finds, trending pieces, and hidden gems from artists, venues, and collectors worldwide.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="text-center">
                <div className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded" style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(to bottom right, #60a5fa, #3b82f6)',
                  borderRadius: '1rem'
                }}>
                  <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 className="fw-semibold mb-3" style={{ fontSize: '1.25rem', color: 'var(--stone-900)' }}>
                  Connect & Trade
                </h3>
                <p style={{ color: 'var(--stone-600)', lineHeight: '1.75' }}>
                  Build relationships with collectors, artists, and venues. Trade, sell, and share your passion for art.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
