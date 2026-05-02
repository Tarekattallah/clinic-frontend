import { useEffect, useState, useRef } from 'react';
import { getAppointments, getAllAppointments, updateAppointment, cancelAppointment, addMedicalRecord, getMedicalRecord } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initParticles } from '../utils/particles';

const SL = { pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled' };
const fmt = (d) => new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

function StatusBadge({ status }) {
  const colors = { pending:'#B7791F,#FEF3C7', confirmed:'#1B4F72,#D6EAF8', completed:'#2D6A4F,#D8F3DC', cancelled:'#A93226,#FADBD8' };
  const [fg, bg] = (colors[status] || '#666,#eee').split(',');
  return <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:700, background:bg, color:fg, letterSpacing:'0.03em' }}>{SL[status] || status}</span>;
}

function MedRecordModal({ appointment, onClose }) {
  const toast = useToast();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';
  const [form, setForm]   = useState({ diagnosis:'', prescription:'', notes:'' });
  const [record, setRecord] = useState(null);
  const [loading, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);

  document.title = 'MediCare — Appointments';
  useEffect(() => {
    getMedicalRecord(appointment._id)
      .then(r => setRecord(r.data.record))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [appointment._id]);

  const save = async () => {
    if (!form.diagnosis) { toast('Diagnosis is required', 'error'); return; }
    setSaving(true);
    try {
      const r = await addMedicalRecord(appointment._id, form);
      setRecord(r.data.record);
      toast('Medical record saved ✓', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  // Print prescription as a proper medical document
  const handlePrint = () => {
    const doctorName = appointment.doctor?.user?.name || 'Doctor';
    const specs = appointment.doctor?.specialties?.map(s => s.name).join(', ') || '';
    const patientName = appointment.patient?.name || 'Patient';
    const dateStr = new Date(appointment.dateTime).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"/>
<title>Prescription — Dr. ${doctorName}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Georgia', serif; color: #1a1a2e; padding: 0; background: white; }
  .page { max-width: 700px; margin: 0 auto; padding: 40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:20px; border-bottom: 3px solid #c8272d; margin-bottom:24px; }
  .logo { font-size:1.6rem; font-weight:700; color:#c8272d; letter-spacing:-0.5px; }
  .logo span { color:#1a1a2e; }
  .doc-info { text-align:right; }
  .doc-info h2 { font-size:1.2rem; color:#1a1a2e; }
  .doc-info p { font-size:0.82rem; color:#666; margin-top:2px; }
  .rx-badge { background:#c8272d; color:white; font-size:2.5rem; font-weight:900; font-style:italic; padding:6px 18px; border-radius:6px; display:inline-block; margin-bottom:20px; font-family:serif; }
  .patient-box { background:#fdf6f6; border:1px solid #f0d5d5; border-radius:8px; padding:14px 18px; margin-bottom:24px; display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .patient-box .label { font-size:0.7rem; text-transform:uppercase; letter-spacing:.06em; color:#999; margin-bottom:2px; }
  .patient-box .val { font-size:0.92rem; font-weight:600; color:#1a1a2e; }
  .section { margin-bottom:22px; }
  .section h3 { font-size:0.72rem; text-transform:uppercase; letter-spacing:.08em; color:#c8272d; margin-bottom:10px; font-family:sans-serif; font-weight:700; border-bottom:1px solid #f0d5d5; padding-bottom:6px; }
  .section p { font-size:0.95rem; line-height:1.8; color:#1a1a2e; white-space:pre-wrap; }
  .med-item { display:flex; align-items:flex-start; gap:10px; margin-bottom:8px; padding:10px 14px; background:#fdf6f6; border-radius:6px; border-left:3px solid #c8272d; }
  .med-num { background:#c8272d; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0; font-family:sans-serif; margin-top:1px; }
  .pharmacy-box { background:#f0f8ff; border:1px solid #c8e6f9; border-radius:8px; padding:16px 18px; margin-top:24px; }
  .pharmacy-box h3 { font-size:0.72rem; text-transform:uppercase; letter-spacing:.08em; color:#1565c0; margin-bottom:10px; font-family:sans-serif; font-weight:700; }
  .pharmacy-box p { font-size:0.85rem; color:#333; line-height:1.7; }
  .pharmacy-box ul { margin:8px 0 0 18px; }
  .pharmacy-box ul li { font-size:0.83rem; color:#333; margin-bottom:4px; }
  .footer { margin-top:40px; padding-top:16px; border-top:2px solid #c8272d; display:flex; justify-content:space-between; align-items:flex-end; }
  .sig { text-align:right; }
  .sig .sig-line { width:180px; border-bottom:1px solid #333; margin-bottom:6px; height:40px; }
  .sig p { font-size:0.78rem; color:#666; }
  .disclaimer { font-size:0.72rem; color:#999; text-align:center; margin-top:16px; font-family:sans-serif; }
  @media print { body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }
</style>
</head>
<body><div class="page">
  <div class="header">
    <div>
      <div class="logo">✚ Medi<span>Care</span></div>
      <p style="font-size:0.78rem;color:#999;margin-top:4px;font-family:sans-serif;">Medical Prescription</p>
    </div>
    <div class="doc-info">
      <h2>Dr. ${doctorName}</h2>
      ${specs ? `<p>${specs}</p>` : ''}
      <p style="margin-top:4px;font-size:0.78rem;">Date: ${dateStr}</p>
    </div>
  </div>

  <div class="rx-badge">Rx</div>

  <div class="patient-box">
    <div><div class="label">Patient Name</div><div class="val">${patientName}</div></div>
    <div><div class="label">Visit Date</div><div class="val">${dateStr}</div></div>
  </div>

  ${record.diagnosis ? `
  <div class="section">
    <h3>🩺 Diagnosis</h3>
    <p>${record.diagnosis}</p>
  </div>` : ''}

  ${record.prescription ? `
  <div class="section">
    <h3>💊 Prescribed Medications</h3>
    ${record.prescription.split('\n').filter(l => l.trim()).map((line, i) =>
      `<div class="med-item"><div class="med-num">${i+1}</div><div>${line.trim()}</div></div>`
    ).join('')}
  </div>` : ''}

  ${record.notes ? `
  <div class="section">
    <h3>📝 Doctor's Instructions</h3>
    <p>${record.notes}</p>
  </div>` : ''}

  <div class="pharmacy-box">
    <h3>🏪 How to Fill This Prescription</h3>
    <p>Take this prescription to any licensed pharmacy:</p>
    <ul>
      <li>Show this document to the pharmacist</li>
      <li>Government pharmacies (صيدليات الشعب) offer discounted prices</li>
      <li>Private pharmacies are available 24/7 in most areas</li>
      <li>Ask the pharmacist about generic alternatives to save cost</li>
      <li>Keep your medications in a cool, dry place</li>
    </ul>
    <p style="margin-top:10px;font-size:0.8rem;color:#1565c0;font-weight:600;">
      ⚠️ Take medications exactly as prescribed. Contact your doctor if you experience any side effects.
    </p>
  </div>

  <div class="footer">
    <div style="font-size:0.8rem;color:#999;font-family:sans-serif;">
      <p>Prescription ID: <strong>${appointment._id?.slice(-8).toUpperCase()}</strong></p>
      <p>Valid for: 30 days from date of issue</p>
    </div>
    <div class="sig">
      <div class="sig-line"></div>
      <p>Dr. ${doctorName}</p>
      ${specs ? `<p style="color:#c8272d;">${specs}</p>` : ''}
    </div>
  </div>
  <div class="disclaimer">
    This is a digital medical prescription generated by MediCare. For emergencies, call 123.
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body></html>`);
    win.document.close();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <h5>📋 Medical Record</h5>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">
          {/* Appointment info */}
          <div style={{ background:'var(--red-muted)', border:'1px solid rgba(200,39,45,0.15)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:20 }}>
            <div style={{ fontSize:'0.72rem', color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Appointment Info</div>
            <div style={{ fontWeight:700 }}>{isDoctor ? appointment.patient?.name : `Dr. ${appointment.doctor?.user?.name || '—'}`}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--gray-600)', marginTop:2 }}>{fmt(appointment.dateTime)}</div>
          </div>

          {loading ? <div style={{ textAlign:'center', padding:'20px 0' }}><div className="red-spinner"/></div>
          : record ? (
            <div>
              {[
                ['🩺 Diagnosis', record.diagnosis],
                ['💊 Prescription', record.prescription],
                ['📝 Notes', record.notes]
              ].map(([label, val]) => val ? (
                <div key={label} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6, fontWeight:700 }}>{label}</div>
                  <div style={{ fontSize:'0.9rem', color:'var(--dark)', lineHeight:1.6, padding:'10px 14px', background:'var(--gray-50)', borderRadius:'var(--r-md)', border:'1px solid var(--gray-200)', whiteSpace:'pre-wrap' }}>{val}</div>
                </div>
              ) : null)}

              {/* Pharmacy instructions for patient */}
              {isPatient && record.prescription && (
                <div style={{ background:'#f0f8ff', border:'1px solid #c8e6f9', borderRadius:'var(--r-md)', padding:'14px 16px', marginTop:8, marginBottom:16 }}>
                  <div style={{ fontSize:'0.72rem', color:'#1565c0', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700, marginBottom:8 }}>🏪 كيفية صرف الروشته</div>
                  <ul style={{ margin:'0 0 0 16px', fontSize:'0.82rem', color:'#333', lineHeight:1.8 }}>
                    <li>خود الروشته لأي صيدلية</li>
                    <li>صيدليات الشعب بتوفر أسعار مخفضة</li>
                    <li>ممكن تسأل الصيدلاني عن بديل جنيريك بسعر أرخص</li>
                    <li>خليك ملتزم بالجرعة والمواعيد اللي الدكتور وصفها</li>
                  </ul>
                  <button
                    onClick={handlePrint}
                    style={{ marginTop:12, width:'100%', padding:'9px', background:'#1565c0', color:'white', border:'none', borderRadius:'var(--r-md)', cursor:'pointer', fontSize:'0.85rem', fontWeight:700, fontFamily:'Outfit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    🖨️ Print / Download Prescription
                  </button>
                </div>
              )}

              {/* Doctor can also print */}
              {isDoctor && record.prescription && (
                <button
                  onClick={handlePrint}
                  style={{ marginBottom:12, width:'100%', padding:'9px', background:'var(--gray-100)', color:'var(--dark)', border:'1px solid var(--gray-200)', borderRadius:'var(--r-md)', cursor:'pointer', fontSize:'0.82rem', fontFamily:'Outfit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  🖨️ Print Prescription
                </button>
              )}

              <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginTop:4 }}>
                Record added {new Date(record.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
              </div>
            </div>
          ) : isDoctor ? (
            <div className="clinic-form">
              <div className="mb-3">
                <label>Diagnosis *</label>
                <textarea className="form-control" rows={2} placeholder="Patient diagnosis..." value={form.diagnosis} onChange={e => setForm({...form, diagnosis:e.target.value})}/>
              </div>
              <div className="mb-3">
                <label>Prescription <span style={{ fontSize:'0.75rem', color:'var(--gray-500)', fontWeight:400 }}>(each medication on a new line)</span></label>
                <textarea className="form-control" rows={4} placeholder={"e.g.\nParacetamol 500mg — 3 times daily\nAmoxicillin 250mg — twice daily for 7 days"} value={form.prescription} onChange={e => setForm({...form, prescription:e.target.value})}/>
              </div>
              <div className="mb-4">
                <label>Additional Notes & Instructions</label>
                <textarea className="form-control" rows={2} placeholder="Follow-up date, rest advice, diet instructions..." value={form.notes} onChange={e => setForm({...form, notes:e.target.value})}/>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-red flex-grow-1" onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save Record'}
                </button>
                <button className="btn btn-outline-red" onClick={onClose}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="empty-state py-3">
              <p style={{ fontSize:'0.88rem' }}>No medical record yet for this appointment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [recModal, setRecModal] = useState(null);
  const { user } = useAuth();
  const toast = useToast();
  const bgRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('appt-bg', 'light'); }, 60);
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const fetchAll = async () => {
    try {
      const r = user.role === 'admin' ? await getAllAppointments() : await getAppointments();
      const appts = r.data.appointments || r.data;
      setAppointments(Array.isArray(appts) ? appts : []);
    } catch { toast('Failed to load appointments', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateAppointment(id, status);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast(`Appointment ${status}`, 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status:'cancelled' } : a));
      toast('Appointment cancelled', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to cancel', 'error'); }
  };

  const tabs = ['all','pending','confirmed','completed','cancelled'];
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
  const count = (s) => s === 'all' ? appointments.length : appointments.filter(a => a.status === s).length;

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="appt-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>
      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:16 }}>
          <div>
            <div className="hero-tag" style={{ background:'var(--red-muted)', border:'1px solid rgba(200,39,45,0.2)', color:'var(--red)', backdropFilter:'none', width:'fit-content' }}>📅 Appointments</div>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2.2rem', marginTop:10 }}>
              {user.role === 'doctor' ? 'My ' : ''}<em style={{ fontStyle:'italic', color:'var(--red)' }}>Schedule</em>
            </h2>
            <div className="red-rule"/>
          </div>
          <div style={{ display:'flex', gap:16, flexShrink:0 }}>
            {[{ l:'Total', n:appointments.length },{ l:'Pending', n:count('pending') },{ l:'Completed', n:count('completed') }].map(({ l, n }) => (
              <div key={l} style={{ textAlign:'center', padding:'10px 18px', background:'var(--white)', borderRadius:'var(--r-md)', border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-xs)' }}>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.6rem', color:'var(--red)', fontWeight:700, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap', background:'var(--gray-100)', padding:6, borderRadius:'var(--r-md)', width:'fit-content' }}>
          {tabs.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ border:'none', borderRadius:10, padding:'8px 16px', cursor:'pointer', fontSize:'0.82rem', fontFamily:'Outfit, sans-serif', fontWeight:600, transition:'all 0.2s', background: filter === s ? 'var(--red)' : 'transparent', color: filter === s ? 'white' : 'var(--gray-600)' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{ marginLeft:6, background: filter === s ? 'rgba(255,255,255,0.25)' : 'var(--gray-200)', color: filter === s ? 'white' : 'var(--gray-600)', borderRadius:10, padding:'1px 7px', fontSize:'0.72rem' }}>{count(s)}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="clinic-card"><div className="empty-state"><span className="empty-icon">📅</span><h5>No appointments found</h5></div></div>
        ) : (
          <div className="clinic-card">
            <div className="table-responsive">
              <table className="clinic-table">
                <thead>
                  <tr>
                    <th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Notes</th><th>Status</th>
                    {(user.role === 'doctor' || user.role === 'patient') && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(appt => (
                    <tr key={appt._id}>
                      <td><div style={{ fontWeight:600 }}>{appt.patient?.name}</div><div style={{ fontSize:'0.75rem', color:'var(--gray-600)' }}>{appt.patient?.email}</div></td>
                      <td style={{ fontWeight:500 }}>{appt.doctor?.user?.name ? `Dr. ${appt.doctor.user.name}` : '—'}</td>
                      <td style={{ fontSize:'0.83rem', color:'var(--gray-700)', fontFamily:'monospace' }}>{fmt(appt.dateTime)}</td>
                      <td style={{ maxWidth:180, fontSize:'0.83rem', color:'var(--gray-600)', fontStyle: appt.notes?'normal':'italic' }}>{appt.notes || '—'}</td>
                      <td><StatusBadge status={appt.status}/></td>
                      {(user.role === 'doctor' || user.role === 'patient') && (
                        <td>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {/* Doctor: confirm pending */}
                            {user.role === 'doctor' && appt.status === 'pending' && (
                              <button className="btn btn-outline-red btn-sm" style={{ fontSize:'0.75rem', padding:'4px 10px' }} onClick={() => handleStatus(appt._id, 'confirmed')}>Confirm</button>
                            )}
                            {/* Doctor: complete confirmed */}
                            {user.role === 'doctor' && appt.status === 'confirmed' && (
                              <button className="btn btn-outline-red btn-sm" style={{ fontSize:'0.75rem', padding:'4px 10px' }} onClick={() => handleStatus(appt._id, 'completed')}>Complete</button>
                            )}
                            {/* Medical record */}
                            {appt.status === 'completed' && (
                              <button className="btn btn-outline-red btn-sm" style={{ fontSize:'0.75rem', padding:'4px 10px' }} onClick={() => setRecModal(appt)}>
                                {user.role === 'doctor' ? '+ Record' : 'View Record'}
                              </button>
                            )}
                            {/* Cancel */}
                            {['pending','confirmed'].includes(appt.status) && (
                              <button style={{ background:'none', border:'1.5px solid var(--gray-200)', color:'var(--gray-600)', borderRadius:'var(--r-sm)', padding:'4px 10px', cursor:'pointer', fontSize:'0.75rem', fontFamily:'Outfit' }} onClick={() => handleCancel(appt._id)}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {recModal && <MedRecordModal appointment={recModal} onClose={() => setRecModal(null)} />}
    </div>
  );
}
