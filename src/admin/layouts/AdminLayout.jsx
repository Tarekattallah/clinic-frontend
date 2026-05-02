import { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const NAV = [
  {
    group: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', end: true, icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      )},
      { to: '/admin/analytics', label: 'Analytics', icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      )},
    ]
  },
  {
    group: 'Management',
    items: [
      { to: '/admin/users', label: 'Users', icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )},
      { to: '/admin/doctors', label: 'Doctors', icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
          <path d="M12 12v4M10 14h4"/>
        </svg>
      )},
      { to: '/admin/appointments', label: 'Appointments', icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )},
      { to: '/admin/specialties', label: 'Specialties', icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )},
    ]
  },
  {
    group: 'System',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      )},
      { to: '/admin/settings', label: 'Settings', icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )},
    ]
  }
];

// Derive page title from path
const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/analytics': 'Analytics',
  '/admin/users': 'User Management',
  '/admin/doctors': 'Doctor Management',
  '/admin/appointments': 'Appointments',
  '/admin/specialties': 'Specialties',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const toast     = useToast();

  const handleLogout = () => { logout(); navigate('/login'); };
  const sw = collapsed ? 64 : 240;
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0F1117', fontFamily:"'Outfit', sans-serif", color:'white' }}>

      {/* ── SIDEBAR ────────────────────────────────────────────────── */}
      <div style={{ width:sw, background:'#161B27', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, height:'100vh', zIndex:100, transition:'width 0.25s cubic-bezier(.4,0,.2,1)', overflow:'hidden' }}>

        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#C8272D,#7f1619)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1rem', fontWeight:700, color:'white', boxShadow:'0 4px 12px rgba(200,39,45,0.4)' }}>✚</div>
          {!collapsed && (
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:'0.95rem', fontWeight:700, color:'white', letterSpacing:'-0.3px', whiteSpace:'nowrap' }}>MediCare</div>
              <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:'8px 0', overflowY:'auto', overflowX:'hidden' }}>
          {NAV.map(group => (
            <div key={group.group}>
              {!collapsed && (
                <div style={{ padding:'14px 18px 5px', fontSize:'0.6rem', fontWeight:700, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>
                  {group.group}
                </div>
              )}
              {collapsed && <div style={{ height:12 }}/>}
              {group.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end}
                  title={collapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display:'flex', alignItems:'center', gap:11, padding: collapsed ? '10px 0' : '9px 14px',
                    margin:'1px 8px', borderRadius:8, textDecoration:'none', fontSize:'0.83rem', fontWeight:500,
                    transition:'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start',
                    color: isActive ? '#ff8080' : 'rgba(255,255,255,0.45)',
                    background: isActive ? 'rgba(200,39,45,0.15)' : 'transparent',
                    borderLeft: isActive ? '2px solid #C8272D' : '2px solid transparent',
                  })}>
                  <span style={{ flexShrink:0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ whiteSpace:'nowrap' }}>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User strip */}
        <div style={{ padding:'12px', borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px', borderRadius:8, background:'rgba(255,255,255,0.04)' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#C8272D,#7f1619)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.78rem', fontWeight:700, flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {!collapsed && (
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontSize:'0.78rem', fontWeight:600, color:'rgba(255,255,255,0.85)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize:'0.62rem', color:'#ff8080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Admin</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <div style={{ flex:1, marginLeft:sw, display:'flex', flexDirection:'column', minHeight:'100vh', transition:'margin-left 0.25s cubic-bezier(.4,0,.2,1)' }}>

        {/* Topbar */}
        <div style={{ height:58, background:'#161B27', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button onClick={() => setCollapsed(c => !c)}
              style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', padding:'6px', borderRadius:6, display:'flex', transition:'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='white'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <div style={{ fontSize:'0.95rem', fontWeight:600, color:'white' }}>{pageTitle}</div>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <a href="/" target="_blank" rel="noreferrer"
              style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', textDecoration:'none', padding:'5px 12px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, transition:'all 0.15s', fontFamily:'Outfit, sans-serif', display:'flex', alignItems:'center', gap:5 }}
              onMouseEnter={e => e.currentTarget.style.color='white'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View Site
            </a>
            <button onClick={handleLogout}
              style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', background:'none', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'5px 12px', cursor:'pointer', transition:'all 0.15s', fontFamily:'Outfit, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.color='#ff8080'; e.currentTarget.style.borderColor='rgba(200,39,45,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Page */}
        <div style={{ flex:1, padding:'28px', overflowX:'hidden' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
