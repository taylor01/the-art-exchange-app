import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img
              src="/the_art_exchange.svg"
              alt="The Art Exchange"
              style={{ height: '32px', width: 'auto' }}
            />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link to="/gallery" className="nav-link">
                  Gallery
                </Link>
              </li>
              {user && (
                <>
                  <li className="nav-item">
                    <Link to="/collection" className="nav-link">
                      My Collection
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link">
                      Profile
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link"
                      onClick={handleLogout}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
              {!user && (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link">
                      Sign In
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/signup" className="btn btn-primary text-white ms-2">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1">
        {children}
      </main>

      <footer className="border-top py-5 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-3 mb-4">
              <h6 className="fw-bold mb-3">Community</h6>
              <ul className="list-unstyled small">
                <li className="mb-2"><Link to="/about" className="text-decoration-none">About</Link></li>
                <li className="mb-2"><a href="mailto:hello@theartexch.com" className="text-decoration-none">Contact</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4">
              <h6 className="fw-bold mb-3">Resources</h6>
              <ul className="list-unstyled small">
                <li className="mb-2"><a href="#" className="text-decoration-none">Blog</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none">FAQ</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4">
              <h6 className="fw-bold mb-3">Legal</h6>
              <ul className="list-unstyled small">
                <li className="mb-2"><Link to="/privacy" className="text-decoration-none">Privacy</Link></li>
                <li className="mb-2"><Link to="/terms" className="text-decoration-none">Terms</Link></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4 text-md-end">
              <small>Built with ❤️</small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
