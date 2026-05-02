import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDoctors, getAvailableSlots, createAppointment } from '../services/api';
import { useToast } from '../context/ToastContext';
import { initParticles } from '../utils/particles';

const TIPS = [
  { icon:'⏰', t:'Arrive Early',         d:'Please arrive 10–15 minutes before your scheduled time.' },
  { icon:'📋', t:'Bring Records',        d:'Bring any previous test results or prescriptions.' },
  { icon:'💳', t:'Insurance Card',       d:'Have your insurance card ready if applicable.' },
  { icon:'🚫', t:'Cancellation Policy',  d:'Cancel at least 24 hours in advance to avoid a fee.' },
];

export default function BookAppointmentPage() {
  const [doctors, setDoctors]   = useState([]);
  const [selDoc, setSelDoc]     = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate]         = useState('');
  const [slots, setSlots]       = useState([]);
  const [selected, setSelected] = useState('');
  const [notes, setNotes]       = useState('');
  const [fetching, setFetching] = useState(true);
  const [loadingSlots, setLS]   = useState(false);
  const [booking, setBooking]   = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const bgRef    = useRef(null);
  const toast    = useToast();

  document.title = 'MediCare — Book Appointment';
  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('book-bg', 'light'); }, 60);
    getDoctors()
      .then(r => {
        const list = r.data.doctors || r.data;
        setDoctors(list);
        if (location.state?.doctorId) {
          const presel = list.find(d => d._id === location.state.doctorId);
          if (presel) { setDoctorId(presel._id); setSelDoc(presel); }
        }
      })
      .catch(() => toast('Failed to load doctors', 'error'))
      .finally(() => setFetching(false));
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const handleDocChange = (e) => {
    const id = e.target.value;
    setDoctorId(id);
    setSelDoc(doctors.find(d => d._id === id) || null);
    setSlots([]); setSelected('');
  };

  const loadSlots = async () => {
    if (!doctorId || !date) return;
    setLS(true); setSlots([]); setSelected('');
    try {
      const { data } = await getAvailableSlots(doctorId, date);
      setSlots(data.availableSlots || []);
      if ((data.availableSlots || []).length === 0) toast('No slots available for this date', 'info');
    } catch { toast('Failed to load slots', 'error'); }
    finally { setLS(false); }
  };

  const submit = async () => {
    if (!selected) { toast('Please select a time slot', 'error'); return; }
    setBooking(true);
    try {
      await createAppointment({ doctorId, dateTime: selected, notes });
      toast('✅ Appointment booked successfully!', 'success');
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      if (err.response?.data?.code === 'SLOT_TAKEN') {
        toast('That slot was just taken — please choose another time', 'error');
        loadSlots();
      } else {
        toast(err.response?.data?.message || 'Booking failed', 'error');
      }
    } finally { setBooking(false); }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (fetching) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="book-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.5 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div className="section-header">
          <div className="hero-tag" style={{ background:'var(--red-muted)', border:'1px solid rgba(200,39,45,0.2)', color:'var(--red)', backdropFilter:'none', width:'fit-content' }}>📅 New Appointment</div>
          <h2 style={{ marginTop:12 }}>Book an <em style={{ fontStyle:'italic', color:'var(--red)' }}>Appointment</em></h2>
          <div className="red-rule"/>
          <p>Select your preferred doctor and time slot below.</p>
        </div>

        <div className="row g-4">
          {/* Form */}
          <div className="col-12 col-lg-7">
            <div className="clinic-card p-4">
              <div className="clinic-form">
                {/* Doctor selector */}
                <div className="mb-4">
                  <label>Select Doctor</label>
                  <select className="form-select" value={doctorId} onChange={handleDocChange} required>
                    <option value="">— Choose a specialist —</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.user?.name}{d.specialties?.length ? ` · ${d.specialties.map(s => s.name).join(', ')}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected doctor preview */}
                {selDoc && (
                  <div style={{ background:'var(--red-muted)', borderRadius:'var(--r-md)', padding:'14px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:14, border:'1px solid rgba(200,39,45,0.15)' }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(200,39,45,0.2)', flexShrink:0, background:'var(--white)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {selDoc.avatarUrl ? (
                        <img src={selDoc.avatarUrl} alt={`Dr. ${selDoc.user?.name}`} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M12 12v4M10 14h4"/></svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--dark)' }}>Dr. {selDoc.user?.name}</div>
                      {selDoc.specialties?.length > 0 && <div style={{ fontSize:'0.78rem', color:'var(--red)', marginTop:2 }}>{selDoc.specialties.map(s => s.name).join(' · ')}</div>}
                      {selDoc.experienceYears > 0 && <div style={{ fontSize:'0.75rem', color:'var(--gray-600)', marginTop:2 }}>⏱ {selDoc.experienceYears} years experience</div>}
                    </div>
                  </div>
                )}

                {/* Date + slots */}
                <div className="mb-3">
                  <label>Select Date</label>
                  <div style={{ display:'flex', gap:10 }}>
                    <input type="date" className="form-control" value={date} min={minDate}
                      onChange={e => { setDate(e.target.value); setSlots([]); setSelected(''); }}
                      style={{ flex:1 }} />
                    <button type="button" className="btn btn-outline-red" onClick={loadSlots} disabled={!date || !doctorId || loadingSlots}>
                      {loadingSlots ? <span className="spinner-border spinner-border-sm"/> : 'Check'}
                    </button>
                  </div>
                </div>

                {/* Available slots grid */}
                {slots.length > 0 && (
                  <div className="mb-4">
                    <label>Available Times</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
                      {slots.map(s => {
                        const t = new Date(s).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
                        const active = selected === s;
                        return (
                          <button key={s} type="button" onClick={() => setSelected(s)}
                            style={{ padding:'7px 14px', borderRadius:10, border:`1.5px solid ${active?'var(--red)':'var(--gray-200)'}`, background:active?'var(--red)':'var(--white)', color:active?'white':'var(--dark)', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, fontFamily:'Outfit, monospace', transition:'all 0.15s' }}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {slots.length === 0 && date && !loadingSlots && doctorId && (
                  <div style={{ fontSize:'0.83rem', color:'var(--gray-400)', marginBottom:16, padding:'10px 14px', background:'var(--gray-50)', borderRadius:'var(--r-md)', border:'1px solid var(--gray-200)' }}>
                    No available slots for this date. Try another day.
                  </div>
                )}

                {/* Notes */}
                <div className="mb-4">
                  <label>Notes for Doctor (optional)</label>
                  <textarea className="form-control" rows={4}
                    placeholder="Describe your symptoms, concerns, or anything relevant the doctor should know..."
                    value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-red flex-grow-1" onClick={submit}
                    disabled={booking || !selected}>
                    {booking
                      ? <span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm"/>Booking...</span>
                      : '📅 Confirm Booking →'
                    }
                  </button>
                  <button type="button" className="btn btn-outline-red" onClick={() => navigate(-1)}>Back</button>
                </div>
              </div>
            </div>
          </div>

          {/* Tips sidebar */}
          <div className="col-12 col-lg-5">
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:'linear-gradient(135deg,var(--red),var(--red-deeper))', borderRadius:'var(--r-lg)', padding:'1.6rem', color:'white', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', right:'-10px', top:'-10px', fontSize:'6rem', opacity:0.07 }}>✚</div>
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.3rem', fontWeight:600, marginBottom:8 }}>Booking Tips</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {TIPS.map(tip => (
                      <div key={tip.t} style={{ display:'flex', gap:12 }}>
                        <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{tip.icon}</span>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{tip.t}</div>
                          <div style={{ fontSize:'0.78rem', opacity:0.75, marginTop:2, lineHeight:1.5 }}>{tip.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="clinic-card p-4">
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.1rem', fontWeight:600, marginBottom:12 }}>Available Hours</div>
                {[['Monday – Friday','8:00 AM – 8:00 PM'],['Saturday','9:00 AM – 5:00 PM'],['Sunday','10:00 AM – 3:00 PM'],['Emergency','24/7']].map(([d, h]) => (
                  <div key={d} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--gray-100)', fontSize:'0.85rem' }}>
                    <span style={{ color:'var(--gray-700)', fontWeight:500 }}>{d}</span>
                    <span style={{ color:'var(--red)', fontWeight:600 }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
