// Loading, error and empty states.

export function Loading({ label = 'Loading' }) {
  return <div className="tax-loading" role="status">{label}</div>;
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
