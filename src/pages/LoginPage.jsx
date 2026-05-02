import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { initParticles } from '../utils/particles';

const FEATURES = [
  { icon:'🏥', t:'World-Class Care',   d:'Expert physicians across 20+ specialties' },
  { icon:'📅', t:'Easy Scheduling',    d:'Book appointments in under 60 seconds'   },
  { icon:'🔒', t:'Secure & Private',   d:'Your health data is fully encrypted'      },
];

export default function LoginPage() {
  const [form, setForm]       = useState({ email:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser, loginAsGuest, logout, user } = useAuth();
  const navigate  = useNavigate();
  const cleanup   = useRef(null);

  // If a guest lands on /login, clear their guest session silently
  document.title = 'MediCare — Sign In';
  useEffect(() => {
    if (user?.isGuest) logout();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { cleanup.current = initParticles('login-canvas', 'dark'); }, 60);
    return () => { clearTimeout(t); cleanup.current?.(); };
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await login(form);
      loginUser(r.data.user);
      navigate(r.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT PANEL */}
      <div className="auth-left" style={{ position:'relative' }}>
        <canvas id="login-canvas" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ marginBottom:'3rem' }}>
            <div style={{ fontSize:'2rem', fontFamily:'Cormorant Garamond, serif', fontWeight:700, color:'white' }}>✚ MediCare</div>
            <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:4 }}>Healthcare Platform</div>
          </div>
          <h2 style={{ color:'white', fontSize:'2.8rem', fontWeight:300, lineHeight:1.15, marginBottom:'0.5rem' }}>
            Your health,<br/><em style={{ fontStyle:'italic' }}>our priority.</em>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.95rem', lineHeight:1.7, marginBottom:'2.5rem', maxWidth:340 }}>
            Connect with top specialists, manage appointments, and take control of your health journey.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {FEATURES.map(f => (
              <div key={f.t} style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{f.icon}</div>
                <div>
                  <div style={{ color:'white', fontWeight:600, fontSize:'0.88rem' }}>{f.t}</div>
                  <div style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.78rem' }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:32, marginTop:'3rem', paddingTop:'2rem', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
            {[['10K+','Patients'],['200+','Doctors'],['98%','Satisfaction']].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.8rem', fontWeight:700, color:'white', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-card fade-in">
          <div style={{ marginBottom:'2rem' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2rem', color:'var(--dark)' }}>Welcome back</h3>
            <p style={{ fontSize:'0.85rem', color:'var(--gray-600)', marginTop:4 }}>Sign in to access your health dashboard</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ borderRadius:'var(--r-md)', fontSize:'0.85rem', borderLeft:'3px solid var(--red)', marginBottom:16 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="clinic-form">
            <div className="mb-3">
              <label>Email Address</label>
              <input type="email" className="form-control" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required autoFocus/>
            </div>
            <div className="mb-4">
              <label>Password</label>
              <input type="password" className="form-control" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required/>
            </div>
            <button type="submit" className="btn btn-red w-100 mb-2" disabled={loading}>
              {loading
                ? <span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm"/>Signing in...</span>
                : 'Sign In →'
              }
            </button>
          </form>

          <div className="or-divider">OR</div>

          <button className="btn w-100 mb-3" onClick={() => { loginAsGuest(); navigate('/'); }}
            style={{ border:'1.5px solid var(--gray-200)', borderRadius:'var(--r-md)', padding:'11px', fontSize:'0.875rem', color:'var(--gray-600)', fontFamily:'Outfit, sans-serif', background:'var(--gray-50)', transition:'all 0.2s', fontWeight:500 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight:7, verticalAlign:'middle' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Continue as Guest
          </button>

          <p style={{ textAlign:'center', fontSize:'0.85rem', color:'var(--gray-600)' }}>
            No account?{' '}
            <Link to="/register" style={{ color:'var(--red)', fontWeight:600, textDecoration:'none' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
