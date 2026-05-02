import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { initParticles } from '../utils/particles';
import { useToast } from '../context/ToastContext';

const ROLES = [
  {
    v: 'patient',
    label: 'Patient',
    desc: 'Book & manage appointments',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    v: 'doctor',
    label: 'Doctor',
    desc: 'Manage your practice & patients',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
        <path d="M12 12v4M10 14h4"/>
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    ),
  },
];

const ADMIN_SECRET = 'MEDICARE_ADMIN_2024';

export default function RegisterPage() {
  const [form, setForm]           = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminErr, setAdminErr]   = useState('');

  const { loginUser, logout, user } = useAuth();

  document.title = 'MediCare — Create Account';
  useEffect(() => { if (user?.isGuest) logout(); }, []);
  const navigate  = useNavigate();
  const cleanup   = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { cleanup.current = initParticles('reg-canvas', 'dark'); }, 60);
    return () => { clearTimeout(t); cleanup.current?.(); };
  }, []);

  const verifyAdminCode = () => {
    if (adminCode.trim() === ADMIN_SECRET) {
      setForm(f => ({ ...f, role: 'admin' }));
      setShowAdmin(false); setAdminCode(''); setAdminErr('');
    } else {
      setAdminErr('Invalid access code. Try: MEDICARE_ADMIN_2024');
    }
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await register(form);
      loginUser(r.data.user);
      navigate(r.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const isAdmin = form.role === 'admin';

  return (
    <div className="auth-wrapper">

      <div className="auth-left" style={{ position: 'relative' }}>
        <canvas id="reg-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ fontSize: '2rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: 'white' }}>✚ MediCare</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>Healthcare Platform</div>
          </div>
          <h2 style={{ color: 'white', fontSize: '2.8rem', fontWeight: 300, lineHeight: 1.15, marginBottom: '0.5rem' }}>
            Join thousands<br />of <em style={{ fontStyle: 'italic' }}>patients</em><br />&amp; doctors.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.7, marginTop: 16, maxWidth: 320 }}>
            Create your account in seconds and get instant access to our network of specialist physicians.
          </p>
          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Free to join', 'Verified doctors only', '24/7 appointment booking', 'Secure medical records'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card fade-in" style={{ maxWidth: 460 }}>

          <div style={{ marginBottom: '1.8rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--dark)' }}>
              {isAdmin ? 'Admin Registration' : 'Create account'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 4 }}>
              {isAdmin ? 'You are registering as a system administrator.' : 'Fill in your details below'}
            </p>
          </div>

          {isAdmin && (
            <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(200,39,45,0.35)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(200,39,45,0.15)', border: '1px solid rgba(200,39,45,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C8272D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>Administrator Access</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Full system privileges granted</div>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, role: 'patient' }))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.78rem', padding: '4px 8px', borderRadius: 6, transition: 'color 0.2s' }}>
                Cancel
              </button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" style={{ borderRadius: 'var(--r-md)', fontSize: '0.85rem', borderLeft: '3px solid var(--red)', marginBottom: 16 }}>{error}</div>
          )}

          {!isAdmin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {ROLES.map(r => {
                  const active = form.role === r.v;
                  return (
                    <button key={r.v} type="button" onClick={() => setForm({ ...form, role: r.v })}
                      style={{ border: `2px solid ${active ? 'var(--red)' : 'var(--gray-200)'}`, background: active ? 'var(--red-muted)' : 'var(--gray-50)', borderRadius: 'var(--r-md)', padding: '14px 12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                      <div style={{ color: active ? 'var(--red)' : 'var(--gray-400)', marginBottom: 6 }}>{r.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: active ? 'var(--red)' : 'var(--dark)' }}>{r.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: 2 }}>{r.desc}</div>
                    </button>
                  );
                })}
              </div>
              {/* Admin access button */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <button type="button" onClick={() => setShowAdmin(true)}
                  style={{ background: 'rgba(200,39,45,0.07)', border: '1px dashed rgba(200,39,45,0.35)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--red)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', padding: '7px 18px', fontWeight: 600 }}>
                  🔒 Admin Access
                </button>
              </div>
            </>
          )}

          <form onSubmit={submit} className="clinic-form">
            <div className="mb-3">
              <label>Full Name</label>
              <input type="text" className="form-control" placeholder={isAdmin ? 'Administrator name' : 'Your full name'} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label>Email Address</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="mb-4">
              <label>Password</label>
              <input type="password" className="form-control" placeholder="At least 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-red w-100" disabled={loading}>
              {loading
                ? <span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm" />Creating...</span>
                : isAdmin ? 'Create Admin Account →' : 'Create Account →'
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>

      {showAdmin && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setShowAdmin(false); setAdminCode(''); setAdminErr(''); } }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: '#0d0d1a', border: '1px solid rgba(200,39,45,0.25)', borderRadius: 'var(--r-lg)', padding: '2.5rem', width: 380, maxWidth: '90vw', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(200,39,45,0.1)', border: '1px solid rgba(200,39,45,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C8272D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#e2e8f0', textAlign: 'center', marginBottom: 6 }}>System Access</h4>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Enter the administrator access code to proceed. This area is restricted to authorized personnel only.
            </p>
            <div className="clinic-form">
              <input
                type="password"
                className="form-control"
                placeholder="Enter access code"
                value={adminCode}
                onChange={e => { setAdminCode(e.target.value); setAdminErr(''); }}
                onKeyDown={e => { if (e.key === 'Enter') verifyAdminCode(); }}
                autoFocus
                style={{ background: '#1a1a2e', border: `1.5px solid ${adminErr ? 'var(--red)' : 'rgba(255,255,255,0.08)'}`, color: '#e2e8f0', marginBottom: 6, letterSpacing: '0.12em' }}
              />
              {adminErr && <div style={{ fontSize: '0.78rem', color: 'var(--red)', marginBottom: 10 }}>{adminErr}</div>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={() => { setShowAdmin(false); setAdminCode(''); setAdminErr(''); }}
                style={{ flex: 1, padding: '11px', borderRadius: 'var(--r-md)', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button onClick={verifyAdminCode}
                style={{ flex: 1, padding: '11px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--red)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                Verify
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Unauthorized access is prohibited</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
