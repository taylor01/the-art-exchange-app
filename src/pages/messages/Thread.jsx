import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelTrade, closeConversation, confirmTrade, getConversation, listMessages, markRead, recordTrade, reportConversation, sendMessage,
} from '../../api/market';
import { apiErrorDetail } from '../../api/collection';
import { useUnreadStore } from '../../store/unreadStore';
import PosterArt from '../../components/PosterArt';
import WallChoice from '../../components/WallChoice';
import { Loading } from '../../components/Feedback';
import { conditionLabel, formatMoney, handoffLabel } from '../../lib/format';
import { collectorPath } from '../../lib/handles';
import { closedLine, posterTitle, shortTime } from './util';

const POLL_MS = 10000;

// One conversation: the messages, the Mark sold / Confirm card, and the
// box to reply. It refreshes while it's on screen; there are no live updates.
export default function Thread({ id, onChanged }) {
  const [convo, setConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [panel, setPanel] = useState(null); // 'mark' | 'report' | null
  const lastId = useRef(null);
  const bodyRef = useRef(null);
  const refreshUnread = useUnreadStore((s) => s.refresh);

  // Fetches the conversation and any messages newer than the last one shown,
  // then marks it read up to the newest one shown.
  const sync = useCallback(async () => {
    const after = lastId.current;
    const [c, page] = await Promise.all([getConversation(id), listMessages(id, after ? { after } : {})]);
    setConvo(c);
    if (page.messages.length) {
      lastId.current = page.messages[page.messages.length - 1].id;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...page.messages.filter((m) => !seen.has(m.id))];
      });
    }
    if (c.unread || (after && page.messages.length)) {
      try { await markRead(id, lastId.current); } catch { /* it stays unread; nothing to show */ }
      refreshUnread();
      onChanged?.();
    }
  }, [id, onChanged, refreshUnread]);

  useEffect(() => {
    let live = true;
    sync().catch((err) => { if (live) setError(err); });
    const poll = () => { if (document.visibilityState === 'visible') sync().catch(() => {}); };
    const timer = setInterval(poll, POLL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => { live = false; clearInterval(timer); document.removeEventListener('visibilitychange', poll); };
  }, [sync]);

  // Keep the newest message in view.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, convo?.trade?.status]);

  // After an action: show its result now, then tell the list.
  const changed = useCallback(async () => {
    setPanel(null);
    try { await sync(); } catch { /* the next poll catches up */ }
    onChanged?.();
  }, [sync, onChanged]);

  if (error) {
    const missing = error?.response?.status === 404;
    return <p className="thread__empty" role="alert">{missing ? "This conversation isn't available." : "We couldn't load this conversation. Try again in a moment."}</p>;
  }
  if (!convo) return <div className="thread__empty"><Loading label="Loading conversation" /></div>;

  const who = convo.counterpartHandle ? `@${convo.counterpartHandle}` : 'Deleted account';
  const copy = convo.copy;
  const details = [copy?.editionNumber, conditionLabel(copy?.condition), copy?.askingPrice != null && `asking ${formatMoney(copy.askingPrice)}`, handoffLabel(copy?.handoff)]
    .filter(Boolean).join(' · ');
  const open = convo.status === 'open';
  const canMark = open && convo.role === 'seller' && !convo.trade && !!copy;
  const timeline = [
    ...messages.map((m) => ({ kind: 'message', at: m.createdAt, m })),
    ...(convo.trade ? [{ kind: 'trade', at: convo.trade.createdAt }] : []),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  return (
    <>
      <div className="thread__head">
        {convo.poster && (
          <Link to={convo.poster.path} className="thumb" aria-label={`${posterTitle(convo.poster)} poster page`}>
            <PosterArt poster={convo.poster} size="small" alt="" />
          </Link>
        )}
        <div className="thread__who">
          <div className="cluster" style={{ gap: 'var(--space-2)' }}>
            {convo.counterpartHandle
              ? <Link to={collectorPath(convo.counterpartHandle)} style={{ fontWeight: 700, fontSize: 18 }}>{who}</Link>
              : <strong style={{ fontSize: 18 }}>{who}</strong>}
            <span className={`tax-sticker${convo.role === 'buyer' ? ' tax-sticker--match' : ' tax-sticker--ink'}`}>
              {convo.role === 'seller' ? 'Wants your copy' : 'You want theirs'}
            </span>
          </div>
          <div className="body-s muted">
            {convo.poster ? <Link to={convo.poster.path}>{posterTitle(convo.poster)}</Link> : 'A poster'}{details ? ` · ${details}` : ''}
          </div>
        </div>
        {canMark && panel !== 'mark' && (
          <button type="button" className="tax-btn tax-btn--primary" onClick={() => setPanel('mark')}>Mark sold to {who}</button>
        )}
        <details className="thread__more">
          <summary className="tax-btn tax-btn--secondary" aria-label="More: close or report">···</summary>
          <div className="stack tax-panel" style={{ position: 'absolute', right: 0, zIndex: 2, padding: 'var(--space-3)', gap: 'var(--space-2)', minWidth: 220 }}>
            {convo.allowed.includes('closed') && <CloseButton id={id} onDone={changed} />}
            <button type="button" className="tax-btn tax-btn--text" onClick={(e) => { e.currentTarget.closest('details').open = false; setPanel('report'); }}>Report this conversation</button>
          </div>
        </details>
      </div>

      {panel === 'mark' && canMark && <MarkSold convo={convo} onDone={changed} onClose={() => setPanel(null)} />}
      {panel === 'report' && <Report id={id} who={who} onClose={() => setPanel(null)} />}

      <ol className="thread__body" ref={bodyRef} aria-label={`Conversation with ${who}`}>
        <li className="thread__note">{convo.role === 'buyer' ? 'You messaged about this copy' : `${who} messaged about your copy`}</li>
        {timeline.length === 0 && (
          <li className="thread__note" style={{ textTransform: 'none', letterSpacing: 0 }}>
            Say what you&apos;re after. {who} sees this conversation once you send a message.
          </li>
        )}
        {timeline.map((item) => (item.kind === 'trade'
          ? <TradeCard key="trade" convo={convo} who={who} onDone={changed} />
          : <Message key={item.m.id} m={item.m} />))}
      </ol>

      {open
        ? <Compose id={id} who={who} onSent={(m) => { lastId.current = m.id; setMessages((prev) => [...prev, m]); onChanged?.(); }} />
        : (
          <div className="thread__locked" role="status">
            {convo.status === 'completed' && convo.trade
              ? `${convo.role === 'seller' ? `Sold to ${who}` : `You bought it from ${who}`} for ${formatMoney(convo.trade.price)}. `
              : `${closedLine(convo)} `}
            The conversation stays here as your record.
          </div>
        )}
    </>
  );
}

function Message({ m }) {
  const gone = m.senderRole === null && !m.fromMe;
  return (
    <li className={`msg${m.fromMe ? ' msg--mine' : ''}${gone ? ' msg--gone' : ''}`}>
      <div className="msg__bubble">{gone ? 'Deleted account' : m.body}</div>
      <span className="msg__time">{shortTime(m.createdAt)}</span>
    </li>
  );
}

// The sale, in the thread: waiting on me (confirm it), waiting on them, or done.
function TradeCard({ convo, who, onDone }) {
  const trade = convo.trade;
  const [move, setMove] = useState(true);
  const [removeCopy, setRemoveCopy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const act = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await onDone();
    } catch (err) {
      setError(apiErrorDetail(err) || "That didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (trade.status === 'confirmed') {
    return (
      <li className="deal-card deal-card--done">
        <span className="meta">Trade confirmed</span>
        <span className="deal-card__price">{formatMoney(trade.price)}</span>
        <span className="body-s">You both confirmed the price.</span>
      </li>
    );
  }

  const mustConfirm = trade.allowed.includes('confirm');
  return (
    <li className="deal-card">
      <span className="meta">{mustConfirm ? `${who} marked this sold${convo.role === 'buyer' ? ' to you' : ''}` : `Waiting for ${who} to confirm`}</span>
      <span className="deal-card__price">{formatMoney(trade.price)}</span>
      {mustConfirm ? (
        <>
          <span className="body-s">Confirm only if that&apos;s what was paid.</span>
          <div style={{ textAlign: 'left' }}>
            <WallChoice role={convo.role} move={move} setMove={setMove} removeCopy={removeCopy} setRemoveCopy={setRemoveCopy} idBase={`confirm-${trade.id}`} />
          </div>
          <span className="cluster" style={{ justifyContent: 'center' }}>
            <button type="button" className="tax-btn tax-btn--primary" disabled={busy}
              onClick={() => act(() => confirmTrade(trade.id, { priceDollars: trade.price, moveCopy: move, removeCopy: convo.role === 'seller' && move && removeCopy }))}>
              Confirm {formatMoney(trade.price)}
            </button>
            {trade.allowed.includes('cancel') && (
              <button type="button" className="tax-btn tax-btn--secondary" disabled={busy} onClick={() => act(() => cancelTrade(trade.id))}>That&apos;s not right</button>
            )}
          </span>
        </>
      ) : (
        <>
          <span className="body-s">{who} confirms the price, then it&apos;s done.</span>
          {trade.allowed.includes('cancel') && (
            <button type="button" className="tax-btn tax-btn--secondary" disabled={busy} onClick={() => act(() => cancelTrade(trade.id))}>Cancel the trade</button>
          )}
        </>
      )}
      {error && <span className="tax-alert tax-alert--error" role="alert">{error}</span>}
    </li>
  );
}

function MarkSold({ convo, onDone, onClose }) {
  const asking = convo.copy?.askingPrice;
  const [price, setPrice] = useState(asking != null ? String(asking) : '');
  const [move, setMove] = useState(true);
  const [removeCopy, setRemoveCopy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const who = `@${convo.counterpartHandle}`;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await recordTrade({ conversationId: convo.id, priceDollars: price.replace(/[$,\s]/g, ''), moveCopy: move, removeCopy: move && removeCopy });
      await onDone();
    } catch (err) {
      setError(apiErrorDetail(err) || "That didn't save. Try again.");
      setBusy(false);
    }
  };

  return (
    <form className="thread__panel stack" onSubmit={submit} noValidate>
      <div className="tax-field" style={{ maxWidth: 220 }}>
        <label className="tax-label" htmlFor={`sold-${convo.id}`}>Sold for</label>
        <input id={`sold-${convo.id}`} className="tax-input" inputMode="decimal" placeholder="$" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <WallChoice role="seller" move={move} setMove={setMove} removeCopy={removeCopy} setRemoveCopy={setRemoveCopy} idBase={`mark-${convo.id}`} />
      <p className="body-s" style={{ margin: 0 }}>{who} confirms the same price in this conversation, then the trade is done.</p>
      {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
      <div className="cluster">
        <button type="submit" className="tax-btn tax-btn--ink" disabled={busy || !price.trim()}>{busy ? 'Sending…' : `Send to ${who} to confirm`}</button>
        <button type="button" className="tax-btn tax-btn--text" onClick={onClose}>Not yet</button>
      </div>
    </form>
  );
}

function Compose({ id, who, onSent }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    setError('');
    try {
      const message = await sendMessage(id, text);
      setBody('');
      onSent(message);
    } catch (err) {
      setError(apiErrorDetail(err) || "That didn't send. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="thread__compose" onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
      <div className="stack" style={{ flex: 1, gap: 'var(--space-2)' }}>
        {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
        <label className="visually-hidden" htmlFor={`compose-${id}`}>Message {who}</label>
        <textarea
          id={`compose-${id}`}
          className="tax-textarea"
          rows={1}
          maxLength={1000}
          placeholder={`Message ${who}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
      </div>
      <button type="submit" className="tax-btn tax-btn--ink" disabled={busy || !body.trim()}>Send</button>
    </form>
  );
}

function CloseButton({ id, onDone }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="tax-btn tax-btn--text"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await closeConversation(id); } catch { /* the refresh shows the real state */ }
        await onDone();
      }}
    >
      Close this conversation
    </button>
  );
}

function Report({ id, who, onClose }) {
  const [reason, setReason] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setState('sending');
    setError('');
    try {
      await reportConversation(id, { reason: reason.trim() });
      setState('sent');
    } catch (err) {
      setError(apiErrorDetail(err) || "That didn't send. Try again.");
      setState('idle');
    }
  };

  if (state === 'sent') {
    return (
      <div className="thread__panel cluster" role="status" style={{ justifyContent: 'space-between' }}>
        <span>Thanks. We&apos;ll read this conversation. {who} isn&apos;t told you reported it.</span>
        <button type="button" className="tax-btn tax-btn--text" onClick={onClose}>Done</button>
      </div>
    );
  }
  return (
    <form className="thread__panel stack" onSubmit={submit} noValidate>
      <div className="tax-field">
        <label className="tax-label" htmlFor={`report-${id}`}>What&apos;s wrong?</label>
        <textarea id={`report-${id}`} className="tax-textarea" style={{ minHeight: 72 }} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Asked me to pay outside buyer protection, sent a fake tracking number…" />
      </div>
      <p className="body-s muted" style={{ margin: 0 }}>We read the conversation. {who} isn&apos;t told.</p>
      {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
      <div className="cluster">
        <button type="submit" className="tax-btn tax-btn--ink" disabled={state === 'sending' || !reason.trim()}>Send report</button>
        <button type="button" className="tax-btn tax-btn--text" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}
