import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPoster, getRecordings, getSetlist, getShow, searchPosters } from '../api/catalog';
import { createCopy, getShowMark, listCopies, markShow, updateCopy } from '../api/collection';
import { useApi } from '../hooks/useApi';
import { useAuthStore } from '../store/authStore';
import { accountsEnabled } from '../config/features';
import PosterArt from '../components/PosterArt';
import PosterCard from '../components/PosterCard';
import Switch from '../components/Switch';
import { EmptyState, ErrorNote, Loading } from '../components/Feedback';
import { conditionLabel, formatDate, formatMoney } from '../lib/format';

export default function PosterDetail() {
  const { id } = useParams();
  const location = useLocation();
  const backTo = location.state?.from || '/gallery';
  const { data: poster, error, loading, reload } = useApi(() => getPoster(id), [id]);

  if (loading) return <div className="container"><Loading label="Loading poster" /></div>;
  if (error || !poster) {
    const missing = error?.response?.status === 404;
    return (
      <div className="container section">
        <ErrorNote onRetry={missing ? undefined : reload}>
          {missing ? "We couldn't find that poster." : "We couldn't load this poster."}
        </ErrorNote>
        <p><Link to={backTo}>← Back to the archive</Link></p>
      </div>
    );
  }

  return <PosterPage poster={poster} backTo={backTo} />;
}

function PosterPage({ poster, backTo }) {
  const { user } = useAuthStore();
  const signedIn = accountsEnabled && Boolean(user);
  const showId = poster.showId;
  const venue = poster.venue;
  const artist = poster.artists[0];

  const show = useApi(() => (showId ? getShow(showId) : null), [showId]);
  const setlist = useApi(() => (showId ? getSetlist(showId) : []), [showId]);
  const recordings = useApi(() => (showId ? getRecordings(showId) : []), [showId]);
  const venueMore = useApi(() => (venue ? searchPosters({ venue_id: venue.id, per_page: 5 }) : null), [venue?.id]);
  const artistMore = useApi(() => (artist ? searchPosters({ artist_ids: [artist.id], per_page: 5 }) : null), [artist?.id]);

  const sameShow = (show.data?.posters || []).filter((p) => p.id !== poster.id);
  const fromVenue = (venueMore.data?.posters || []).filter((p) => p.id !== poster.id).slice(0, 4);
  const byArtist = (artistMore.data?.posters || []).filter((p) => p.id !== poster.id).slice(0, 4);
  const showDate = show.data?.date || poster.show?.date;
  const title = poster.band?.name || poster.name;

  const specs = [
    ['Artist', poster.artists.map((a) => a.name).join(', ')],
    ['Edition', poster.editionSize ? `${poster.editionSize}` : null],
    ['Year', poster.year],
    ['Show', showDate ? formatDate(showDate) : null],
    ['Original price', formatMoney(poster.priceDollars)],
    ['Series', poster.series.map((s) => s.name).join(', ')],
  ].filter(([, v]) => v);

  return (
    <>
      <nav className="container breadcrumb" aria-label="Breadcrumb">
        <Link to={backTo}>Archive</Link>
        {poster.band && <> / <Link to={`/gallery?band=${poster.band.id}`}>{poster.band.name}</Link></>}
        {' / '}<span aria-current="page">{[venue?.name, poster.year].filter(Boolean).join(' ')}</span>
      </nav>

      <section className="container poster-hero">
        <div className="poster-hero__media">
          <div className="poster-hero__well">
            <div className="tax-poster__frame">
              <PosterArt poster={poster} size="large" />
            </div>
            {poster.editionSize && (
              <span className="tax-sticker tax-sticker--tilt" style={{ position: 'absolute', top: 14, right: 14, fontSize: 13 }}>
                Run of {poster.editionSize}
              </span>
            )}
          </div>
        </div>

        <div className="poster-hero__info">
          <div>
            <p className="eyebrow">{[showDate ? formatDate(showDate) : poster.year, venue?.name].filter(Boolean).join(' · ')}</p>
            <h1 className="poster-hero__title">{title}</h1>
            {poster.band && poster.name && poster.name !== poster.band.name && (
              <p className="body-l" style={{ margin: '12px 0 0', fontWeight: 700 }}>{poster.name}</p>
            )}
            {poster.description && <p className="body-l muted" style={{ margin: '12px 0 0' }}>{poster.description}</p>}
          </div>

          {specs.length > 0 && (
            <dl className="tax-specs">
              {specs.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          )}

          {accountsEnabled && <WallActions poster={poster} signedIn={signedIn} />}

          <nav className="jump-links" aria-label="On this page">
            <a href="#prices">Prices</a>
            {showId && <a href="#show">Setlist</a>}
            {venue && <a href="#venue">Venue</a>}
            {artist && <a href="#artist">Artist</a>}
          </nav>
        </div>
      </section>

      {sameShow.length > 0 && (
        <section className="container section section--band">
          <div className="section__head">
            <h2 className="section__title">Also from this show</h2>
            <p className="section__sub" style={{ margin: 0 }}>Variants and other prints from the same night.</p>
          </div>
          <div className="poster-grid poster-grid--small">
            {sameShow.map((p) => <PosterCard key={p.id} poster={p} />)}
          </div>
        </section>
      )}

      <section id="prices" className="section--deep">
        <div className="container section">
          <div className="section__head">
            <div>
              <h2 className="section__title">Prices</h2>
              <p className="section__sub">What collectors paid in completed trades here. Not an appraisal.</p>
            </div>
          </div>
          <EmptyState title="No sales yet">
            Price history starts with the first trade between collectors on The Art Exchange.
            {poster.priceDollars ? ` It sold for ${formatMoney(poster.priceDollars)} originally.` : ''}
          </EmptyState>
        </div>
      </section>

      {showId && (
        <section id="show" className="container section">
          <div className="split">
            <div className="split__main">
              <div className="section__head">
                <h2 className="section__title">The setlist</h2>
                {setlist.data?.length > 0 && <span className="label">{setlist.data.length} songs</span>}
              </div>
              <Setlist state={setlist} />
            </div>
            <aside className="split__side stack">
              <h3 className="display-s">Recordings</h3>
              <Recordings state={recordings} />
              {signedIn && <WasThere showId={showId} />}
            </aside>
          </div>
        </section>
      )}

      {venue && (
        <section id="venue" className="section--deep">
          <div className="container section split">
            <div className="split__side stack">
              <p className="eyebrow" style={{ margin: 0 }}>The venue</p>
              <h2 className="section__title">{venue.name}</h2>
              <p className="body-l muted" style={{ margin: 0 }}>
                {[venue.city, venue.region, venue.country].filter(Boolean).join(', ')}
                {venue.venueType ? ` · ${venue.venueType}` : ''}
              </p>
              {venue.address && <p className="body-s" style={{ margin: 0 }}>{venue.address}</p>}
              <div className="cluster">
                <Link to={`/gallery?venue=${venue.id}`} style={{ fontWeight: 700 }}>Every poster from here →</Link>
                {venue.website && <a href={venue.website} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>Venue site ↗</a>}
              </div>
            </div>
            <div className="split__main">
              <h3 className="label" style={{ marginBottom: 'var(--space-4)' }}>More from this venue</h3>
              {venueMore.loading ? <Loading /> : fromVenue.length > 0 ? (
                <div className="poster-grid poster-grid--small">{fromVenue.map((p) => <PosterCard key={p.id} poster={p} />)}</div>
              ) : <p className="muted">This is the only poster from {venue.name} in the archive so far.</p>}
            </div>
          </div>
        </section>
      )}

      {artist && (
        <section id="artist" className="container section split">
          <div className="split__side stack">
            <p className="eyebrow" style={{ margin: 0 }}>The artist</p>
            <div className="cluster">
              <span className="tax-initials" style={{ width: 72, height: 72, fontSize: 28, background: 'var(--signal-hunt)', boxShadow: 'var(--shadow-md)' }} aria-hidden="true">
                {artist.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              <h2 className="section__title">{artist.name}</h2>
            </div>
            <div className="cluster">
              <Link to={`/gallery?artist=${artist.id}`} className="tax-btn tax-btn--secondary">All their posters</Link>
              {artist.website && <a href={artist.website} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>Artist&apos;s site ↗</a>}
            </div>
          </div>
          <div className="split__main">
            <h3 className="label" style={{ marginBottom: 'var(--space-4)' }}>More by {artist.name}</h3>
            {artistMore.loading ? <Loading /> : byArtist.length > 0 ? (
              <div className="poster-grid poster-grid--small">{byArtist.map((p) => <PosterCard key={p.id} poster={p} />)}</div>
            ) : <p className="muted">No other posters by {artist.name} in the archive yet.</p>}
          </div>
        </section>
      )}
    </>
  );
}

function Setlist({ state }) {
  if (state.loading) return <Loading label="Loading setlist" />;
  if (state.error) return <ErrorNote onRetry={state.reload}>We couldn&apos;t load the setlist.</ErrorNote>;
  const songs = state.data || [];
  if (songs.length === 0) return <EmptyState title="No setlist yet">Nobody has added the setlist for this show.</EmptyState>;
  const main = songs.filter((s) => s.set === 'main');
  const encore = songs.filter((s) => s.set === 'encore');
  return (
    <ol className="setlist">
      {main.map((s) => (
        <li key={s.id}>
          <span className="setlist__n">{s.position}</span>
          <span className="setlist__title">{s.title}</span>
          {s.note && <span className="setlist__note">{s.note}</span>}
        </li>
      ))}
      {encore.length > 0 && <li className="setlist__break" aria-hidden="true">Encore</li>}
      {encore.map((s) => (
        <li key={s.id}>
          <span className="setlist__n">E{s.position}</span>
          <span className="setlist__title">{s.title}</span>
          {s.note && <span className="setlist__note">{s.note}</span>}
        </li>
      ))}
    </ol>
  );
}

function Recordings({ state }) {
  if (state.loading) return <Loading label="Loading recordings" />;
  if (state.error) return <ErrorNote onRetry={state.reload}>We couldn&apos;t load recordings.</ErrorNote>;
  const items = state.data || [];
  if (items.length === 0) return <p className="muted" style={{ margin: 0 }}>No recordings of this show yet.</p>;
  return (
    <ul className="row-list">
      {items.map((r) => (
        <li key={r.id} className="row-item">
          <span className="row-item__main">
            <span className="row-item__title">{r.title}</span>
            <span className="row-item__sub">
              {[r.duration, r.trackCount ? `${r.trackCount} tracks` : null, r.quality, r.taper && `Taped by ${r.taper}`].filter(Boolean).join(' · ')}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// "Add to my wall" / "Hunt it" and, once there, the collector's copy.
function WallActions({ poster, signedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const mine = useApi(() => (signedIn ? listCopies({ poster_id: poster.id }) : null), [signedIn, poster.id]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  const copies = (mine.data?.copies || []).filter((c) => c.poster?.id === poster.id);
  const owned = copies.find((c) => c.status === 'owned');
  const wanted = copies.find((c) => c.status === 'wanted');

  const act = async (fn) => {
    if (!signedIn) {
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }
    setBusy(true);
    setProblem('');
    try {
      await fn();
      mine.reload();
    } catch {
      setProblem("That didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (signedIn && mine.loading) return <Loading label="Checking your wall" />;

  return (
    <div className="stack">
      {owned && (
        <div className="tax-alert tax-alert--ink cluster" style={{ justifyContent: 'space-between' }}>
          <span>
            <span className="tax-sticker" style={{ marginRight: 12 }}>On your wall</span>
            {[owned.editionNumber && `#${owned.editionNumber}`, conditionLabel(owned.condition), owned.forSale && 'listed for sale'].filter(Boolean).join(' · ') || 'Add your edition and condition'}
          </span>
          <Link to={`/wall/${owned.id}`} style={{ color: 'var(--paper)', fontWeight: 700 }}>Manage your copy →</Link>
        </div>
      )}
      {!owned && wanted && (
        <div className="tax-alert tax-alert--note">
          <strong>On your hunt list.</strong> We&apos;ll keep it there until you find one.
        </div>
      )}
      {problem && <ErrorNote>{problem}</ErrorNote>}
      <div className="cluster">
        {!owned && !wanted && (
          <>
            <button type="button" className="tax-btn tax-btn--primary tax-btn--lg" disabled={busy} onClick={() => act(() => createCopy({ poster_id: poster.id, status: 'owned' }))}>
              Put it on my wall
            </button>
            <button type="button" className="tax-btn tax-btn--secondary tax-btn--lg" disabled={busy} onClick={() => act(() => createCopy({ poster_id: poster.id, status: 'wanted' }))}>
              Hunt it
            </button>
          </>
        )}
        {!owned && wanted && (
          <button type="button" className="tax-btn tax-btn--primary tax-btn--lg" disabled={busy} onClick={() => act(() => updateCopy(wanted.id, { status: 'owned' }))}>
            Got it — move to my wall
          </button>
        )}
        <a href="mailto:hello@theartexch.com?subject=Poster%20correction" className="tax-btn tax-btn--text">Suggest a correction</a>
      </div>
    </div>
  );
}

// "I was there" for the show behind this poster.
function WasThere({ showId }) {
  const mark = useApi(() => getShowMark(showId), [showId]);
  const [saving, setSaving] = useState(false);
  const attended = mark.data?.attendance === 'attended';

  const toggle = async (next) => {
    setSaving(true);
    try {
      const saved = await markShow(showId, { attendance_status: next ? 'attended' : 'missed' });
      mark.update(() => saved);
    } catch {
      mark.reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tax-panel" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <span style={{ flex: 1 }}><strong>I was at this show</strong><br /><span className="body-s muted">Adds it to your show history</span></span>
      <Switch checked={attended} onChange={toggle} label="I was at this show" disabled={saving || mark.loading} />
    </div>
  );
}
