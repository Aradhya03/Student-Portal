/**
 * ErrorState — Friendly error display with retry action.
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state__card">
        <div className="error-state__icon">😕</div>
        <h2 className="error-state__title">Something went wrong</h2>
        <p className="error-state__message">{message}</p>
        <div className="error-state__actions">
          <button className="btn btn--primary" onClick={onRetry} id="retry-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
