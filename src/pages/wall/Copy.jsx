import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteCopy, getCopy, getProfile, updateCopy } from '../../api/collection';
import { useApi } from '../../hooks/useApi';
import PosterArt from '../../components/PosterArt';
import Switch from '../../components/Switch';
import { ErrorNote, Loading } from '../../components/Feedback';
import { CONDITIONS, HANDOFFS, toCents } from '../../lib/format';

// One poster on the collector's wall: edition, condition, what they paid,
// and whether it's listed for sale.
export default function Copy() {
  const { id } = useParams();
  const { data: copy, error, loading, reload } = useApi(() => getCopy(id), [id]);

  if (loading) return <div className="container"><Loading label="Loading your copy" /></div>;
  if (error || !copy) {
    return (
      <div className="container section">
        <ErrorNote onRetry={error?.response?.status === 404 ? undefined : reload}>
          {error?.response?.status === 404 ? "That poster isn't on your wall." : "We couldn't load this poster."}
        </ErrorNote>
        <p><Link to="/wall">← Back to my wall</Link></p>
      </div>
    );
  }
  return <CopyForm key={copy.id} copy={copy} />;
}

function CopyForm({ copy }) {
  const navigate = useNavigate();
  const poster = copy.poster;
  const [form, setForm] = useState({
    condition: copy.condition || '',
    editionNumber: copy.editionNumber || '',
    purchasePrice: copy.purchasePrice ?? '',
    purchaseDate: copy.purchaseDate || '',
    notes: copy.notes || '',
    forSale: copy.forSale,
    askingPrice: copy.askingPrice ?? '',
    handoff: copy.handoff || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const profile = useApi(() => getProfile(), ['profile']);
  const listPrivate = profile.data && !profile.data.forSalePublic;

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const save = async (next = form) => {
    setSaving(true);
    setMessage(null);
    try {
      await updateCopy(copy.id, {
        condition: next.condition || null,
        edition_number: next.editionNumber.trim() || null,
        purchase_price_cents: toCents(next.purchasePrice),
        purchase_date: next.purchaseDate || null,
        notes: next.notes.trim() || null,
        for_sale: next.forSale,
        asking_price_cents: next.forSale ? toCents(next.askingPrice) : null,
        handoff: next.handoff || null,
      });
      setMessage({ kind: 'ok', text: 'Saved.' });
    } catch {
      setMessage({ kind: 'error', text: "That didn't save. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const toggleSale = (on) => {
    const next = { ...form, forSale: on };
    setForm(next);
    save(next);
  };

  const remove = async () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    setSaving(true);
    try {
      await deleteCopy(copy.id);
      navigate('/wall', { replace: true });
    } catch {
      setSaving(false);
      setMessage({ kind: 'error', text: "We couldn't remove it. Try again." });
    }
  };

  return (
    <div className="container section">
      <p className="breadcrumb" style={{ paddingTop: 0, marginBottom: 'var(--space-5)' }}><Link to="/wall">My wall</Link> / Your copy</p>
      <div className="poster-hero" style={{ paddingTop: 0 }}>
        <div className="poster-hero__media" style={{ flexBasis: 360 }}>
          <div className="poster-hero__well">
            <div className="tax-poster__frame">{poster && <PosterArt poster={poster} size="large" />}</div>
          </div>
          {poster && <p style={{ marginTop: 'var(--space-4)' }}><Link to={poster.path} style={{ fontWeight: 700 }}>Poster page, setlist and venue →</Link></p>}
        </div>

        <form className="poster-hero__info" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
          <div>
            <p className="eyebrow">On your wall</p>
            <h1 className="poster-hero__title" style={{ fontSize: 64 }}>{poster?.band?.name || poster?.name}</h1>
            <p className="body muted" style={{ margin: '8px 0 0' }}>{[poster?.venue?.name, poster?.year].filter(Boolean).join(' · ')}</p>
          </div>

          <section className="tax-panel" aria-label="Listing">
            <div className="tax-panel__body cluster" style={{ justifyContent: 'space-between' }}>
              <span><strong>List for sale</strong><br /><span className="body-s muted">Collectors hunting this poster can ask you about it.</span></span>
              <Switch checked={form.forSale} onChange={toggleSale} label="List for sale" disabled={saving} />
            </div>
            {form.forSale && listPrivate && (
              <div className="tax-panel__body tax-alert--note" style={{ borderTop: 'var(--border-heavy) solid var(--ink)' }} role="status">
                Buyers won&apos;t see this until your For sale list is public.{' '}
                <Link to="/settings" style={{ fontWeight: 700 }}>Make it public</Link>
              </div>
            )}
            {form.forSale && (
              <div className="tax-panel__body" style={{ borderTop: 'var(--border-heavy) solid var(--ink)' }}>
                <div className="cluster" style={{ alignItems: 'flex-end' }}>
                  <div className="tax-field" style={{ flex: '1 1 200px' }}>
                    <label className="tax-label" htmlFor="asking">Asking price (optional)</label>
                    <input id="asking" className="tax-input" inputMode="decimal" placeholder="$" value={form.askingPrice} onChange={set('askingPrice')} />
                  </div>
                  <div className="tax-field" style={{ flex: '1 1 220px' }}>
                    <label className="tax-label" htmlFor="handoff">How you hand it over</label>
                    <select id="handoff" className="tax-select" value={form.handoff} onChange={set('handoff')}>
                      <option value="">Not set</option>
                      {HANDOFFS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="poster-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="tax-field">
              <label className="tax-label" htmlFor="edition">Edition number</label>
              <input id="edition" className="tax-input" placeholder="e.g. 88/200 or AP 4/20" value={form.editionNumber} onChange={set('editionNumber')} />
            </div>
            <div className="tax-field">
              <label className="tax-label" htmlFor="condition">Condition</label>
              <select id="condition" className="tax-select" value={form.condition} onChange={set('condition')}>
                <option value="">Not set</option>
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="tax-field">
              <label className="tax-label" htmlFor="paid">Paid (private)</label>
              <input id="paid" className="tax-input" inputMode="decimal" placeholder="$" value={form.purchasePrice} onChange={set('purchasePrice')} />
            </div>
            <div className="tax-field">
              <label className="tax-label" htmlFor="date">Bought on</label>
              <input id="date" className="tax-input" type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
            </div>
          </div>

          <div className="tax-field">
            <label className="tax-label" htmlFor="notes">Notes (private)</label>
            <textarea id="notes" className="tax-textarea" value={form.notes} onChange={set('notes')} placeholder="Where you got it, framing, anything worth remembering" />
          </div>

          {message && (
            <div className={`tax-alert${message.kind === 'error' ? ' tax-alert--error' : ''}`} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</div>
          )}

          <div className="cluster" style={{ justifyContent: 'space-between' }}>
            <button type="submit" className="tax-btn tax-btn--ink tax-btn--lg" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" className="tax-btn tax-btn--text" onClick={remove} disabled={saving}>
              {confirmRemove ? 'Press again to remove it from your wall' : 'Remove from my wall'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
