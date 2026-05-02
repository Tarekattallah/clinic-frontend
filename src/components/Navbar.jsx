import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const ROLE_LABEL = { patient:'Patient', doctor:'Doctor', admin:'Admin', guest:'Guest' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dark,     setDark]    = useState(() => localStorage.getItem('theme') === 'dark');
  const [menuOpen, setMenu]    = useState(false);
  const a = (p) => pathname === p ? 'active' : '';
  const isAdmin = user?.role === 'admin';

  // Dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Close menu on route change
  useEffect(() => { setMenu(false); }, [pathname]);

  const navLinks = (
    <ul className="nav-links">
      <li><Link to="/"        className={a('/')}>Home</Link></li>
      <li><Link to="/doctors" className={a('/doctors')}>Doctors</Link></li>
      {user?.role === 'patient' && <>
        <li><Link to="/appointments"    className={a('/appointments')}>My Appointments</Link></li>
        <li><Link to="/medical-history" className={a('/medical-history')}>Medical History</Link></li>
        <li><Link to="/book"            className={a('/book')}>Book</Link></li>
      </>}
      {user?.role === 'doctor' && <>
        <li><Link to="/appointments"   className={a('/appointments')}>Appointments</Link></li>
        <li><Link to="/doctor-profile" className={a('/doctor-profile')}>My Profile</Link></li>
      </>}
      {isAdmin && <>
        <li><Link to="/admin"             className={a('/admin')}>Dashboard</Link></li>
        <li><Link to="/admin/specialties" className={a('/admin/specialties')}>Specialties</Link></li>
      </>}
    </ul>
  );

  return (
    <>
      <nav className="clinic-navbar">
        <Link to="/" className="brand">✚ Medi<span className="brand-sub">Care</span></Link>

        {/* Desktop nav */}
        {user && <div className="nav-desktop">{navLinks}</div>}

        <div className="d-flex align-items-center gap-2">
          {/* Dark mode */}
          <button onClick={() => setDark(d => !d)} title={dark ? 'Light Mode' : 'Dark Mode'} className="theme-btn">
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" title="Admin Panel" className="admin-dot"
                  onMouseEnter={e => e.currentTarget.style.opacity='1'}
                  onMouseLeave={e => e.currentTarget.style.opacity='0.55'}>⚙</Link>
              )}
              <div className="user-avatar">{user.name?.[0]?.toUpperCase() || '?'}</div>
              <div className="user-info nav-hide-sm">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{ROLE_LABEL[user.role]}</div>
              </div>
              {user.isGuest
                ? <Link to="/login" className="btn btn-red btn-sm">Sign In</Link>
                : <button className="btn btn-outline-red btn-sm nav-hide-sm" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
              }
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline-red btn-sm nav-hide-sm">Sign In</Link>
              <Link to="/register" className="btn btn-red btn-sm">Register</Link>
            </>
          )}

          {/* Hamburger — mobile only */}
          {user && (
            <button className="hamburger" onClick={() => setMenu(o => !o)} aria-label="Toggle menu">
              <span className={menuOpen ? 'bar open' : 'bar'}/>
              <span className={menuOpen ? 'bar open' : 'bar'}/>
              <span className={menuOpen ? 'bar open' : 'bar'}/>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && user && (
        <div className="mobile-menu">
          {navLinks}
          <div className="mobile-menu-footer">
            <div style={{ fontSize:'0.8rem', color:'var(--gray-400)', marginBottom:8 }}>
              Signed in as <strong style={{ color:'var(--dark)' }}>{user.name}</strong> · {ROLE_LABEL[user.role]}
            </div>
            {!user.isGuest && (
              <button className="btn btn-outline-red btn-sm w-100" onClick={() => { logout(); navigate('/login'); setMenu(false); }}>
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
