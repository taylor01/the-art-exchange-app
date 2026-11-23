import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchPosters } from '../api/catalog';
import { useApi } from '../hooks/useApi';
import PosterCard from '../components/PosterCard';
import { EmptyState, ErrorNote, Loading } from '../components/Feedback';

const PER_PAGE = 40;
const SORTS = [
  { value: '-created_at', label: 'Newest added' },
  { value: '-year', label: 'Show year, newest' },
  { value: 'year', label: 'Show year, oldest' },
  { value: 'name', label: 'Title, A–Z' },
];
const FILTER_KEYS = ['artist', 'band', 'venue', 'year'];

// The archive: search plus one filter per facet. The URL holds every
// choice, so a filtered view can be shared and the back button works.
export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const sort = params.get('sort') || '-created_at';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const artist = params.get('artist') || '';
  const band = params.get('band') || '';
  const venue = params.get('venue') || '';
  const year = params.get('year') || '';
  const [draft, setDraft] = useState(q);

  const request = {
    page,
    per_page: PER_PAGE,
    sort,
    ...(q && { query: q }),
    ...(artist && { artist_ids: [artist] }),
    ...(band && { band_id: band }),
    ...(venue && { venue_id: venue }),
    ...(year && { year }),
  };
  const { data, error, loading, reload } = useApi(() => searchPosters(request), [request]);

  const change = (updates) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in updates)) next.delete('page');
    setParams(next);
  };

  const facets = data?.facets || {};
  const total = data?.meta?.total_count ?? 0;
  const totalPages = data?.meta?.total_pages ?? 1;
  const active = FILTER_KEYS.filter((k) => params.get(k)).length + (q ? 1 : 0);

  return (
    <>
      <section className="section--deep" aria-label="Search and filters">
        <form
          className="container filters"
          style={{ paddingTop: 20, paddingBottom: 20 }}
          role="search"
          onSubmit={(e) => { e.preventDefault(); change({ q: draft.trim() }); }}
        >
          <div className="tax-field tax-field--grow">
            <label className="tax-label" htmlFor="q">Search</label>
            <input id="q" className="tax-input" type="search" placeholder="Band, artist, venue…" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </div>
          <FacetSelect id="artist" label="Artist" all="All artists" value={artist} items={facets.artists} onChange={(v) => change({ artist: v })} />
          <FacetSelect id="band" label="Band" all="All bands" value={band} items={facets.bands} onChange={(v) => change({ band: v })} />
          <FacetSelect id="venue" label="Venue" all="All venues" value={venue} items={facets.venues} onChange={(v) => change({ venue: v })} />
          <FacetSelect id="year" label="Year" all="Any year" value={year} items={(facets.years || []).map((y) => ({ id: y.year, name: String(y.year), count: y.count }))} onChange={(v) => change({ year: v })} />
          <button type="submit" className="tax-btn tax-btn--ink" style={{ minHeight: 52 }}>Search</button>
        </form>
      </section>

      <section className="container section">
        <div className="section__head">
          <div>
            <h1 className="section__title">{q ? `“${q}”` : 'The archive'}</h1>
            <p className="section__sub" aria-live="polite">
              {loading ? 'Looking…' : `${total.toLocaleString()} poster${total === 1 ? '' : 's'}`}
              {active > 0 && (
                <>
                  {' · '}
                  <button type="button" className="tax-btn tax-btn--text" style={{ minHeight: 0, padding: 0 }} onClick={() => { setDraft(''); setParams(new URLSearchParams(sort !== '-created_at' ? { sort } : {})); }}>
                    Clear {active} filter{active === 1 ? '' : 's'}
                  </button>
                </>
              )}
            </p>
          </div>
          <div className="tax-field" style={{ minWidth: 220 }}>
            <label className="tax-label" htmlFor="sort">Sort</label>
            <select id="sort" className="tax-select" value={sort} onChange={(e) => change({ sort: e.target.value === '-created_at' ? '' : e.target.value })}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {error && <ErrorNote onRetry={reload}>We couldn&apos;t load the archive.</ErrorNote>}
        {loading && <Loading label="Loading posters" />}
        {!loading && !error && data.posters.length === 0 && (
          <EmptyState title="Nothing matches">Try fewer filters, or search for the band or venue name.</EmptyState>
        )}
        {!loading && !error && data.posters.length > 0 && (
          <>
            <div className="poster-grid">
              {data.posters.map((poster) => <PosterCard key={poster.id} poster={poster} />)}
            </div>
            {totalPages > 1 && (
              <nav className="cluster" aria-label="Pages" style={{ justifyContent: 'space-between', marginTop: 'var(--space-7)' }}>
                <button type="button" className="tax-btn tax-btn--secondary" disabled={page <= 1} onClick={() => change({ page: String(page - 1) })}>← Previous</button>
                <span className="label">Page {page} of {totalPages}</span>
                <button type="button" className="tax-btn tax-btn--secondary" disabled={page >= totalPages} onClick={() => change({ page: String(page + 1) })}>Next →</button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}

function FacetSelect({ id, label, all, value, items = [], onChange }) {
  const known = items.some((item) => String(item.id) === String(value));
  return (
    <div className="tax-field">
      <label className="tax-label" htmlFor={id}>{label}</label>
      <select id={id} className="tax-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{all}</option>
        {value && !known && <option value={value}>Selected</option>}
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.name}{item.count ? ` (${item.count})` : ''}</option>
        ))}
      </select>
    </div>
  );
}
