import { Link } from 'react-router-dom';
import Switch from './Switch';
import { collectorPath } from '../lib/handles';

const LISTS = [
  { key: 'wantedPublic', label: 'Hunting', what: 'Posters on your hunt list' },
  { key: 'forSalePublic', label: 'For sale', what: 'Posters you’ve listed for sale, with your asking price' },
];

// Public / private for the Hunting and For sale lists. Your full collection
// is always private. Shows exactly what a visitor will see before a list is
// turned on, and warns when turning off a list people may have links to.
export default function ListVisibility({ value, onChange, saved, preview, editProfileHref }) {
  const anyOn = value.wantedPublic || value.forSalePublic;

  return (
    <fieldset className="tax-panel" style={{ margin: 0, padding: 0 }}>
      <legend className="tax-label" style={{ padding: '0 0 var(--space-2)' }}>Who can see your lists</legend>
      {LISTS.map((list, i) => {
        const on = value[list.key];
        const turningOff = saved?.[list.key] && !on;
        return (
          <div key={list.key} className="tax-panel__body" style={i > 0 ? { borderTop: 'var(--border-light) solid var(--ink)' } : undefined}>
            <div className="cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <span>
                <strong>{list.label}</strong> <span className="meta" style={{ marginLeft: 6 }}>{on ? 'Public' : 'Private'}</span>
                <br /><span className="body-s muted">{list.what}</span>
              </span>
              <Switch checked={on} onChange={(next) => onChange({ ...value, [list.key]: next })} label={`Make ${list.label} public`} />
            </div>
            {turningOff && (
              <p className="body-s" role="status" style={{ margin: 'var(--space-2) 0 0', fontWeight: 700, color: 'var(--error)' }}>
                Links you&apos;ve shared to this list will stop working.
              </p>
            )}
          </div>
        );
      })}
      <div className="tax-panel__body" style={{ borderTop: 'var(--border-heavy) solid var(--ink)', background: anyOn ? 'var(--paper-deep)' : 'var(--card)' }}>
        <p className="body-s" style={{ margin: 0 }}>
          {anyOn ? 'Visitors will see:' : 'If you make a list public, visitors will see:'}{' '}
          <strong>{preview.displayName || 'No name yet'}</strong>
          {preview.location ? ` · ${preview.location}` : ''}
          {preview.handle ? <> · <span className="meta">theartexch.com{collectorPath(preview.handle)}</span></> : null}
          {editProfileHref && <> · <Link to={editProfileHref}>Edit</Link></>}
        </p>
        <p className="body-s muted" style={{ margin: 'var(--space-1) 0 0' }}>Your full collection, what you paid and your notes are never shown.</p>
      </div>
    </fieldset>
  );
}
