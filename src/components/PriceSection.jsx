import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getListings, getPriceHistory, startConversation } from '../api/market';
import { apiErrorDetail } from '../api/collection';
import { useApi } from '../hooks/useApi';
import { useAuthStore } from '../store/authStore';
import { accountsEnabled } from '../config/features';
import { EmptyState, ErrorNote, Loading } from './Feedback';
import { conditionLabel, formatDate, formatMoney, handoffLabel } from '../lib/format';
import { collectorPath, normalizeHandle } from '../lib/handles';

// The poster page's Prices section: what collectors paid in confirmed trades
// here, and copies for sale right now.
export default function PriceSection({ poster }) {
  const history = useApi(() => getPriceHistory(poster.id), [poster.id]);
  const listings = useApi(() => getListings(poster.id), [poster.id]);

  return (
    <section id="prices" className="section--deep">
      <div className="container section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Prices</h2>
            <p className="section__sub">What collectors paid in confirmed trades here. Not an appraisal.</p>
          </div>
        </div>
        <div className="split" style={{ alignItems: 'stretch' }}>
          <div className="split__main">
            <History state={history} />
          </div>
          <div className="split__side">
            <ForSale state={listings} />
          </div>
        </div>
      </div>
    </section>
  );
}

function History({ state }) {
  if (state.loading) return <Loading label="Loading prices" />;
  if (state.error) return <ErrorNote onRetry={state.reload}>We couldn&apos;t load the price history.</ErrorNote>;
  const { points, summary } = state.data;
  const release = summary.releasePrice;

  if (summary.countAll === 0) {
    return (
      <EmptyState title="No sales yet">
        Price history starts with the first confirmed trade between collectors on The Art Exchange.
        {release ? ` It sold for ${formatMoney(release)} originally.` : ''}
      </EmptyState>
    );
  }

  const last = summary.lastSale;
  const multiple = last && release ? (last.price / release).toFixed(1).replace(/\.0$/, '') : null;
  const stats = [
    { k: 'Last sale', v: formatMoney(last?.price), note: last ? formatDate(last.date) : '', lead: true },
    { k: 'Median', v: formatMoney(summary.median12m) ?? '—', note: `${summary.count12m} sale${summary.count12m === 1 ? '' : 's'} in 12 months` },
    { k: 'Range', v: summary.low12m != null ? `${formatMoney(summary.low12m)}–${formatMoney(summary.high12m)}` : '—', note: '12 months' },
    { k: 'Since release', v: multiple ? `${multiple}×` : '—', note: release ? `vs. ${formatMoney(release)} originally` : 'No original price on file' },
  ];

  return (
    <div className="stack">
      <div className="price-stats">
        {stats.map((s) => (
          <div key={s.k} className={`price-stat${s.lead ? ' price-stat--lead' : ''}`}>
            <div className="label">{s.k}</div>
            <div className="price-stat__v">{s.v}</div>
            <div className="body-s">{s.note}</div>
          </div>
        ))}
      </div>
      <SalesChart points={points} release={release} />
    </div>
  );
}

// One bar per sale, oldest to newest; the original price as the first bar.
function SalesChart({ points, release }) {
  const shown = points.slice(-16);
  const bars = [...(release ? [{ date: null, price: release, release: true }] : []), ...shown];
  const top = niceMax(Math.max(...bars.map((b) => b.price)));
  const ticks = [top, top * 0.75, top * 0.5, top * 0.25, 0];
  const label = `${shown.length} sale${shown.length === 1 ? '' : 's'}, from ${formatMoney(Math.min(...shown.map((p) => p.price)))} to ${formatMoney(Math.max(...shown.map((p) => p.price)))}${release ? `; originally ${formatMoney(release)}` : ''}.`;

  return (
    <figure className="tax-panel price-chart" style={{ margin: 0 }}>
      <figcaption className="label">Sale price, one bar per sale{points.length > shown.length ? ` (latest ${shown.length})` : ''}</figcaption>
      <div className="price-chart__plot" role="img" aria-label={label}>
        <div className="price-chart__axis" aria-hidden="true">
          {ticks.map((t) => <span key={t}>{formatMoney(Math.round(t))}</span>)}
        </div>
        <div className="price-chart__bars">
          {bars.map((b, i) => (
            <div key={i} className="price-chart__col" title={`${b.release ? 'Original price' : formatDate(b.date)}: ${formatMoney(b.price)}${b.edition ? ` · ${b.edition}` : ''}`}>
              <span className="price-chart__value">{formatMoney(Math.round(b.price))}</span>
              <span className={`price-chart__bar${b.release ? ' price-chart__bar--release' : ''}`} style={{ height: `${(b.price / top) * 100}%` }} />
              <span className="price-chart__date">{b.release ? 'Release' : shortDate(b.date)}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="body-s cluster" style={{ margin: 0 }}>
        <span className="cluster" style={{ gap: 6 }}><span className="price-chart__key" aria-hidden="true" />Collector sale</span>
        {release && <span className="cluster" style={{ gap: 6 }}><span className="price-chart__key price-chart__key--release" aria-hidden="true" />Original price</span>}
      </p>
    </figure>
  );
}

function niceMax(n) {
  if (!n || n <= 0) return 100;
  const step = n > 500 ? 100 : n > 100 ? 50 : 10;
  return Math.ceil((n * 1.1) / step) * step;
}

function shortDate(iso) {
  const d = formatDate(iso);
  if (!d) return '';
  const [mon, , year] = d.replace(',', '').split(' ');
  return `${mon} ’${year.slice(2)}`;
}

function ForSale({ state }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [opening, setOpening] = useState(null);
  const [error, setError] = useState(null);

  if (state.loading) return <Loading label="Loading copies for sale" />;
  if (state.error) return <ErrorNote onRetry={state.reload}>We couldn&apos;t load copies for sale.</ErrorNote>;
  const { listings, total } = state.data;
  const mineHandle = user?.handle && normalizeHandle(user.handle);

  // Opens the conversation about this copy (a new one, or the one you
  // already have) and goes to it.
  const message = async (listing) => {
    setOpening(listing.id);
    setError(null);
    try {
      const conversation = await startConversation(listing.id);
      navigate(`/messages/${conversation.id}`);
    } catch (err) {
      setError({ id: listing.id, text: apiErrorDetail(err) || "We couldn't open that conversation. Try again." });
      setOpening(null);
    }
  };

  return (
    <div className="tax-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="tax-panel__head">
        <h3 className="display-s">For sale now</h3>
        <span className="label">{total} cop{total === 1 ? 'y' : 'ies'}</span>
      </div>
      {listings.length === 0 && (
        <div className="tax-panel__body"><p className="muted" style={{ margin: 0 }}>Nobody has this one listed right now.</p></div>
      )}
      <ul className="listing-list">
        {listings.map((l) => {
          const mine = mineHandle && normalizeHandle(l.sellerHandle) === mineHandle;
          return (
            <li key={l.id}>
              <div className="cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <span style={{ minWidth: 0 }}>
                  <strong>{l.askingPrice != null ? formatMoney(l.askingPrice) : 'Make an offer'}</strong>{' '}
                  <span className="meta">{[l.editionNumber, conditionLabel(l.condition)].filter(Boolean).join(' · ')}</span>
                  <span className="body-s muted" style={{ display: 'block' }}>
                    <Link to={collectorPath(l.sellerHandle)}>@{l.sellerHandle}</Link>
                    {handoffLabel(l.handoff) ? ` · ${handoffLabel(l.handoff)}` : ''}
                  </span>
                </span>
                {mine && <span className="tax-sticker tax-sticker--ink">Yours</span>}
              </div>
              {accountsEnabled && !mine && (
                user
                  ? (
                    <button type="button" className="tax-btn tax-btn--primary" style={{ width: '100%', minHeight: 44, marginTop: 'var(--space-3)' }} disabled={opening === l.id} onClick={() => message(l)}>
                      {opening === l.id ? 'Opening…' : `Message @${l.sellerHandle}`}
                    </button>
                  )
                  : (
                    <Link to="/signin" state={{ from: location.pathname }} className="tax-btn tax-btn--primary" style={{ width: '100%', minHeight: 44, marginTop: 'var(--space-3)' }}>
                      Message @{l.sellerHandle}
                    </Link>
                  )
              )}
              {error?.id === l.id && <div className="tax-alert tax-alert--error" role="alert" style={{ marginTop: 'var(--space-2)' }}>{error.text}</div>}
            </li>
          );
        })}
      </ul>
      <div className="tax-panel__body" style={{ marginTop: 'auto', borderTop: 'var(--border-heavy) solid var(--ink)' }}>
        <p className="body-s muted" style={{ margin: 0 }}>Only collectors whose For sale list is public appear here. Messages stay on The Art Exchange; nobody&apos;s email is shared.</p>
      </div>
    </div>
  );
}
