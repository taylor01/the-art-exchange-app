import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCollector, getCollectorList } from '../api/collection';
import { useApi } from '../hooks/useApi';
import { useAuthStore } from '../store/authStore';
import PosterCard from '../components/PosterCard';
import { EmptyState, ErrorNote, Loading } from '../components/Feedback';
import { conditionLabel, formatMoney, initials } from '../lib/format';
import { collectorPath, normalizeHandle } from '../lib/handles';

const LIST_LABELS = { for_sale: 'For sale', wanted: 'Hunting' };

// A collector's public page: only the lists they've made public.
export default function Collector() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const collector = useApi(() => getCollector(handle), [handle]);
  const c = collector.data;

  // An old handle still resolves for 90 days; show the current one in the URL.
  useEffect(() => {
    if (c && normalizeHandle(c.handle) !== normalizeHandle(handle)) {
      navigate(`${collectorPath(c.handle)}${params.toString() ? `?${params}` : ''}`, { replace: true });
    }
  }, [c, handle, navigate, params]);

  if (collector.loading) return <div className="container"><Loading label="Loading collector" /></div>;
  if (collector.error) {
    const missing = collector.error?.response?.status === 404;
    return (
      <div className="container section">
        {missing
          ? <EmptyState title="Nothing to see here">This collector doesn&apos;t exist, or hasn&apos;t made any lists public.</EmptyState>
          : <ErrorNote onRetry={collector.reload}>We couldn&apos;t load this collector.</ErrorNote>}
      </div>
    );
  }

  const lists = c.publicLists.filter((l) => LIST_LABELS[l]);
  const list = lists.includes(params.get('list')) ? params.get('list') : lists[0];

  return (
    <div className="container section">
      <div className="cluster" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <span className="tax-initials" style={{ width: 72, height: 72, fontSize: 28, boxShadow: 'var(--shadow-md)' }} aria-hidden="true">
          {initials(c.displayName || c.handle)}
        </span>
        <div>
          <h1 className="display-m">@{c.handle}</h1>
          <p className="body muted" style={{ margin: '4px 0 0' }}>{[c.displayName, c.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>

      {lists.length > 1 && (
        <div className="tax-tabs" role="tablist" aria-label="Lists" style={{ maxWidth: 420, marginBottom: 'var(--space-5)' }}>
          {lists.map((l) => (
            <button key={l} type="button" className="tax-tab" role="tab" aria-selected={l === list} onClick={() => setParams(l === lists[0] ? {} : { list: l })}>
              {LIST_LABELS[l]}{countFor(c, l) !== undefined ? ` · ${countFor(c, l)}` : ''}
            </button>
          ))}
        </div>
      )}
      {lists.length === 1 && <h2 className="section__title" style={{ marginBottom: 'var(--space-5)' }}>{LIST_LABELS[list]}</h2>}

      <CollectorList key={`${c.handle}-${list}`} handle={c.handle} list={list} />
    </div>
  );
}

function countFor(c, list) {
  return list === 'for_sale' ? c.forSaleCount : c.wantedCount;
}

function CollectorList({ handle, list }) {
  const { user } = useAuthStore();
  const { data, error, loading, reload } = useApi(() => getCollectorList(handle, list), [handle, list]);
  const copies = (data?.copies || []).filter((x) => x.poster);
  const mine = user?.handle && normalizeHandle(user.handle) === normalizeHandle(handle);

  if (loading) return <Loading label="Loading posters" />;
  if (error) return <ErrorNote onRetry={reload}>We couldn&apos;t load this list.</ErrorNote>;
  if (copies.length === 0) {
    return (
      <EmptyState title={list === 'for_sale' ? 'Nothing for sale right now' : 'Nothing on the hunt list'}>
        {mine ? 'Add posters from your wall and they show up here.' : 'Check back later.'}
      </EmptyState>
    );
  }

  return (
    <div className="poster-grid">
      {copies.map((copy) => (
        <PosterCard
          key={copy.id}
          poster={copy.poster}
          sticker={list === 'wanted' ? 'Hunting' : copy.askingPrice ? formatMoney(copy.askingPrice) : 'For sale'}
          stickerKind={list === 'wanted' ? 'hunt' : undefined}
          meta={[copy.editionNumber && `#${copy.editionNumber}`, conditionLabel(copy.condition)].filter(Boolean).join(' · ') || copy.poster.year}
        />
      ))}
    </div>
  );
}
