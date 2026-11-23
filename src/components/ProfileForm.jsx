import { useState } from 'react';
import { saveProfile, apiErrorDetail } from '../api/collection';
import { useHandleCheck } from '../hooks/useHandleCheck';
import { normalizeHandle } from '../lib/handles';
import HandleField from './HandleField';
import ListVisibility from './ListVisibility';

// Name, city, handle and list visibility. Used by the welcome step and by
// Settings. `profile` comes from GET /users/profile.
export default function ProfileForm({ profile, onSaved, submitLabel = 'Save', secondary }) {
  const [name, setName] = useState(profile.name || '');
  const [city, setCity] = useState(profile.location || '');
  const [handle, setHandle] = useState(profile.handle || '');
  const [lists, setLists] = useState({ forSalePublic: profile.forSalePublic, wantedPublic: profile.wantedPublic });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const check = useHandleCheck(handle, profile.handle);

  const handleChanged = normalizeHandle(handle) !== normalizeHandle(profile.handle);
  const handleBlocked = handleChanged && ['invalid', 'unavailable', 'checking'].includes(check.state);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Add a name other collectors will see. You can change it any time.');
      return;
    }
    if (handleBlocked) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const attrs = {
        name: name.trim(),
        location: city.trim() || null,
        for_sale_public: lists.forSalePublic,
        wanted_public: lists.wantedPublic,
        ...(handleChanged && { handle: normalizeHandle(handle) }),
      };
      const next = await saveProfile(attrs);
      setSaved(true);
      onSaved?.(next);
    } catch (err) {
      setError(apiErrorDetail(err) || "We couldn't save that. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="stack" style={{ gap: 20 }} onSubmit={submit} noValidate>
      <div className={`tax-field${error && !name.trim() ? ' tax-field--error' : ''}`}>
        <label className="tax-label" htmlFor="name">Name</label>
        <input id="name" className="tax-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-describedby="name-help" />
        <span id="name-help" className="tax-help">Your name or a collector name. Shown on your public lists.</span>
      </div>

      <div className="tax-field">
        <label className="tax-label" htmlFor="city">Home city (optional)</label>
        <input id="city" className="tax-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, State" autoComplete="address-level2" aria-describedby="city-help" />
        <span id="city-help" className="tax-help">Helps match local trades at shows. Shown on your public lists.</span>
      </div>

      <HandleField value={handle} onChange={setHandle} check={check} lockedUntil={profile.handleChangeableAt} />

      <ListVisibility
        value={lists}
        onChange={setLists}
        saved={{ forSalePublic: profile.forSalePublic, wantedPublic: profile.wantedPublic }}
        preview={{ displayName: name.trim() || profile.displayName, location: city.trim(), handle: normalizeHandle(handle) }}
      />

      {error && <div className="tax-alert tax-alert--error" role="alert">{error}</div>}
      {saved && !error && <div className="tax-alert" role="status">Saved.</div>}

      <div className="cluster">
        <button type="submit" className="tax-btn tax-btn--ink tax-btn--lg" disabled={saving || handleBlocked}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {secondary}
      </div>
    </form>
  );
}
