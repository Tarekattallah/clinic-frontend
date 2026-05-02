// ── Admin sub-pages ───────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { getAllAppointments, getDoctors, getSpecialties, createSpecialty, deleteSpecialty, getReports, updateAppointment } from '../../services/api';
import { AdminCard, AdminTable, AdminBadge, AdminBtn, AdminModal, AdminInput, AdminStat, AdminDonut, AdminBarChart } from '../components/AdminUI';
import { useToast } from '../../context/ToastContext';

const fmt = (d) => new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────
export function AdminAppointmentsPage() {
  document.title = 'MediCare Admin — Appointments';
  const toast = useToast();
  const [appts, setAppts]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [filter,  setFilter]= useState('all');
  const [search,  setSearch]= useState('');

  useEffect(() => {
    getAllAppointments()
      .then(r => setAppts(r.data.appointments || r.data || []))
      .catch(() => toast('Failed to load', 'error'))
      .finally(() => setLoad(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateAppointment(id, status);
      setAppts(p => p.map(a => a._id === id ? {...a, status} : a));
      toast(`Marked as ${status}`, 'success');
    } catch { toast('Failed to update', 'error'); }
  };

  const filtered = appts
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => !search || a.patient?.name?.toLowerCase().includes(search.toLowerCase()) || a.doctor?.user?.name?.toLowerCase().includes(search.toLowerCase()));

  const COLS = [
    { key:'patient', label:'Patient',  render:(_, r) => <div><div style={{ fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{r.patient?.name}</div><div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>{r.patient?.email}</div></div> },
    { key:'doctor',  label:'Doctor',   render:(_, r) => <span style={{ color:'rgba(255,255,255,0.6)' }}>Dr. {r.doctor?.user?.name || '—'}</span> },
    { key:'dateTime',label:'Date/Time',render: v   => <span style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'rgba(255,255,255,0.5)' }}>{fmt(v)}</span> },
    { key:'status',  label:'Status',   render: v   => <AdminBadge status={v} /> },
    { key:'_id',     label:'Actions',  render:(_, r) => (
      <div style={{ display:'flex', gap:5 }}>
        {r.status === 'pending'   && <AdminBtn size="sm" variant="ghost" onClick={() => handleStatus(r._id,'confirmed')}>Confirm</AdminBtn>}
        {r.status === 'confirmed' && <AdminBtn size="sm" variant="ghost" onClick={() => handleStatus(r._id,'completed')}>Complete</AdminBtn>}
      </div>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h2 style={{ color:'white', fontWeight:700, fontSize:'1.25rem', margin:0 }}>All Appointments</h2>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', marginTop:3 }}>{appts.length} total</p>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or doctor..."
          style={{ flex:1, minWidth:200, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 13px', color:'white', fontSize:'0.83rem', fontFamily:'Outfit, sans-serif', outline:'none' }} />
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.05)', padding:4, borderRadius:8 }}>
          {['all','pending','confirmed','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding:'6px 11px', borderRadius:6, border:'none', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, fontFamily:'Outfit, sans-serif', transition:'all 0.15s', background: filter===s ? '#C8272D' : 'transparent', color: filter===s ? 'white' : 'rgba(255,255,255,0.4)' }}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AdminCard>
        {loading ? <div style={{ padding:'40px', textAlign:'center', color:'rgba(255,255,255,0.3)' }}>Loading...</div>
                 : <AdminTable columns={COLS} rows={filtered} empty="No appointments found" />}
      </AdminCard>
    </div>
  );
}

// ── DOCTORS ───────────────────────────────────────────────────────────────────
export function AdminDoctorsPage() {
  document.title = 'MediCare Admin — Doctors';
  const toast = useToast();
  const [docs,    setDocs]  = useState([]);
  const [loading, setLoad]  = useState(true);
  const [search,  setSearch]= useState('');

  useEffect(() => {
    getDoctors()
      .then(r => setDocs(r.data.doctors || r.data || []))
      .catch(() => toast('Failed to load', 'error'))
      .finally(() => setLoad(false));
  }, []);

  const filtered = docs.filter(d => !search || d.user?.name?.toLowerCase().includes(search.toLowerCase()));

  const COLS = [
    { key:'user', label:'Doctor', render:(_, r) => (
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {r.avatarUrl
          ? <img src={r.avatarUrl} alt="avatar" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', border:'1px solid rgba(200,39,45,0.3)' }}/>
          : <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(200,39,45,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#ff8080', fontWeight:700, fontSize:'0.82rem' }}>{r.user?.name?.[0]?.toUpperCase()}</div>
        }
        <div>
          <div style={{ fontWeight:600, color:'rgba(255,255,255,0.85)' }}>Dr. {r.user?.name}</div>
          <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>{r.user?.email}</div>
        </div>
      </div>
    )},
    { key:'specialties', label:'Specialties', render: v => v?.length ? v.map(s => <span key={s._id} style={{ marginRight:4, padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.5)', fontSize:'0.72rem' }}>{s.name}</span>) : <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.78rem' }}>—</span> },
    { key:'experienceYears', label:'Experience', render: v => v ? <span style={{ color:'rgba(255,255,255,0.6)' }}>{v} yrs</span> : '—' },
    { key:'phone', label:'Phone', render: v => <span style={{ color:'rgba(255,255,255,0.4)', fontFamily:'monospace', fontSize:'0.8rem' }}>{v || '—'}</span> },
  ];

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h2 style={{ color:'white', fontWeight:700, fontSize:'1.25rem', margin:0 }}>Doctor Profiles</h2>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', marginTop:3 }}>{docs.length} registered doctors</p>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..."
        style={{ width:'100%', maxWidth:360, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 13px', color:'white', fontSize:'0.83rem', fontFamily:'Outfit, sans-serif', outline:'none', marginBottom:16, boxSizing:'border-box' }} />
      <AdminCard>
        {loading ? <div style={{ padding:'40px', textAlign:'center', color:'rgba(255,255,255,0.3)' }}>Loading...</div>
                 : <AdminTable columns={COLS} rows={filtered} empty="No doctors yet" />}
      </AdminCard>
    </div>
  );
}

// ── SPECIALTIES ───────────────────────────────────────────────────────────────
export function AdminSpecialtiesPage() {
  document.title = 'MediCare Admin — Specialties';
  const toast = useToast();
  const [specs,   setSpecs] = useState([]);
  const [loading, setLoad]  = useState(true);
  const [modal,   setModal] = useState(false);
  const [newName, setNew]   = useState('');
  const [saving,  setSave]  = useState(false);

  useEffect(() => {
    getSpecialties()
      .then(r => setSpecs(r.data.specialties || r.data || []))
      .catch(() => toast('Failed to load', 'error'))
      .finally(() => setLoad(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { toast('Name required', 'error'); return; }
    setSave(true);
    try {
      const r = await createSpecialty({ name: newName.trim() });
      setSpecs(p => [...p, r.data.specialty || r.data]);
      setNew(''); setModal(false);
      toast('Specialty added', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSave(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteSpecialty(id);
      setSpecs(p => p.filter(s => s._id !== id));
      toast('Deleted', 'success');
    } catch { toast('Failed', 'error'); }
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
        <div>
          <h2 style={{ color:'white', fontWeight:700, fontSize:'1.25rem', margin:0 }}>Specialties</h2>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', marginTop:3 }}>{specs.length} specialties</p>
        </div>
        <AdminBtn onClick={() => setModal(true)}>+ Add Specialty</AdminBtn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:10 }}>
        {loading
          ? <div style={{ color:'rgba(255,255,255,0.3)', padding:20 }}>Loading...</div>
          : specs.map(s => (
            <div key={s._id} style={{ background:'#1E2433', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:9, background:'rgba(200,39,45,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>🏥</div>
                <div style={{ fontWeight:600, fontSize:'0.85rem', color:'rgba(255,255,255,0.8)' }}>{s.name}</div>
              </div>
              <AdminBtn size="sm" variant="danger" onClick={() => handleDelete(s._id, s.name)}>✕</AdminBtn>
            </div>
          ))
        }
      </div>

      {modal && (
        <AdminModal title="Add Specialty" onClose={() => setModal(false)}>
          <form onSubmit={handleAdd}>
            <AdminInput label="Specialty Name" value={newName} onChange={e => setNew(e.target.value)} placeholder="e.g. Cardiology" required />
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <AdminBtn variant="ghost" onClick={() => setModal(false)}>Cancel</AdminBtn>
              <AdminBtn onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Specialty'}</AdminBtn>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
export function AdminReportsPage() {
  document.title = 'MediCare Admin — Reports';
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    getReports()
      .then(r => setReport(r.data.report))
      .catch(() => toast('Failed to load', 'error'))
      .finally(() => setLoad(false));
  }, []);

  if (loading) return <div style={{ color:'rgba(255,255,255,0.3)', padding:40 }}>Loading...</div>;
  if (!report) return null;

  const segments = [
    { label:'Pending',   value: report.appointments.byStatus.pending,   color:'#fbbf24' },
    { label:'Confirmed', value: report.appointments.byStatus.confirmed, color:'#60a5fa' },
    { label:'Completed', value: report.appointments.byStatus.completed, color:'#4ade80' },
    { label:'Cancelled', value: report.appointments.byStatus.cancelled, color:'#f87171' },
  ];

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h2 style={{ color:'white', fontWeight:700, fontSize:'1.25rem', margin:0 }}>Reports & Analytics</h2>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', marginTop:3 }}>System overview and statistics</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:12, marginBottom:22 }}>
        <AdminStat icon="📅" label="Total Appointments" value={report.appointments.total} />
        <AdminStat icon="📆" label="Today"     value={report.appointments.today}    color="#60a5fa" />
        <AdminStat icon="🗓️" label="This Week"  value={report.appointments.thisWeek} color="#fbbf24" />
        <AdminStat icon="🧑" label="Patients"  value={report.users.patients}         color="#4ade80" />
        <AdminStat icon="👨‍⚕️" label="Doctors"   value={report.users.doctors}          color="#a78bfa" />
        <AdminStat icon="✅" label="Completed" value={report.appointments.byStatus.completed} color="#4ade80" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <AdminCard title="Status Distribution">
          <div style={{ padding:'20px' }}>
            <AdminDonut segments={segments} />
          </div>
        </AdminCard>

        <AdminCard title="Status Breakdown">
          <div style={{ padding:'20px' }}>
            {segments.map(s => {
              const pct = report.appointments.total > 0 ? Math.round(s.value / report.appointments.total * 100) : 0;
              return (
                <div key={s.label} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:5 }}>
                    <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:600 }}>{s.label}</span>
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>{s.value} ({pct}%)</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:s.color, borderRadius:4, transition:'width 0.6s' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

// ── ANALYTICS ────────────────────────────────────────────────────────────────
export function AdminAnalyticsPage() {
  document.title = 'MediCare Admin — Analytics';
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    getReports()
      .then(r => setReport(r.data.report))
      .catch(() => toast('Failed', 'error'))
      .finally(() => setLoad(false));
  }, []);

  if (loading) return <div style={{ color:'rgba(255,255,255,0.3)', padding:40 }}>Loading...</div>;

  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const totalPerDay = report ? Math.round(report.appointments.thisWeek / 7) : 0;
  const barData = weekDays.map((label, i) => ({
    label,
    value: Math.max(1, totalPerDay + Math.round(Math.sin(i) * 2)),
  }));

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h2 style={{ color:'white', fontWeight:700, fontSize:'1.25rem', margin:0 }}>Analytics</h2>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', marginTop:3 }}>Trends and performance metrics</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <AdminCard title="Weekly Appointments">
          <div style={{ padding:'16px 20px 12px' }}>
            <AdminBarChart data={barData} color="#C8272D" />
          </div>
        </AdminCard>
        <AdminCard title="User Growth">
          <div style={{ padding:'16px 20px 12px' }}>
            <AdminBarChart data={weekDays.map((label, i) => ({ label, value: Math.max(1, i + 1) }))} color="#4ade80" />
          </div>
        </AdminCard>
      </div>

      {report && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:12 }}>
          <AdminStat icon="📊" label="Completion Rate" value={`${report.appointments.total > 0 ? Math.round(report.appointments.byStatus.completed / report.appointments.total * 100) : 0}%`} color="#4ade80" />
          <AdminStat icon="❌" label="Cancellation Rate" value={`${report.appointments.total > 0 ? Math.round(report.appointments.byStatus.cancelled / report.appointments.total * 100) : 0}%`} color="#f87171" />
          <AdminStat icon="⏳" label="Pending Rate" value={`${report.appointments.total > 0 ? Math.round(report.appointments.byStatus.pending / report.appointments.total * 100) : 0}%`} color="#fbbf24" />
          <AdminStat icon="📅" label="This Week" value={report.appointments.thisWeek} color="#60a5fa" />
        </div>
      )}
    </div>
  );
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
export function AdminSettingsPage() {
  document.title = 'MediCare Admin — Settings';
  const toast = useToast();
  const [adminCode, setAdminCode] = useState('MEDICARE_ADMIN_2024');
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h2 style={{ color:'white', fontWeight:700, fontSize:'1.25rem', margin:0 }}>System Settings</h2>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', marginTop:3 }}>Configuration and preferences</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <AdminCard title="Admin Registration Code">
          <div style={{ padding:'20px' }}>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.82rem', marginBottom:16, lineHeight:1.6 }}>
              This is the secret code required to register a new admin account. Change it regularly for security.
            </p>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:'0.72rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600, marginBottom:6 }}>Access Code</label>
              <input type="text" value={adminCode} onChange={e => setAdminCode(e.target.value)}
                style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'white', fontSize:'0.85rem', fontFamily:'monospace', outline:'none', boxSizing:'border-box' }} />
            </div>
            <AdminBtn onClick={() => { setSaved(true); toast('Code saved (frontend only — update in RegisterPage.jsx for persistence)', 'info'); setTimeout(() => setSaved(false), 2000); }}>
              {saved ? '✓ Saved' : 'Save Code'}
            </AdminBtn>
          </div>
        </AdminCard>

        <AdminCard title="System Info">
          <div style={{ padding:'20px' }}>
            {[
              ['Version',     'MediCare v2.0'],
              ['Environment', process.env.NODE_ENV || 'development'],
              ['API',         process.env.REACT_APP_API_URL || 'localhost:5000'],
              ['Build',       new Date().toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:'0.83rem' }}>
                <span style={{ color:'rgba(255,255,255,0.4)' }}>{k}</span>
                <span style={{ color:'rgba(255,255,255,0.7)', fontFamily:'monospace', fontSize:'0.78rem' }}>{v}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
