import { useState } from 'react';
import api from '../services/api';
const addRecord = (data) => api.post('/medical-records', data);

export default function AddMedicalRecord({ appointment, onClose, onSuccess }) {
  const [form, setForm]   = useState({ diagnosis:'', prescription:'', notes:'' });
  const [loading, setL]   = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setError(''); setL(true);
    try { await addRecord({ appointmentId:appointment._id, ...form }); onSuccess(); }
    catch(err){ setError(err.response?.data?.message||'An error occurred.'); } finally{ setL(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h5>📋 Add Medical Record</h5>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">
          <div style={{ background:'var(--red-muted)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:20, border:'1px solid rgba(200,39,45,0.15)' }}>
            <div style={{ fontSize:'0.72rem', color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Appointment</div>
            <div style={{ fontWeight:700, color:'var(--dark)' }}>{appointment.patient?.name}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--gray-600)', marginTop:2 }}>{new Date(appointment.dateTime).toLocaleString('en-GB')}</div>
          </div>

          {error && <div className="alert alert-danger" style={{ borderRadius:'var(--r-md)', borderLeft:'3px solid var(--red)', fontSize:'0.85rem', marginBottom:16 }}>{error}</div>}

          <form onSubmit={submit} className="clinic-form">
            <div className="mb-3">
              <label>Diagnosis</label>
              <textarea className="form-control" rows={2} placeholder="Enter diagnosis..." value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})}/>
            </div>
            <div className="mb-3">
              <label>Prescription</label>
              <textarea className="form-control" rows={2} placeholder="Medications and dosages..." value={form.prescription} onChange={e=>setForm({...form,prescription:e.target.value})}/>
            </div>
            <div className="mb-4">
              <label>Additional Notes</label>
              <textarea className="form-control" rows={2} placeholder="Any additional observations..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-red flex-grow-1" disabled={loading}>
                {loading?<span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm"/>Saving...</span>:'💾 Save Record'}
              </button>
              <button type="button" className="btn btn-outline-red" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
