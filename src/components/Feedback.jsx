// Loading, error and empty states.

// Three ink passes stamping down in turn, like a screenprint run, then the label.
export function Loading({ label = 'Loading' }) {
  return (
    <div className="tax-loading" role="status">
      <span className="tax-loading__press" aria-hidden="true"><span /><span /><span /></span>
      {label}
    </div>
  );
}

// Placeholder posters in the shape of the grid they stand in for, so the page
// doesn't jump when the real ones arrive. A pink pass sweeps down each one.
export function PosterGridSkeleton({ count = 8, label = 'Loading posters', small = false }) {
  return (
    <div role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className={`poster-grid${small ? ' poster-grid--small' : ''}`} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skel-poster" style={{ '--i': i }}>
            <div className="skel-poster__frame" />
            <div className="skel-bar" style={{ width: '70%' }} />
            <div className="skel-bar skel-bar--thin" style={{ width: '45%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorNote({ children, onRetry }) {
  return (
    <div className="tax-alert tax-alert--error" role="alert">
      {children}
      {onRetry && (
        <>
          {' '}
          <button type="button" className="tax-btn tax-btn--text" onClick={onRetry}>Try again</button>
        </>
      )}
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="tax-empty">
      <p className="tax-empty__title">{title}</p>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
