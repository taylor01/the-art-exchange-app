import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import PosterCard from '../components/PosterCard';

export default function Gallery() {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
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

  useEffect(() => {
    fetchPosters();
  }, [searchQuery, filters, sortBy]);

  useEffect(() => {
    fetchFacets();
  }, []);

  const fetchPosters = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};

      if (searchQuery) {
        params.q = searchQuery;
      }

      if (filters.artists.length > 0) params.artists = filters.artists;
      if (filters.venues.length > 0) params.venues = filters.venues;
      if (filters.bands.length > 0) params.bands = filters.bands;
      if (filters.years.length > 0) params.years = filters.years;
      if (sortBy) params.sort = sortBy;

      const response = await client.get('/posters', { params });
      const data = response.data;

      setPosters(data.data || []);
      setTotalCount(data.meta?.total_count || 0);
    } catch (err) {
      setError('Failed to fetch posters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="row g-4">
              {posters.map((poster) => (
                <div key={poster.id} className="col-sm-6 col-lg-4 col-xl-3">
                  <PosterCard poster={poster} />
                </div>
              ))}
            </div>
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
