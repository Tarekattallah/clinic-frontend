import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDoctors, getSpecialties, getAvailableSlots, createAppointment } from '../services/api';
import { useToast } from '../context/ToastContext';
import { initParticles } from '../utils/particles';

function SlotPicker({ doctor, onClose, onBooked }) {
  const toast = useToast();
  const [date, setDate]         = useState('');
  const [slots, setSlots]       = useState([]);
  const [selected, setSelected] = useState('');
  const [notes, setNotes]       = useState('');
  const [loadingSlots, setLS]   = useState(false);
  const [booking, setBooking]   = useState(false);

  const loadSlots = async () => {
    if (!date) return;
    setLS(true); setSlots([]); setSelected('');
    try {
      const { data } = await getAvailableSlots(doctor._id, date);
      setSlots(data.availableSlots || []);
    } catch { toast('فشل تحميل المواعيد', 'error'); }
    finally { setLS(false); }
  };

  const handleBook = async () => {
    if (!selected) { toast('اختار وقت أولاً', 'error'); return; }
    setBooking(true);
    try {
      await createAppointment({ doctorId: doctor._id, dateTime: selected, notes });
      toast('✅ تم الحجز بنجاح!', 'success');
      onBooked();
    } catch (err) {
      if (err.response?.data?.code === 'SLOT_TAKEN') {
        toast('الوقت ده اتحجز للتو، اختار وقت تاني', 'error');
        loadSlots();
      } else {
        toast(err.response?.data?.message || 'فشل الحجز', 'error');
      }
    } finally { setBooking(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h5>📅 Book with Dr. {doctor.user?.name}</h5>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">
          {/* Doctor info strip */}
          <div style={{ background:'var(--red-muted)', border:'1px solid rgba(200,39,45,0.15)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(200,39,45,0.2)', flexShrink:0, background:'var(--white)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {doctor.avatarUrl ? (
                <img src={doctor.avatarUrl} alt={`Dr. ${doctor.user?.name}`} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M12 12v4M10 14h4"/></svg>
              )}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--dark)' }}>Dr. {doctor.user?.name}</div>
              {doctor.specialties?.length > 0 && <div style={{ fontSize:'0.78rem', color:'var(--red)', marginTop:2 }}>{doctor.specialties.map(s => s.name).join(' · ')}</div>}
              {doctor.experienceYears > 0 && <div style={{ fontSize:'0.75rem', color:'var(--gray-600)', marginTop:2 }}>⏱ {doctor.experienceYears} years experience</div>}
            </div>
          </div>

          {/* Date picker */}
          <div className="clinic-form">
            <div className="mb-3">
              <label>Select Date</label>
              <input type="date" className="form-control" value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => { setDate(e.target.value); setSlots([]); setSelected(''); }} />
            </div>
            {date && (
              <button className="btn btn-outline-red btn-sm mb-3" onClick={loadSlots} disabled={loadingSlots}>
                {loadingSlots ? <><span className="spinner-border spinner-border-sm me-1"/>Loading...</> : '🔍 Check Available Slots'}
              </button>
            )}

            {/* Time slots */}
            {slots.length > 0 && (
              <div className="mb-3">
                <label>Available Times</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {slots.map(s => {
                    const t = new Date(s).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
                    const active = selected === s;
                    return (
                      <button key={s} type="button" onClick={() => setSelected(s)}
                        style={{ padding:'7px 14px', borderRadius:10, border:`1.5px solid ${active?'var(--red)':'var(--gray-200)'}`, background: active?'var(--red)':'var(--white)', color: active?'white':'var(--dark)', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, fontFamily:'Outfit, monospace', transition:'all 0.15s' }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {slots.length === 0 && date && !loadingSlots && (
              <div style={{ fontSize:'0.83rem', color:'var(--gray-400)', marginBottom:14, padding:'10px 14px', background:'var(--gray-50)', borderRadius:'var(--r-md)', border:'1px solid var(--gray-200)' }}>
                No available slots for this date. Try another day.
              </div>
            )}

            <div className="mb-4">
              <label>Notes (optional)</label>
              <textarea className="form-control" rows={3} placeholder="Describe your symptoms or concerns briefly..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-red flex-grow-1" onClick={handleBook} disabled={booking || !selected}>
                {booking ? <span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm"/>Booking...</span> : '📅 Confirm Appointment →'}
              </button>
              <button className="btn btn-outline-red" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const [doctors, setDoctors]     = useState([]);
  const [specs, setSpecs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [specFilter, setSpec]     = useState('');
  const [booking, setBooking]     = useState(null);
  const { user } = useAuth();
  const navigate  = useNavigate();
  const bgRef = useRef(null);
  const toast = useToast();

  document.title = 'MediCare — Our Doctors';
  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('docs-bg', 'light'); }, 60);
    Promise.all([getDoctors(), getSpecialties()])
      .then(([d, s]) => { setDoctors(d.data.doctors || d.data); setSpecs(s.data.specialties || s.data); })
      .catch(() => toast('Failed to load', 'error'))
      .finally(() => setLoading(false));
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const filtered = doctors.filter(d => {
    const nameMatch = d.user?.name?.toLowerCase().includes(search.toLowerCase());
    const specMatch = !specFilter || d.specialties?.some(s => s._id === specFilter || s.name === specFilter);
    return nameMatch && specMatch;
  });

  const isPatient = user?.role === 'patient';

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="docs-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>
      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div className="hero-section" style={{ padding:'3rem', marginBottom:'2.5rem' }}>
          <canvas id="docs-hero-cv" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>
          <div className="hero-cross" style={{ fontSize:'14rem', opacity:0.06 }}>✚</div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="hero-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight:6 }}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M12 12v4M10 14h4"/></svg>
              Medical Team
            </div>
            <h1 style={{ fontSize:'2.6rem' }}>Our Specialist <em>Doctors</em></h1>
            <p>Connect with our team of verified, experienced physicians across all specialties.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
          <div className="clinic-form" style={{ flex:1, minWidth:220 }}>
            <input className="form-control" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {specs.length > 0 && (
            <div className="clinic-form" style={{ minWidth:200 }}>
              <select className="form-select" value={specFilter} onChange={e => setSpec(e.target.value)}>
                <option value="">All Specialties</option>
                {specs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ fontSize:'0.82rem', color:'var(--gray-600)', fontWeight:500 }}>
            {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="clinic-card"><div className="empty-state"><span className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/></svg>
          </span><h5>No doctors found</h5><p style={{ marginTop:8, fontSize:'0.88rem' }}>Try adjusting your search.</p></div></div>
        ) : (
          <div className="row g-4">
            {filtered.map(doc => (
              <div className="col-12 col-sm-6 col-lg-4" key={doc._id}>
                <div className="doctor-card" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                  {/* Red banner with avatar overlapping */}
                  <div className="doc-banner" style={{ position:'relative', flexShrink:0 }}>
                    <div className="doc-avatar">
                      {doc.avatarUrl ? (
                        <img src={doc.avatarUrl} alt={`Dr. ${doc.user?.name}`}/>
                      ) : (
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="doc-body" style={{ display:'flex', flexDirection:'column', flex:1 }}>
                    <div className="doc-name">Dr. {doc.user?.name}</div>
                    <div className="doc-email">{doc.user?.email}</div>
                    {/* Specialties right under name */}
                    {doc.specialties?.length > 0 && (
                      <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:4 }}>
                        {doc.specialties.map(s => (
                          <span key={s._id} className="specialty-tag">
                            {s.icon && <span style={{ marginRight:3 }}>{s.icon}</span>}{s.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {doc.bio && <p style={{ fontSize:'0.82rem', color:'var(--gray-600)', marginTop:10, lineHeight:1.6, flexGrow:1 }}>{doc.bio}</p>}
                    <div style={{ display:'flex', gap:16, marginTop:10, fontSize:'0.78rem', color:'var(--gray-500)', flexWrap:'wrap' }}>
                      {doc.experienceYears > 0 && <span>⏱ {doc.experienceYears} yrs</span>}
                      {doc.phone && <span>📞 {doc.phone}</span>}
                    </div>
                    <div style={{ marginTop:14 }}>
                      {isPatient
                        ? <button className="btn btn-red w-100 btn-sm" onClick={() => setBooking(doc)}>📅 Book Appointment →</button>
                        : user?.isGuest
                          ? <button className="btn btn-outline-red w-100 btn-sm" onClick={() => navigate('/login')}>Sign In to Book</button>
                          : <div style={{ fontSize:'0.78rem', color:'var(--gray-400)', textAlign:'center', padding:'8px 0' }}>Available for patients</div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slot Picker Modal */}
      {booking && (
        <SlotPicker
          doctor={booking}
          onClose={() => setBooking(null)}
          onBooked={() => { setBooking(null); navigate('/appointments'); }}
        />
      )}
    </div>
  );
}
