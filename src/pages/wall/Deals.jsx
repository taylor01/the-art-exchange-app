import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelTrade, confirmTrade, listInquiries, listTrades, recordTrade, setInquiryStatus } from '../../api/market';
import { apiErrorDetail } from '../../api/collection';
import { useApi } from '../../hooks/useApi';
import PosterArt from '../../components/PosterArt';
import { EmptyState, ErrorNote, Loading } from '../../components/Feedback';
import { conditionLabel, formatDate, formatMoney, handoffLabel } from '../../lib/format';
import { collectorPath } from '../../lib/handles';

const TRANSITION_LABELS = { accepted: 'Accept', declined: 'Decline', withdrawn: 'Withdraw', cancelled: 'Call it off' };
const STATUS_LABELS = { pending: 'Waiting for a reply', accepted: 'Accepted', declined: 'Declined', withdrawn: 'Withdrawn', completed: 'Traded', cancelled: 'Closed' };

function closedLine(inquiry) {
  const who = inquiry.counterpartHandle ? `@${inquiry.counterpartHandle}` : 'The other collector';
  switch (inquiry.closedReason) {
    case 'copy_sold': return 'This copy sold.';
    case 'account_deleted': return "This collector's account was deleted.";
    case 'cancelled_by_buyer': return inquiry.role === 'buyer' ? 'You called it off.' : `${who} called it off.`;
    case 'cancelled_by_seller': return inquiry.role === 'seller' ? 'You called it off.' : `${who} called it off.`;
    default: return null;
  }
}

// Inquiries and trades: asking, accepting, recording and confirming a trade.
export default function Deals() {
  const [role, setRole] = useState('received');
  const inquiries = useApi(() => listInquiries({ role }), [role]);
  const trades = useApi(() => listTrades(), ['trades']);
  const refresh = () => { inquiries.reload(); trades.reload(); };

  const allTrades = trades.data || [];
  const waitingOnMe = allTrades.filter((t) => t.status === 'pending_confirmation' && t.allowed.includes('confirm'));
  const confirmed = allTrades.filter((t) => t.status === 'confirmed');
  const tradeFor = (inquiryId) => allTrades.find((t) => t.inquiryId === inquiryId && t.status !== 'cancelled');

  return (
    <div className="stack" style={{ gap: 'var(--space-7)' }}>
      {waitingOnMe.length > 0 && (
        <section className="stack">
          <h2 className="display-s">Confirm {waitingOnMe.length === 1 ? 'this trade' : 'these trades'}</h2>
          {waitingOnMe.map((t) => <ConfirmTrade key={t.id} trade={t} onDone={refresh} />)}
        </section>
      )}

      <section className="stack">
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <h2 className="display-s">Inquiries</h2>
          <div className="tax-tabs" role="tablist" aria-label="Inquiries" style={{ minWidth: 300 }}>
            <button type="button" className="tax-tab" role="tab" aria-selected={role === 'received'} onClick={() => setRole('received')}>About my copies</button>
            <button type="button" className="tax-tab" role="tab" aria-selected={role === 'sent'} onClick={() => setRole('sent')}>I asked</button>
          </div>
        </div>
        {inquiries.loading && <Loading label="Loading inquiries" />}
        {inquiries.error && <ErrorNote onRetry={inquiries.reload}>We couldn&apos;t load your inquiries.</ErrorNote>}
        {!inquiries.loading && !inquiries.error && inquiries.data.length === 0 && (
          <EmptyState title={role === 'received' ? 'No one has asked yet' : "You haven't asked about anything"}>
            {role === 'received'
              ? 'When collectors ask about a copy you have for sale, it shows up here.'
              : 'Press Ask on a copy for sale on any poster page.'}
          </EmptyState>
        )}
        {!inquiries.loading && !inquiries.error && inquiries.data.map((i) => (
          <InquiryRow key={i.id} inquiry={i} trade={tradeFor(i.id)} onChange={refresh} />
        ))}
      </section>

      {confirmed.length > 0 && (
        <section className="stack">
          <h2 className="display-s">Completed trades</h2>
          <ul className="row-list">
            {confirmed.map((t) => (
              <li key={t.id} className="row-item">
                <span className="row-item__main">
                  <span className="row-item__title">{t.poster?.band?.name || t.poster?.name} · {formatMoney(t.price)}</span>
                  <span className="row-item__sub">
                    {t.role === 'seller' ? 'Sold to' : 'Bought from'} {t.counterpartHandle ? `@${t.counterpartHandle}` : 'a former collector'} · {formatDate(t.confirmedAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PosterThumb({ poster }) {
  if (!poster) return null;
  return (
    <Link to={poster.path} style={{ width: 64, flex: 'none', display: 'block' }} aria-label={`${poster.band?.name || poster.name} poster page`}>
      <span className="tax-poster__frame" style={{ display: 'block', borderWidth: 2 }}><PosterArt poster={poster} size="small" alt="" /></span>
    </Link>
  );
}

function InquiryRow({ inquiry, trade, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const who = inquiry.counterpartHandle;

  const transition = async (status) => {
    setBusy(true);
    setError('');
    try {
      await setInquiryStatus(inquiry.id, status);
      onChange();
    } catch (err) {
      setError(apiErrorDetail(err) || "That didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = inquiry.copy;
  const details = [copy?.editionNumber, conditionLabel(copy?.condition), copy?.askingPrice != null && `asking ${formatMoney(copy.askingPrice)}`, handoffLabel(copy?.handoff)].filter(Boolean).join(' · ');

  return (
    <article className="tax-panel" style={{ padding: 'var(--space-4) 18px', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
      <PosterThumb poster={inquiry.poster} />
      <div className="stack" style={{ flex: 1, minWidth: 0, gap: 'var(--space-2)' }}>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <strong>{inquiry.poster?.band?.name || inquiry.poster?.name}</strong>
          <span className="meta">{STATUS_LABELS[inquiry.status] || inquiry.status}</span>
        </div>
        {details && <span className="body-s muted">{details}</span>}
        <p className="body" style={{ margin: 0 }}>
          {inquiry.role === 'seller' ? <>{who ? <Link to={collectorPath(who)}>@{who}</Link> : 'A collector'} asked</> : <>You asked {who ? <Link to={collectorPath(who)}>@{who}</Link> : 'the seller'}</>}
          {inquiry.offer != null ? `, offering ${formatMoney(inquiry.offer)}` : ''}.
          {inquiry.message && <span style={{ display: 'block', marginTop: 4 }}>&ldquo;{inquiry.message}&rdquo;</span>}
        </p>
        {closedLine(inquiry) && <p className="body-s muted" style={{ margin: 0 }}>{closedLine(inquiry)}</p>}
        {inquiry.counterpartEmail && (
          <p className="tax-alert tax-alert--note" style={{ margin: 0 }}>
            Work out the details with @{who}: <a href={`mailto:${inquiry.counterpartEmail}`}>{inquiry.counterpartEmail}</a>
          </p>
        )}
        {trade && trade.status === 'pending_confirmation' && !trade.allowed.includes('confirm') && (
          <p className="body-s" style={{ margin: 0, fontWeight: 700 }}>Trade recorded at {formatMoney(trade.price)}. Waiting for @{who} to confirm.</p>
        )}
        {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
        <div className="cluster">
          {inquiry.status === 'accepted' && !trade && !recording && (
            <button type="button" className="tax-btn tax-btn--primary" onClick={() => setRecording(true)}>Record the trade</button>
          )}
          {/* While a trade is pending, cancelling the trade is the only way out. */}
          {!(trade && trade.status === 'pending_confirmation') && inquiry.allowed.map((t) => (
            <button key={t} type="button" className={t === 'accepted' ? 'tax-btn tax-btn--ink' : 'tax-btn tax-btn--secondary'} disabled={busy} onClick={() => transition(t)}>
              {TRANSITION_LABELS[t] || t}
            </button>
          ))}
          {trade && trade.allowed.includes('cancel') && !trade.allowed.includes('confirm') && (
            <CancelTrade trade={trade} onDone={onChange} />
          )}
        </div>
        {recording && <RecordTrade inquiry={inquiry} onDone={() => { setRecording(false); onChange(); }} onClose={() => setRecording(false)} />}
      </div>
    </article>
  );
}

// What happens to each person's wall when the trade is confirmed.
function WallChoice({ role, move, setMove, removeCopy, setRemoveCopy, idBase }) {
  return (
    <fieldset className="stack" style={{ border: 'none', margin: 0, padding: 0, gap: 'var(--space-2)' }}>
      <legend className="tax-label" style={{ marginBottom: 'var(--space-2)' }}>Your wall</legend>
      <label className="cluster" style={{ gap: 10, flexWrap: 'nowrap' }}>
        <input type="checkbox" checked={move} onChange={(e) => setMove(e.target.checked)} style={{ width: 20, height: 20, margin: 0, accentColor: 'var(--ink)' }} />
        {role === 'seller' ? 'Update my wall when the trade is confirmed' : 'Put it on my wall when the trade is confirmed'}
      </label>
      {role === 'seller' && move && (
        <div className="cluster" role="radiogroup" aria-label="What to do with your copy" style={{ paddingLeft: 30 }}>
          <label className="cluster" style={{ gap: 8 }}>
            <input type="radio" name={`${idBase}-copy`} checked={!removeCopy} onChange={() => setRemoveCopy(false)} /> Mark it as sold
          </label>
          <label className="cluster" style={{ gap: 8 }}>
            <input type="radio" name={`${idBase}-copy`} checked={removeCopy} onChange={() => setRemoveCopy(true)} /> Remove it from my wall
          </label>
        </div>
      )}
      <span className="body-s muted">
        {role === 'seller' ? 'Either way, the copy comes off sale once the trade is confirmed.' : 'It replaces this poster on your hunt list, if it’s there.'}
      </span>
    </fieldset>
  );
}

function RecordTrade({ inquiry, onDone, onClose }) {
  const suggested = inquiry.offer ?? inquiry.copy?.askingPrice ?? '';
  const [price, setPrice] = useState(suggested === '' ? '' : String(suggested));
  const [move, setMove] = useState(true);
  const [removeCopy, setRemoveCopy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await recordTrade({ inquiryId: inquiry.id, priceDollars: price.replace(/[$,\s]/g, ''), moveCopy: move, removeCopy: inquiry.role === 'seller' && move && removeCopy });
      onDone();
    } catch (err) {
      setError(apiErrorDetail(err) || "That didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack" style={{ borderTop: 'var(--border-light) solid var(--ink)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }} onSubmit={submit} noValidate>
      <p className="body-s" style={{ margin: 0 }}>
        Record what you agreed once the poster has changed hands. @{inquiry.counterpartHandle} confirms the same price, then it counts.
      </p>
      <div className="tax-field" style={{ maxWidth: 240 }}>
        <label className="tax-label" htmlFor={`price-${inquiry.id}`}>Price paid</label>
        <input id={`price-${inquiry.id}`} className="tax-input" inputMode="decimal" placeholder="$" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <WallChoice role={inquiry.role} move={move} setMove={setMove} removeCopy={removeCopy} setRemoveCopy={setRemoveCopy} idBase={`rec-${inquiry.id}`} />
      {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
      <div className="cluster">
        <button type="submit" className="tax-btn tax-btn--ink" disabled={busy || !price.trim()}>{busy ? 'Saving…' : 'Record the trade'}</button>
        <button type="button" className="tax-btn tax-btn--text" onClick={onClose}>Not yet</button>
      </div>
    </form>
  );
}

function ConfirmTrade({ trade, onDone }) {
  const [move, setMove] = useState(true);
  const [removeCopy, setRemoveCopy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await confirmTrade(trade.id, { priceDollars: trade.price, moveCopy: move, removeCopy: trade.role === 'seller' && move && removeCopy });
      onDone();
    } catch (err) {
      setError(apiErrorDetail(err) || "That didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const who = trade.counterpartHandle ? `@${trade.counterpartHandle}` : 'The other collector';
  return (
    <article className="tax-panel" style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', boxShadow: 'var(--shadow-md)' }}>
      <PosterThumb poster={trade.poster} />
      <div className="stack" style={{ flex: 1, minWidth: 0 }}>
        <p className="body" style={{ margin: 0 }}>
          {who} recorded {trade.role === 'buyer' ? 'selling you' : 'buying'} <strong>{trade.poster?.band?.name || trade.poster?.name}</strong>
          {[trade.editionType, trade.editionNumber].filter(Boolean).length ? ` (${[trade.editionType, trade.editionNumber].filter(Boolean).join(' ')})` : ''} for
        </p>
        <p className="display-m" style={{ margin: 0 }}>{formatMoney(trade.price)}</p>
        <p className="body-s muted" style={{ margin: 0 }}>Confirm only if that&apos;s what was paid. If it isn&apos;t, call it off and record it again with the right price.</p>
        <WallChoice role={trade.role} move={move} setMove={setMove} removeCopy={removeCopy} setRemoveCopy={setRemoveCopy} idBase={`conf-${trade.id}`} />
        {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
        <div className="cluster">
          <button type="button" className="tax-btn tax-btn--primary" disabled={busy} onClick={confirm}>Confirm {formatMoney(trade.price)}</button>
          {trade.allowed.includes('cancel') && <CancelTrade trade={trade} onDone={onDone} label="That's not right" />}
        </div>
      </div>
    </article>
  );
}

function CancelTrade({ trade, onDone, label = 'Cancel the trade' }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="tax-btn tax-btn--secondary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await cancelTrade(trade.id); } catch { /* the list reload shows the real state */ }
        setBusy(false);
        onDone();
      }}
    >
      {label}
    </button>
  );
}
