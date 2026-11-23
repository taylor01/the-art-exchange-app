import { Link } from 'react-router-dom';
import { listTrades } from '../../api/market';
import { useApi } from '../../hooks/useApi';
import PosterArt from '../../components/PosterArt';
import { EmptyState, ErrorNote, Loading } from '../../components/Feedback';
import { formatDate, formatMoney } from '../../lib/format';

// My wall's Buying & selling tab: sales to confirm, sales waiting on the other
// person, and completed trades. The talking, marking sold and confirming all
// happen in Messages; this is the ledger.
export default function Deals() {
  const trades = useApi(() => listTrades(), ['trades']);

  if (trades.loading) return <Loading label="Loading trades" />;
  if (trades.error) return <ErrorNote onRetry={trades.reload}>We couldn&apos;t load your trades.</ErrorNote>;

  const all = trades.data;
  const pending = all.filter((t) => t.status === 'pending_confirmation');
  const onMe = pending.filter((t) => t.allowed.includes('confirm'));
  const onThem = pending.filter((t) => !t.allowed.includes('confirm'));
  const confirmed = all.filter((t) => t.status === 'confirmed');

  return (
    <div className="stack" style={{ gap: 'var(--space-7)' }}>
      <div className="tax-alert cluster" style={{ justifyContent: 'space-between' }}>
        <span>Buyers and sellers talk, agree and mark sales in Messages.</span>
        <Link to="/messages" className="tax-btn tax-btn--ink">Open Messages</Link>
      </div>

      {onMe.length > 0 && (
        <TradeList title={`Confirm ${onMe.length === 1 ? 'this sale' : 'these sales'}`} trades={onMe} lead
          line={(t) => `${who(t)} marked it sold${t.role === 'buyer' ? ' to you' : ''} for ${formatMoney(t.price)}`} action="Confirm in Messages" />
      )}
      {onThem.length > 0 && (
        <TradeList title="Waiting on the other collector" trades={onThem}
          line={(t) => `Waiting for ${who(t)} to confirm ${formatMoney(t.price)}`} action="Open conversation" />
      )}

      <section className="stack">
        <h2 className="display-s">Completed trades</h2>
        {confirmed.length === 0 ? (
          <EmptyState title="No trades yet">When you and another collector both confirm a sale, it&apos;s recorded here.</EmptyState>
        ) : (
          <ul className="row-list">
            {confirmed.map((t) => (
              <li key={t.id} className="row-item">
                <span className="row-item__main">
                  <span className="row-item__title">{t.poster?.band?.name || t.poster?.name} · {formatMoney(t.price)}</span>
                  <span className="row-item__sub">
                    {t.role === 'seller' ? 'Sold to' : 'Bought from'} {t.counterpartHandle ? `@${t.counterpartHandle}` : 'a former collector'} · {formatDate(t.confirmedAt)}
                  </span>
                </span>
                {t.conversationId && <Link to={`/messages/${t.conversationId}`} className="tax-btn tax-btn--text">Conversation</Link>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const who = (t) => (t.counterpartHandle ? `@${t.counterpartHandle}` : 'The other collector');

function TradeList({ title, trades, line, action, lead = false }) {
  return (
    <section className="stack">
      <h2 className="display-s">{title}</h2>
      {trades.map((t) => (
        <article key={t.id} className="tax-panel" style={{ padding: 'var(--space-4) 18px', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', boxShadow: lead ? 'var(--shadow-md)' : 'none' }}>
          {t.poster && <span className="thumb" aria-hidden="true" style={{ width: 56 }}><PosterArt poster={t.poster} size="small" alt="" /></span>}
          <div className="stack" style={{ flex: 1, minWidth: 0, gap: 'var(--space-1)' }}>
            <strong>{t.poster?.band?.name || t.poster?.name}</strong>
            <span className="body-s">{line(t)}</span>
          </div>
          {t.conversationId && <Link to={`/messages/${t.conversationId}`} className={`tax-btn ${lead ? 'tax-btn--primary' : 'tax-btn--secondary'}`}>{action}</Link>}
        </article>
      ))}
    </section>
  );
}
