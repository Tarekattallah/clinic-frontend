import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();
  return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem', position:'relative' }}>
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'10rem', fontWeight:700, color:'var(--gray-200)', lineHeight:1, userSelect:'none' }}>404</div>
      <div style={{ marginTop:-20, position:'relative', zIndex:1 }}>
        <div style={{ fontSize:'2.5rem' }}>🏥</div>
        <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2rem', marginTop:12 }}>Page Not Found</h2>
        <p style={{ color:'var(--gray-600)', fontSize:'0.95rem', marginTop:8, maxWidth:380 }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:24, flexWrap:'wrap' }}>
          <Link to="/" className="btn btn-red">← Go Home</Link>
          <Link to="/doctors" className="btn btn-outline-red">Browse Doctors</Link>
          {user?.role === 'patient' && <Link to="/book" className="btn btn-outline-red">Book Appointment</Link>}
        </div>
      </div>
    </div>
  );
}
