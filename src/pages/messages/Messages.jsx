import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listConversations } from '../../api/market';
import PosterArt from '../../components/PosterArt';
import { EmptyState, ErrorNote, Loading } from '../../components/Feedback';
import { formatMoney } from '../../lib/format';
import Thread from './Thread';
import { posterTitle, shortTime } from './util';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'selling', label: 'Selling' },
  { id: 'buying', label: 'Buying' },
];

// /messages and /messages/:id — every conversation about a copy for sale,
// with the open one beside the list (or on its own on a phone).
export default function Messages() {
  const { id } = useParams();
  const [role, setRole] = useState('all');
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState({ role: null, tick: -1, conversations: [], error: null });

  // Refreshes quietly: the list keeps showing while it reloads.
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let live = true;
    listConversations(role === 'all' ? {} : { role }).then(
      ({ conversations }) => { if (live) setResult({ role, tick, conversations, error: null }); },
      (error) => { if (live) setResult((r) => ({ ...r, role, tick, error })); }
    );
    return () => { live = false; };
  }, [role, tick]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 30000);
    return () => { document.removeEventListener('visibilitychange', onVisible); clearInterval(timer); };
  }, [refresh]);

  const loading = result.role !== role;
  const { conversations, error } = result;

  return (
    <div className="container section">
      <h1 className="display-l" style={{ margin: '0 0 var(--space-5)' }}>Messages</h1>
      <div className={`messages${id ? ' messages--thread' : ''}`}>
        <div className="messages__list">
          <div className="tax-tabs" role="tablist" aria-label="Show">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className="tax-tab" role="tab" aria-selected={role === f.id} onClick={() => setRole(f.id)}>{f.label}</button>
            ))}
          </div>
          {loading && <div className="tax-panel__body"><Loading label="Loading conversations" /></div>}
          {!loading && error && <div className="tax-panel__body"><ErrorNote onRetry={refresh}>We couldn&apos;t load your messages.</ErrorNote></div>}
          {!loading && !error && conversations.length === 0 && (
            <div className="tax-panel__body">
              <EmptyState title="No messages yet">
                {role === 'selling'
                  ? 'When someone messages you about a copy you have for sale, it shows up here.'
                  : 'Press Message on a copy for sale on any poster page to start a conversation.'}
              </EmptyState>
            </div>
          )}
          {!loading && !error && conversations.length > 0 && (
            <ul className="messages__items">
              {conversations.map((c) => <ConversationItem key={c.id} conversation={c} current={c.id === id} />)}
            </ul>
          )}
        </div>
        <div className="messages__thread">
          {id
            ? <Thread key={id} id={id} onChanged={refresh} />
            : <p className="thread__empty">Pick a conversation to read it.</p>}
        </div>
      </div>
      <p className="body-s muted" style={{ margin: 'var(--space-4) 0 0', maxWidth: 760 }}>
        Only you and the other collector can read a conversation. Nobody&apos;s email is shared. Pay with a method that has buyer protection;
        The Art Exchange never handles the money.
      </p>
    </div>
  );
}

function ConversationItem({ conversation: c, current }) {
  const who = c.counterpartHandle ? `@${c.counterpartHandle}` : 'Deleted account';
  let preview = 'No messages yet';
  if (c.trade?.status === 'pending_confirmation' && c.trade.allowed.includes('confirm')) preview = `Confirm the sale: ${formatMoney(c.trade.price)}`;
  else if (c.lastMessage) preview = `${c.lastMessage.fromMe ? 'You: ' : ''}${c.lastMessage.body}`;

  return (
    <li>
      <Link to={`/messages/${c.id}`} className={`convo-item${c.unread ? ' convo-item--unread' : ''}`} aria-current={current ? 'page' : undefined}>
        {c.poster && <span className="thumb" aria-hidden="true"><PosterArt poster={c.poster} size="small" alt="" /></span>}
        <span className="convo-item__main">
          <span className="cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <strong>{who}</strong>
            <span className="meta muted">{shortTime(c.lastMessage?.createdAt || c.lastMessageAt || c.createdAt)}</span>
          </span>
          <span className="convo-item__line muted">{c.role === 'seller' ? 'Selling' : 'Buying'} · {posterTitle(c.poster)}</span>
          <span className="convo-item__line convo-item__preview">{preview}</span>
        </span>
        {c.unread && <span className="convo-item__dot" aria-label="Unread" />}
      </Link>
    </li>
  );
}
