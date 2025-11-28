export default function About() {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-5">
            <h1 className="mb-3">About The Art Exchange</h1>
            <p className="lead" style={{ color: 'var(--stone-600)', fontSize: '1.25rem' }}>
              Where concert poster collectors come together to catalog, discover, and share their passion for art.
            </p>
          </div>

          {/* Origin Story */}
          <section className="mb-5 pb-5 border-bottom">
            <div className="row align-items-center">
              <div className="col-md-6 mb-4 mb-md-0">
                <h2 className="h3 mb-4">How It All Started</h2>
                <p className="mb-3">
                  Like many great ideas, The Art Exchange was born out of necessity. As a lifelong poster collector,
                  I found myself drowning in spreadsheets, scattered photos, and handwritten notes trying to keep
                  track of my growing collection. There had to be a better way.
                </p>
                <p className="mb-3">
                  After years of collecting concert posters from shows, artists, and venues around the world, I
                  realized I wasn't alone in this struggle. Collectors everywhere were using makeshift systems to
                  catalog their prized pieces. We deserved something better—something built by collectors, for collectors.
                </p>
                <p className="mb-0">
                  So I built The Art Exchange: a platform that combines my love for concert poster art with modern
                  technology to make collecting easier, more organized, and a whole lot more fun.
                </p>
              </div>
              <div className="col-md-6">
                <div
                  className="rounded"
                  style={{
                    backgroundColor: 'var(--stone-100)',
                    paddingBottom: '75%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ color: 'var(--stone-400)' }}
                  >
                    <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="mb-5 pb-5 border-bottom">
            <div className="text-center mb-5">
              <h2 className="h3 mb-3">Our Mission</h2>
              <p className="lead mx-auto" style={{ maxWidth: '42rem', color: 'var(--stone-600)' }}>
                We're on a mission to make poster collecting accessible, organized, and connected.
              </p>
            </div>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="text-center">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(to bottom right, #ef4444, #dc2626)'
                    }}
                  >
                    <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <h3 className="h5 mb-2">Preserve Art History</h3>
                  <p style={{ color: 'var(--stone-600)' }}>
                    Concert posters are more than art—they're cultural artifacts. We're building a comprehensive
                    archive to preserve this important history for future generations.
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-center">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(to bottom right, #34d399, #10b981)'
                    }}
                  >
                    <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="h5 mb-2">Connect Collectors</h3>
                  <p style={{ color: 'var(--stone-600)' }}>
                    Collecting is better together. We're building a community where enthusiasts can share,
                    discover, and connect over their love of poster art.
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="text-center">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(to bottom right, #60a5fa, #3b82f6)'
                    }}
                  >
                    <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h3 className="h5 mb-2">Simplify Collecting</h3>
                  <p style={{ color: 'var(--stone-600)' }}>
                    No more spreadsheets or shoeboxes. We've built tools that make cataloging, organizing,
                    and managing your collection effortless.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What Makes Us Different */}
          <section className="mb-5 pb-5 border-bottom">
            <h2 className="h3 mb-4 text-center">What Makes Us Different</h2>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <div
                      className="d-flex align-items-center justify-content-center rounded"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--stone-100)',
                        color: 'var(--brand-red-light)'
                      }}
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ms-3">
                    <h4 className="h6 mb-2">AI-Powered Intelligence</h4>
                    <p className="mb-0" style={{ color: 'var(--stone-600)', fontSize: '0.9375rem' }}>
                      We use cutting-edge AI to automatically analyze and categorize your posters, extracting
                      details like artists, venues, dates, and visual elements—so you don't have to.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <div
                      className="d-flex align-items-center justify-content-center rounded"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--stone-100)',
                        color: 'var(--brand-red-light)'
                      }}
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ms-3">
                    <h4 className="h6 mb-2">Built by Collectors</h4>
                    <p className="mb-0" style={{ color: 'var(--stone-600)', fontSize: '0.9375rem' }}>
                      We're not outsiders trying to capitalize on a trend. We're collectors ourselves, building
                      the tools we wish existed when we started our own collections.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <div
                      className="d-flex align-items-center justify-content-center rounded"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--stone-100)',
                        color: 'var(--brand-red-light)'
                      }}
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ms-3">
                    <h4 className="h6 mb-2">Comprehensive Database</h4>
                    <p className="mb-0" style={{ color: 'var(--stone-600)', fontSize: '0.9375rem' }}>
                      We've curated a massive catalog of concert posters from artists, venues, and shows worldwide.
                      Whether you're tracking rare finds or common pieces, we've got you covered.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <div
                      className="d-flex align-items-center justify-content-center rounded"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--stone-100)',
                        color: 'var(--brand-red-light)'
                      }}
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ms-3">
                    <h4 className="h6 mb-2">Simple & Intuitive</h4>
                    <p className="mb-0" style={{ color: 'var(--stone-600)', fontSize: '0.9375rem' }}>
                      We believe great software shouldn't need a manual. Our clean, user-friendly interface makes
                      it easy to get started, whether you're a tech wizard or just getting comfortable online.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The Community */}
          <section className="mb-5 pb-5 border-bottom">
            <div className="text-center">
              <h2 className="h3 mb-3">Join Thousands of Collectors</h2>
              <p className="lead mb-4 mx-auto" style={{ maxWidth: '42rem', color: 'var(--stone-600)' }}>
                From casual fans to serious archivists, our community includes collectors of all levels who share
                a passion for concert poster art.
              </p>
              <p style={{ color: 'var(--stone-600)' }}>
                Whether you're just starting your collection or you've been at it for decades, you'll find
                like-minded enthusiasts, helpful resources, and maybe even that poster you've been hunting for years.
              </p>
            </div>
          </section>

          {/* Looking Forward */}
          <section className="mb-5">
            <div className="text-center">
              <h2 className="h3 mb-3">Looking Forward</h2>
              <p className="mx-auto" style={{ maxWidth: '42rem', color: 'var(--stone-600)' }}>
                We're just getting started. Our roadmap includes marketplace features for buying, selling, and trading
                posters, enhanced social features for connecting with other collectors, and even more powerful tools
                for managing and showcasing your collection.
              </p>
              <p className="mx-auto mt-4" style={{ maxWidth: '42rem', color: 'var(--stone-600)' }}>
                This platform is built <em>with</em> our community, not just <em>for</em> them. We're always listening
                to feedback and ideas. Got suggestions? We'd love to hear from you at{' '}
                <a href="mailto:hello@theartexch.com">hello@theartexch.com</a>.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-5" style={{ backgroundColor: 'var(--stone-50)', borderRadius: '1rem' }}>
            <h3 className="h4 mb-3">Ready to Start Your Collection?</h3>
            <p className="mb-4" style={{ color: 'var(--stone-600)' }}>
              Join our community and start cataloging your posters today.
            </p>
            <a href="/signup" className="btn btn-primary px-5">
              Get Started Free
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
