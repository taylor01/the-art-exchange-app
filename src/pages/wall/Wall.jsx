import { Link, useSearchParams } from 'react-router-dom';
import { listCopies, listShows } from '../../api/collection';
import { useApi } from '../../hooks/useApi';
import PosterCard from '../../components/PosterCard';
import { EmptyState, ErrorNote, Loading } from '../../components/Feedback';
import { conditionLabel, dateParts } from '../../lib/format';
import Deals from './Deals';

const FILTERS = [
  { key: 'owned', label: 'On my wall' },
  { key: 'sale', label: 'For sale' },
  { key: 'wanted', label: 'Hunt list' },
];

// The collector's wall: posters (owned, for sale, hunting) and shows.
export default function Wall() {
  const [params, setParams] = useSearchParams();
  const tab = ['shows', 'deals'].includes(params.get('tab')) ? params.get('tab') : 'posters';
  const status = FILTERS.some((f) => f.key === params.get('status')) ? params.get('status') : 'owned';

  const setTab = (next) => setParams(next === 'posters' ? {} : { tab: next });
  const setStatus = (next) => setParams(next === 'owned' ? {} : { status: next });

  return (
    <div className="container section">
      <div className="section__head">
        <h1 className="display-l">My wall</h1>
        <Link to="/gallery" className="tax-btn tax-btn--primary">Add a poster</Link>
      </div>

      <div className="tax-tabs" role="tablist" aria-label="Wall view" style={{ maxWidth: 560, marginBottom: 'var(--space-5)' }}>
        <button type="button" className="tax-tab" role="tab" aria-selected={tab === 'posters'} onClick={() => setTab('posters')}>Posters</button>
        <button type="button" className="tax-tab" role="tab" aria-selected={tab === 'shows'} onClick={() => setTab('shows')}>Shows</button>
        <button type="button" className="tax-tab" role="tab" aria-selected={tab === 'deals'} onClick={() => setTab('deals')}>Buying &amp; selling</button>
      </div>

      {tab === 'posters' && <Posters status={status} setStatus={setStatus} />}
      {tab === 'shows' && <Shows />}
      {tab === 'deals' && <Deals />}
    </div>
  );
}

function Posters({ status, setStatus }) {
  const request = status === 'wanted' ? { status: 'wanted' } : status === 'sale' ? { status: 'owned', for_sale: 'true' } : { status: 'owned' };
  const { data, error, loading, reload } = useApi(() => listCopies(request), [request]);
  const copies = (data?.copies || []).filter((c) => c.poster);
  const tiles = wallTiles(copies, status);

  return (
    <>
      <div className="cluster" role="group" aria-label="Show" style={{ marginBottom: 'var(--space-5)' }}>
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className="tax-chip" aria-pressed={status === f.key} onClick={() => setStatus(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <ErrorNote onRetry={reload}>We couldn&apos;t load your wall.</ErrorNote>}
      {loading && <Loading label="Loading your wall" />}
      {!loading && !error && copies.length === 0 && <EmptyFor status={status} />}
      {!loading && !error && copies.length > 0 && (
        <>
          <p className="label" style={{ marginBottom: 'var(--space-4)' }}>{countLine(status, tiles.length, copies.length)}</p>
          <div className="poster-grid">
            {tiles.map((t) => <PosterCard key={t.key} {...t.card} />)}
          </div>
        </>
      )}
    </>
  );
}

// On my wall: one tile per poster, with a ×N sticker when you have several
// copies; it opens the poster page, which lists each one. For sale and the
// hunt list: one tile per copy, since each listing has its own price.
function wallTiles(copies, status) {
  if (status !== 'owned') return copies.map((copy) => ({ key: copy.id, card: copyCard(copy) }));
  const groups = new Map();
  for (const copy of copies) {
    const id = copy.poster.id;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(copy);
  }
  return [...groups.values()].map((group) => {
    if (group.length === 1) return { key: group[0].id, card: copyCard(group[0]) };
    const poster = group[0].poster;
    const forSale = group.filter((c) => c.forSale).length;
    const editions = group.map((c) => c.editionNumber).filter(Boolean);
    return {
      key: `poster-${poster.id}`,
      card: {
        poster,
        to: poster.path,
        sticker: `×${group.length}`,
        stickerKind: 'ink',
        meta: [editions.length ? editions.join(' · ') : `${group.length} copies`, forSale ? `${forSale} for sale` : null].filter(Boolean).join(' · '),
      },
    };
  });
}

function copyCard(copy) {
  return {
    poster: copy.poster,
    to: copy.status === 'wanted' ? copy.poster.path : `/wall/${copy.id}`,
    sticker: copy.status === 'wanted' ? 'Hunting' : copy.forSale ? 'For sale' : copy.editionNumber ? `#${copy.editionNumber}` : null,
    stickerKind: copy.status === 'wanted' ? 'hunt' : undefined,
    meta: copy.status === 'wanted'
      ? copy.poster.year
      : [copy.editionNumber && copy.forSale ? copy.editionNumber : null, conditionLabel(copy.condition), copy.forSale && copy.askingPrice ? `$${copy.askingPrice}` : null].filter(Boolean).join(' · ') || copy.poster.year,
  };
}

function countLine(status, tiles, copies) {
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  if (status === 'sale') return `${plural(copies, 'copy', 'copies')} for sale`;
  if (status === 'wanted') return plural(copies, 'poster', 'posters');
  return tiles === copies ? plural(tiles, 'poster', 'posters') : `${plural(tiles, 'poster', 'posters')} · ${plural(copies, 'copy', 'copies')}`;
}

function EmptyFor({ status }) {
  if (status === 'wanted') {
    return (
      <EmptyState title="Nothing on the hunt list" action={<Link to="/gallery" className="tax-btn tax-btn--secondary">Browse the archive</Link>}>
        Find a poster you&apos;re missing and press Hunt it. It lands here.
      </EmptyState>
    );
  }
  if (status === 'sale') {
    return (
      <EmptyState title="Nothing listed">
        Open a poster on your wall and switch on List for sale.
      </EmptyState>
    );
  }
  return (
    <EmptyState title="Your wall is empty" action={<Link to="/gallery" className="tax-btn tax-btn--primary">Find your first poster</Link>}>
      Search the archive for a poster you own and press Put it on my wall.
    </EmptyState>
  );
}

function Shows() {
  const { data, error, loading, reload } = useApi(() => listShows({ status: 'attended' }), ['shows']);
  const shows = (data || []).filter((s) => s.show).sort((a, b) => String(b.show.date).localeCompare(String(a.show.date)));

  if (error) return <ErrorNote onRetry={reload}>We couldn&apos;t load your shows.</ErrorNote>;
  if (loading) return <Loading label="Loading your shows" />;
  if (shows.length === 0) {
    return (
      <EmptyState title="No shows yet">
        On any poster page, switch on I was at this show. Your concert history builds up here.
      </EmptyState>
    );
  }

  return (
    <ul className="row-list" style={{ maxWidth: 760 }}>
      {shows.map(({ id, show }) => {
        const d = dateParts(show.date);
        return (
          <li key={id} className="row-item">
            {d && (
              <span aria-hidden="true" style={{ width: 60, flex: 'none', textAlign: 'center', background: 'var(--ink)', color: 'var(--paper)', padding: '6px 0' }}>
                <span className="meta" style={{ display: 'block' }}>{d.mon}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.05 }}>{d.day}</span>
              </span>
            )}
            <span className="row-item__main">
              <span className="row-item__title">{show.name}</span>
              <span className="row-item__sub">
                {[d?.year, show.totalSongs ? `${show.totalSongs} songs` : null, show.recordingCount ? `${show.recordingCount} recording${show.recordingCount === 1 ? '' : 's'}` : null].filter(Boolean).join(' · ')}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
