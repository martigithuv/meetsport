import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, User, LogOut, Crown, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = !user
    ? [{ name: 'Inici', path: '/' }]
    : user.role === 'ADMIN'
    ? [{ name: 'Admin', path: '/admin' }]
    : [
        { name: 'Inici', path: '/' },
        { name: 'Explorar', path: '/explore' },
        { name: 'Matches', path: '/matches' },
        { name: 'Crear', path: '/create' },
        { name: 'Premium', path: '/premium' },
      ];

  return (
    <nav className="fixed-nav">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-box">
            <Zap size={18} fill="currentColor" />
          </div>
          <span>Meet<span className="text-lime">Sport</span></span>
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links-wrapper nav-desktop-only">
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop auth buttons */}
        <div className="nav-auth nav-desktop-only">
          {user ? (
            <>
              <Link to="/profile" className={`profile-link ${user.isPremium ? 'premium' : 'regular'}`}>
                <div className={`profile-icon ${user.isPremium ? 'premium' : 'regular'}`}>
                  {user.isPremium ? (
                    <Crown size={20} color="white" />
                  ) : (
                    <User size={20} color="#c8f542" />
                  )}
                </div>
                <span className="profile-text">El meu perfil</span>
                {user.isPremium && <div className="pro-tag">PRO</div>}
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Sortir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Inicia sessió</Link>
              <Link to="/register" className="btn-register">Registra't</Link>
            </>
          )}
        </div>

        {/* Mobile: profile icon + hamburger */}
        <div className="nav-mobile-controls">
          {user && (
            <Link to="/profile" className={`profile-icon-mobile ${user.isPremium ? 'premium' : 'regular'}`} onClick={() => setMobileMenuOpen(false)}>
              {user.isPremium ? <Crown size={18} color="white" /> : <User size={18} color="#c8f542" />}
            </Link>
          )}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {!user ? (
            <div className="mobile-auth-row">
              <Link to="/login" className="btn-login" onClick={() => setMobileMenuOpen(false)}>Inicia sessió</Link>
              <Link to="/register" className="btn-register" onClick={() => setMobileMenuOpen(false)}>Registra't</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="mobile-nav-link" style={{ color: '#ff4b4b', textAlign: 'left' }}>
              Sortir
            </button>
          )}
        </div>
      )}

      <style>{`
        .fixed-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(6, 6, 8, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nav-container {
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
            padding: 0 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 70px;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            font-family: var(--font-display);
            font-size: 1.4rem;
            letter-spacing: 0.1em;
            font-weight: 700;
            flex-shrink: 0;
        }

        .logo-box {
            width: 36px;
            height: 36px;
            background: var(--color-lime);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-dark);
            box-shadow: 0 4px 20px rgba(200, 245, 66, 0.3);
            flex-shrink: 0;
        }

        /* Desktop nav */
        .nav-desktop-only {
            display: flex;
        }

        .nav-links-wrapper {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 100px;
            padding: 5px;
        }

        .nav-links {
            display: flex;
            gap: 5px;
        }

        .nav-link {
            padding: 8px 20px;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--color-muted3);
            transition: all 0.3s ease;
            white-space: nowrap;
        }

        .nav-link:hover { color: var(--color-light); }
        .nav-link.active {
            background: var(--color-lime);
            color: var(--color-dark);
        }

        .nav-auth {
            align-items: center;
            gap: 1rem;
        }

        .btn-login {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--color-light);
            white-space: nowrap;
        }

        .btn-register {
            background: var(--color-lime);
            color: var(--color-dark);
            padding: 10px 20px;
            border-radius: 14px;
            font-size: 0.85rem;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(200, 245, 66, 0.2);
            white-space: nowrap;
        }

        .profile-link {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 6px 16px 6px 6px;
            border-radius: 14px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.03);
        }

        .profile-link:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.12);
        }

        .profile-link.premium {
            background: linear-gradient(135deg, rgba(255, 107, 43, 0.15), rgba(255, 142, 83, 0.1));
            border-color: rgba(255, 107, 43, 0.3);
        }

        .profile-link.premium:hover {
            background: linear-gradient(135deg, rgba(255, 107, 43, 0.25), rgba(255, 142, 83, 0.15));
            border-color: rgba(255, 107, 43, 0.4);
        }

        .profile-text {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--color-light);
            white-space: nowrap;
        }

        .profile-link.premium .profile-text { color: #FF8E53; }

        .profile-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .profile-icon.premium {
            background: linear-gradient(135deg, #FF6B2B, #FF8E53);
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 15px rgba(255, 107, 43, 0.3);
        }

        .profile-icon.regular {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pro-tag {
            position: absolute;
            top: -6px;
            right: -6px;
            background: white;
            color: var(--color-orange);
            font-size: 0.6rem;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .btn-logout {
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: var(--color-muted3);
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            white-space: nowrap;
        }

        .btn-logout:hover {
            color: #ff4b4b;
            border-color: rgba(255, 75, 75, 0.2);
            background: rgba(255, 75, 75, 0.05);
        }

        /* Mobile controls */
        .nav-mobile-controls {
            display: none;
            align-items: center;
            gap: 0.75rem;
        }

        .hamburger-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            color: var(--color-light);
            cursor: pointer;
            transition: all 0.2s;
        }

        .hamburger-btn:hover {
            background: rgba(255,255,255,0.1);
        }

        .profile-icon-mobile {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .profile-icon-mobile.premium {
            background: linear-gradient(135deg, #FF6B2B, #FF8E53);
            border: 2px solid rgba(255,255,255,0.2);
        }

        .profile-icon-mobile.regular {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* Mobile dropdown */
        .mobile-menu {
            display: flex;
            flex-direction: column;
            background: rgba(6, 6, 8, 0.98);
            border-top: 1px solid rgba(255,255,255,0.05);
            padding: 1rem 1.5rem 1.5rem;
            gap: 0.25rem;
        }

        .mobile-nav-link {
            padding: 0.85rem 1rem;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            color: var(--color-muted3);
            transition: all 0.2s;
            border: none;
            background: none;
            cursor: pointer;
            width: 100%;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
            background: rgba(200,245,66,0.08);
            color: var(--color-lime);
        }

        .mobile-auth-row {
            display: flex;
            gap: 1rem;
            margin-top: 0.5rem;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .mobile-auth-row .btn-register {
            flex: 1;
            text-align: center;
        }

        /* Responsive breakpoints */
        @media (max-width: 900px) {
            .nav-desktop-only {
                display: none !important;
            }
            .nav-mobile-controls {
                display: flex;
            }
        }

        @media (max-width: 480px) {
            .nav-container {
                padding: 0 1rem;
            }
            .logo {
                font-size: 1.2rem;
            }
        }
      `}</style>
    </nav>
  );
};

export default Header;
