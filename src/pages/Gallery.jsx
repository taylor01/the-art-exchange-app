import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import PosterCard from '../components/PosterCard';

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    artists: [],
    venues: [],
    bands: [],
    years: [],
  });
  const [facets, setFacets] = useState({
    artists: [],
    venues: [],
    bands: [],
    years: [],
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    artists: false,
    venues: false,
    bands: false,
    years: false,
  });

  const observerTarget = useRef(null);
  const prefetchTriggered = useRef(false);
  const isInitialMount = useRef(true);
  const PER_PAGE = 40;

  // Initialize state from URL on mount
  useEffect(() => {
    const urlArtists = searchParams.getAll('artist');
    const urlVenues = searchParams.getAll('venue');
    const urlBands = searchParams.getAll('band');
    const urlYears = searchParams.getAll('year');
    const urlQuery = searchParams.get('q') || '';
    const urlSort = searchParams.get('sort') || 'newest';

    setFilters({
      artists: urlArtists.map(Number).filter(Boolean),
      venues: urlVenues.map(Number).filter(Boolean),
      bands: urlBands.map(Number).filter(Boolean),
      years: urlYears.map(Number).filter(Boolean),
    });
    setSearchQuery(urlQuery);
    setSortBy(urlSort);

    isInitialMount.current = false;
  }, []);

  // Update URL when filters/search/sort change (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) return;

    const newParams = new URLSearchParams();

    // Add filters to URL
    filters.artists.forEach(id => newParams.append('artist', id));
    filters.venues.forEach(id => newParams.append('venue', id));
    filters.bands.forEach(id => newParams.append('band', id));
    filters.years.forEach(id => newParams.append('year', id));

    // Add search query
    if (searchQuery) {
      newParams.set('q', searchQuery);
    }

    // Add sort
    if (sortBy !== 'newest') {
      newParams.set('sort', sortBy);
    }

    setSearchParams(newParams, { replace: true });
  }, [filters, searchQuery, sortBy]);

  // Reset to page 1 when filters/search/sort change
  useEffect(() => {
    if (isInitialMount.current) return;

    setCurrentPage(1);
    setPosters([]);
    setHasMore(true);
    prefetchTriggered.current = false;
    fetchPosters(1, true);
  }, [searchQuery, filters, sortBy]);

  useEffect(() => {
    fetchFacets();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadingMore, currentPage]);

  // Prefetch next page when user scrolls to 80% of current content
  useEffect(() => {
    const handleScroll = () => {
      if (prefetchTriggered.current || !hasMore || loadingMore || loading) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      const scrollPercent = (scrollTop + clientHeight) / scrollHeight;

      // Prefetch when user has scrolled 80% of the content
      if (scrollPercent > 0.8) {
        prefetchTriggered.current = true;
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, currentPage]);

  const fetchPosters = async (page = 1, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');

    try {
      const params = {
        page,
        per_page: PER_PAGE,
      };

      // Search query
      if (searchQuery) {
        params.query = searchQuery;
      }

      // Filters - using correct API parameter names
      // Artists: multi-select array
      if (filters.artists.length > 0) {
        params.artist_ids = filters.artists;
      }

      // Band: single value (using first selected)
      if (filters.bands.length > 0) {
        params.band_id = filters.bands[0];
      }

      // Venue: single value (using first selected)
      if (filters.venues.length > 0) {
        params.venue_id = filters.venues[0];
      }

      // Year: single value (using first selected)
      if (filters.years.length > 0) {
        params.year = filters.years[0];
      }

      if (sortBy) params.sort = sortBy;

      // Use /posters/search endpoint for faceted search
      const response = await client.get('/posters/search', { params });
      const data = response.data;

      const newPosters = data.data || [];
      const total = data.meta?.total_count || 0;

      if (reset) {
        setPosters(newPosters);
      } else {
        setPosters(prev => [...prev, ...newPosters]);
      }

      setTotalCount(total);
      setHasMore(newPosters.length === PER_PAGE && posters.length + newPosters.length < total);
      prefetchTriggered.current = false;
    } catch (err) {
      setError('Failed to fetch posters');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosters(nextPage, false);
  }, [currentPage, hasMore, loading, loadingMore]);

  const fetchFacets = async () => {
    try {
      const response = await client.get('/posters/search');
      const data = response.data;

      if (data.meta?.facets) {
        setFacets({
          artists: data.meta.facets.artists || [],
          venues: data.meta.facets.venues || [],
          bands: data.meta.facets.bands || [],
          years: data.meta.facets.years || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch facets:', err);
    }
  };

  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearFilters = () => {
    setFilters({
      artists: [],
      venues: [],
      bands: [],
      years: [],
    });
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return searchQuery ||
           filters.artists.length > 0 ||
           filters.venues.length > 0 ||
           filters.bands.length > 0 ||
           filters.years.length > 0;
  };

  const FilterSection = ({ title, category, items, limit = 5 }) => {
    const displayItems = expandedSections[category] ? items : items.slice(0, limit);
    const showToggle = items.length > limit;

    return (
      <div className="mb-4 pb-4 border-bottom">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--stone-900)' }}>
            {title}
          </h4>
          {filters[category].length > 0 && (
            <span className="badge" style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem'
            }}>
              {filters[category].length}
            </span>
          )}
        </div>
        <div className="d-flex flex-column gap-2">
          {displayItems.map((item) => (
            <div key={item.id || item.name} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`${category}-${item.id || item.name}`}
                checked={filters[category].includes(item.id || item.name)}
                onChange={() => handleCheckboxChange(category, item.id || item.name)}
                style={{ borderColor: 'var(--stone-300)' }}
              />
              <label
                className="form-check-label"
                htmlFor={`${category}-${item.id || item.name}`}
                style={{ fontSize: '0.875rem', color: 'var(--stone-700)', cursor: 'pointer' }}
              >
                {item.name}
                {item.city && <span style={{ color: 'var(--stone-500)' }}> ({item.city})</span>}
              </label>
            </div>
          ))}
        </div>
        {showToggle && (
          <button
            className="btn btn-link p-0 mt-2"
            onClick={() => toggleSection(category)}
            style={{ fontSize: '0.875rem', color: 'var(--brand-red-light)', fontWeight: 500, textDecoration: 'none' }}
          >
            {expandedSections[category] ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="container py-4">
      {/* Search Bar */}
      <div className="mb-4 pt-3">
        <div className="position-relative" style={{ maxWidth: '28rem' }}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="position-relative">
              <div className="position-absolute top-0 start-0 h-100 d-flex align-items-center ps-3" style={{ pointerEvents: 'none' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--stone-400)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              {loading && (
                <div className="position-absolute top-0 end-0 h-100 d-flex align-items-center" style={{ right: '80px' }}>
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              <input
                type="text"
                className="form-control"
                placeholder="Search posters, artists, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: '2.5rem',
                  paddingRight: '90px',
                  fontSize: '0.875rem',
                  borderRadius: '0.5rem'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary position-absolute top-0 end-0 h-100"
                style={{
                  fontSize: '0.875rem',
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Controls Row */}
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div className="d-flex align-items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              className="btn btn-sm d-md-none"
              onClick={() => setShowMobileFilters(true)}
              style={{
                backgroundColor: 'var(--stone-100)',
                color: 'var(--stone-700)',
                fontSize: '0.875rem',
                border: 'none'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="me-2 d-inline">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
              </svg>
              Filters
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="sort" className="mb-0" style={{ fontSize: '0.875rem', color: 'var(--stone-600)' }}>
              Sort by:
            </label>
            <select
              id="sort"
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                fontSize: '0.875rem',
                width: 'auto',
                borderRadius: '0.5rem'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar Filters (Desktop) */}
        <div className="col-md-3 d-none d-md-block">
          <div className="card border" style={{ borderRadius: '0.5rem' }}>
            <div className="card-body p-4">
              <h3 className="mb-4" style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--stone-900)' }}>
                Filters
              </h3>

              {/* Artists Filter */}
              <FilterSection title="Artists" category="artists" items={facets.artists} />

              {/* Venues Filter */}
              <FilterSection title="Venues" category="venues" items={facets.venues} />

              {/* Bands Filter */}
              <FilterSection title="Bands" category="bands" items={facets.bands} />

              {/* Years Filter */}
              <FilterSection title="Years" category="years" items={facets.years} limit={8} />

              {/* Clear Filters */}
              {hasActiveFilters() && (
                <div className="pt-3 border-top">
                  <button
                    className="btn btn-link p-0"
                    onClick={clearFilters}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--stone-500)',
                      textDecoration: 'none',
                      fontWeight: 'normal'
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          {/* Results Count */}
          <div className="mb-4">
            <p className="mb-0" style={{ fontSize: '0.875rem', color: 'var(--stone-600)' }}>
              {loading ? 'Loading...' : `Showing ${posters.length} of ${totalCount.toLocaleString()} posters`}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Poster Grid */}
          {!loading && posters.length === 0 ? (
            <div className="text-center py-5">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mx-auto mb-3" style={{ color: 'var(--stone-400)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
              </svg>
              <h3 className="mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--stone-900)' }}>
                No posters found
              </h3>
              <p className="mb-4" style={{ fontSize: '0.875rem', color: 'var(--stone-500)' }}>
                Try adjusting your search or filter criteria.
              </p>
              <button className="btn btn-primary" onClick={clearFilters}>
                View all posters
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {posters.map((poster) => (
                  <div key={poster.id} className="col-sm-6 col-lg-4 col-xl-3">
                    <PosterCard poster={poster} />
                  </div>
                ))}
              </div>

              {/* Loading indicator for infinite scroll */}
              {loadingMore && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading more posters...</span>
                  </div>
                </div>
              )}

              {/* Intersection observer target */}
              <div ref={observerTarget} style={{ height: '20px' }} />

              {/* End of results message */}
              {!hasMore && posters.length > 0 && (
                <div className="text-center py-4">
                  <p className="mb-0" style={{ fontSize: '0.875rem', color: 'var(--stone-500)' }}>
                    You've reached the end of the gallery
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
          style={{
            zIndex: 1050,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobileFilters(false);
          }}
        >
          <div className="bg-white rounded-top p-4 position-absolute bottom-0 start-0 w-100" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h3 className="mb-0" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
                Filter Artwork
              </h3>
              <button
                className="btn-close"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close"
              ></button>
            </div>

            {/* Artists Filter */}
            <FilterSection title="Artists" category="artists" items={facets.artists} />

            {/* Venues Filter */}
            <FilterSection title="Venues" category="venues" items={facets.venues} />

            {/* Bands Filter */}
            <FilterSection title="Bands" category="bands" items={facets.bands} />

            {/* Years Filter */}
            <FilterSection title="Years" category="years" items={facets.years} limit={8} />

            {/* Sort in Mobile */}
            <div className="mt-4 pt-4 border-top">
              <label htmlFor="mobile-sort" className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Sort by:
              </label>
              <select
                id="mobile-sort"
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <button
              className="btn btn-primary w-100 mt-4"
              onClick={() => setShowMobileFilters(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
