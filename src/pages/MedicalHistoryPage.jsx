import { useEffect, useState, useRef } from 'react';
import { getAppointments, getMedicalRecord } from '../services/api';
import { useToast } from '../context/ToastContext';
import { initParticles } from '../utils/particles';

const fmt = (d) => new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

export default function MedicalHistoryPage() {
  const toast = useToast();
  const [appointments, setAppts] = useState([]);
  const [records, setRecords]    = useState({});
  const [loading, setLoading]    = useState(true);
  const [expanded, setExpanded]  = useState(null);
  const bgRef = useRef(null);

  document.title = 'MediCare — Medical History';
  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('mh-bg', 'light'); }, 60);
    getAppointments()
      .then(r => {
        const appts = (r.data.appointments || r.data).filter(a => a.status === 'completed');
        setAppts(appts);
      })
      .catch(() => toast('Failed to load history', 'error'))
      .finally(() => setLoading(false));
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const handleExpand = async (appt) => {
    if (expanded === appt._id) { setExpanded(null); return; }
    setExpanded(appt._id);
    if (records[appt._id]) return;
    try {
      const r = await getMedicalRecord(appt._id);
      setRecords(prev => ({ ...prev, [appt._id]: r.data.record }));
    } catch {
      setRecords(prev => ({ ...prev, [appt._id]: null }));
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="mh-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <div className="hero-tag" style={{ background:'var(--red-muted)', border:'1px solid rgba(200,39,45,0.2)', color:'var(--red)', backdropFilter:'none', width:'fit-content' }}>📋 Medical History</div>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2.2rem', marginTop:10 }}>
            Your <em style={{ fontStyle:'italic', color:'var(--red)' }}>Health Records</em>
          </h2>
          <div className="red-rule"/>
          <p style={{ color:'var(--gray-600)', fontSize:'0.92rem' }}>Click on any appointment to view the medical record.</p>
        </div>

        {appointments.length === 0 ? (
          <div className="clinic-card">
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <h5>No medical records yet</h5>
              <p style={{ marginTop:8, fontSize:'0.88rem' }}>Completed appointments with medical records will appear here.</p>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {appointments.map(appt => {
              const isOpen = expanded === appt._id;
              const record = records[appt._id];
              return (
                <div key={appt._id} className="clinic-card" style={{ overflow:'hidden', transition:'box-shadow 0.2s' }}>
                  {/* Header row */}
                  <div
                    onClick={() => handleExpand(appt)}
                    style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', userSelect:'none' }}>
                    <div style={{ width:48, height:48, background:'var(--red-muted)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
                        <path d="M12 12v4M10 14h4"/>
                      </svg>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--dark)' }}>
                        Dr. {appt.doctor?.user?.name || '—'}
                      </div>
                      <div style={{ fontSize:'0.8rem', color:'var(--gray-600)', marginTop:3, fontFamily:'monospace' }}>
                        {fmt(appt.dateTime)}
                      </div>
                      {appt.doctor?.specialties?.length > 0 && (
                        <div style={{ marginTop:5 }}>
                          {appt.doctor.specialties.map(s => (
                            <span key={s._id} className="specialty-tag" style={{ fontSize:'0.7rem' }}>{s.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ color:'var(--gray-400)', fontSize:'0.85rem', transition:'transform 0.2s', transform: isOpen?'rotate(180deg)':'rotate(0)' }}>▼</div>
                  </div>

                  {/* Expanded record */}
                  {isOpen && (
                    <div style={{ borderTop:'1px solid var(--gray-100)', padding:'20px 22px', background:'var(--gray-50)' }}>
                      {record === undefined ? (
                        <div style={{ textAlign:'center', padding:'16px 0' }}><div className="red-spinner"/></div>
                      ) : record === null ? (
                        <p style={{ fontSize:'0.88rem', color:'var(--gray-400)', fontStyle:'italic' }}>No medical record attached to this appointment.</p>
                      ) : (
                        <div style={{ display:'grid', gap:16 }}>
                          {[['🩺 Diagnosis', record.diagnosis], ['💊 Prescription', record.prescription], ['📝 Notes', record.notes]].map(([label, val]) => val ? (
                            <div key={label}>
                              <div style={{ fontSize:'0.72rem', color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700, marginBottom:6 }}>{label}</div>
                              <div style={{ fontSize:'0.9rem', color:'var(--dark)', lineHeight:1.7, padding:'12px 16px', background:'var(--white)', borderRadius:'var(--r-md)', border:'1px solid var(--gray-200)', whiteSpace:'pre-wrap' }}>{val}</div>
                            </div>
                          ) : null)}

                          {/* Pharmacy instructions + print */}
                          {record.prescription && (
                            <div style={{ background:'#f0f8ff', border:'1px solid #c8e6f9', borderRadius:'var(--r-md)', padding:'14px 16px' }}>
                              <div style={{ fontSize:'0.72rem', color:'#1565c0', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700, marginBottom:8 }}>🏪 كيفية صرف الروشته</div>
                              <ul style={{ margin:'0 0 8px 16px', fontSize:'0.82rem', color:'#333', lineHeight:1.8 }}>
                                <li>خود الروشته لأي صيدلية قريبة منك</li>
                                <li>صيدليات الشعب بتوفر أدوية بأسعار مدعومة</li>
                                <li>اسأل الصيدلاني عن بديل جنيريك إذا محتاج</li>
                                <li>التزم بالجرعة والمواعيد اللي الدكتور وصفها</li>
                              </ul>
                              <button
                                onClick={() => {
                                  const doctorName = appt.doctor?.user?.name || 'Doctor';
                                  const specs = appt.doctor?.specialties?.map(s => s.name).join(', ') || '';
                                  const dateStr = new Date(appt.dateTime).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
                                  const win = window.open('', '_blank');
                                  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Prescription</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#1a1a2e;padding:40px;max-width:700px;margin:0 auto}
.logo{font-size:1.6rem;font-weight:700;color:#c8272d;margin-bottom:4px}.header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #c8272d;margin-bottom:24px}
.rx{background:#c8272d;color:white;font-size:2rem;font-style:italic;padding:4px 16px;border-radius:6px;display:inline-block;margin-bottom:20px}
.patient-box{background:#fdf6f6;border:1px solid #f0d5d5;border-radius:8px;padding:14px 18px;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.label{font-size:0.7rem;text-transform:uppercase;letter-spacing:.06em;color:#999;margin-bottom:2px}.val{font-size:0.92rem;font-weight:600}
.sec h3{font-size:0.7rem;text-transform:uppercase;color:#c8272d;margin-bottom:10px;border-bottom:1px solid #f0d5d5;padding-bottom:6px;letter-spacing:.08em}
.sec p{font-size:0.93rem;line-height:1.8;white-space:pre-wrap}.med{display:flex;gap:10px;margin-bottom:8px;padding:10px 14px;background:#fdf6f6;border-radius:6px;border-left:3px solid #c8272d}
.num{background:#c8272d;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;margin-top:1px}
.pharm{background:#f0f8ff;border:1px solid #c8e6f9;border-radius:8px;padding:16px;margin-top:24px}
.pharm h3{font-size:0.7rem;text-transform:uppercase;color:#1565c0;margin-bottom:8px;letter-spacing:.08em}
.pharm li{font-size:0.83rem;margin-bottom:4px;margin-left:16px}
.footer{margin-top:36px;padding-top:16px;border-top:2px solid #c8272d;display:flex;justify-content:space-between;align-items:flex-end}
.sig-line{width:180px;border-bottom:1px solid #333;height:40px;margin-bottom:6px}.disclaimer{font-size:0.7rem;color:#999;text-align:center;margin-top:16px}
@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>
<div class="header"><div><div class="logo">✚ MediCare</div><p style="font-size:.78rem;color:#999">Medical Prescription</p></div>
<div style="text-align:right"><strong>Dr. ${doctorName}</strong>${specs ? `<br/><span style="font-size:.8rem;color:#c8272d">${specs}</span>` : ''}<br/><span style="font-size:.78rem;color:#999">${dateStr}</span></div></div>
<div class="rx">Rx</div>
<div class="patient-box"><div><div class="label">Patient</div><div class="val">${appt.patient?.name||'Patient'}</div></div><div><div class="label">Date</div><div class="val">${dateStr}</div></div></div>
${record.diagnosis ? `<div class="sec" style="margin-bottom:20px"><h3>🩺 Diagnosis</h3><p>${record.diagnosis}</p></div>` : ''}
${record.prescription ? `<div class="sec" style="margin-bottom:20px"><h3>💊 Prescribed Medications</h3>${record.prescription.split('\n').filter(l=>l.trim()).map((l,i)=>`<div class="med"><div class="num">${i+1}</div><div>${l.trim()}</div></div>`).join('')}</div>` : ''}
${record.notes ? `<div class="sec" style="margin-bottom:20px"><h3>📝 Instructions</h3><p>${record.notes}</p></div>` : ''}
<div class="pharm"><h3>🏪 How to Fill This Prescription</h3><ul><li>Show to any licensed pharmacist</li><li>Government pharmacies offer discounted prices</li><li>Ask for generic alternatives to save cost</li><li>Take medications exactly as prescribed</li></ul></div>
<div class="footer"><div style="font-size:.78rem;color:#999">ID: <strong>${appt._id?.slice(-8).toUpperCase()}</strong><br/>Valid 30 days</div>
<div><div class="sig-line"></div><p style="font-size:.82rem">Dr. ${doctorName}</p></div></div>
<div class="disclaimer">MediCare Digital Prescription — For emergencies call 123</div>
<script>window.onload=()=>window.print()</script></body></html>`);
                                  win.document.close();
                                }}
                                style={{ width:'100%', padding:'9px', background:'#1565c0', color:'white', border:'none', borderRadius:'var(--r-md)', cursor:'pointer', fontSize:'0.83rem', fontWeight:700, fontFamily:'Outfit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                                🖨️ Print / Download Prescription
                              </button>
                            </div>
                          )}

                          <div style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>
                            Record added {new Date(record.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
