// What happens to each person's wall when the trade is confirmed.
export default function WallChoice({ role, move, setMove, removeCopy, setRemoveCopy, idBase }) {
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

