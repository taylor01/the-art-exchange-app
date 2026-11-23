import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { accountsEnabled } from '../config/features';
import { initials } from '../lib/format';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="site">
      <a href="#main" className="visually-hidden">Skip to content</a>
      <header className="site-header">
        <div className="container site-header__row">
          <Link to="/" className="site-header__logo" aria-label="The Art Exchange home">
            <img src="/the_art_exchange.svg" alt="The Art Exchange" />
          </Link>

          <nav className="site-nav" aria-label="Main">
            <NavLink to="/gallery">Archive</NavLink>
            {accountsEnabled && user && <NavLink to="/wall" end>My Wall</NavLink>}
            {accountsEnabled && user && <Link to="/wall?status=wanted">Hunt List</Link>}
            <NavLink to="/about">About</NavLink>
          </nav>

          <div className="site-header__account">
            {accountsEnabled && user && (
              <>
                <Link to="/settings" className="tax-initials" title="Settings" aria-label="Settings">
                  {initials(user.name || user.email)}
                </Link>
                <button type="button" className="tax-btn tax-btn--text" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            )}
            {accountsEnabled && !user && (
              <>
                <Link to="/signin" className="tax-btn tax-btn--text">Sign in</Link>
                <Link to="/join" className="tax-btn tax-btn--ink">Join free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="site-main">
        {children}
      </main>

      <footer className="site-footer">
        <div className="container site-footer__row">
          <span className="site-footer__mark">The Art Exchange</span>
          <nav aria-label="Footer">
            <Link to="/about">About</Link>
            <a href="mailto:hello@theartexch.com">Contact</a>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
