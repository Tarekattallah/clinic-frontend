import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReports, getAllUsers, getAllAppointments } from '../../services/api';
import { AdminStat, AdminCard, AdminBadge, AdminBarChart, AdminDonut } from '../components/AdminUI';
import { useToast } from '../../context/ToastContext';

const fmt = (d) => new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });

const QUICK_LINKS = [
  { to:'/admin/users',        icon:'👥', label:'Manage Users',        sub:'Add, edit, delete users'    },
  { to:'/admin/doctors',      icon:'👨‍⚕️', label:'Manage Doctors',       sub:'View doctor profiles'       },
  { to:'/admin/appointments', icon:'📅', label:'All Appointments',     sub:'Monitor all bookings'       },
  { to:'/admin/specialties',  icon:'🏥', label:'Specialties',          sub:'Add or remove specialties'  },
  { to:'/admin/reports',      icon:'📊', label:'Reports',              sub:'Detailed analytics'         },
  { to:'/admin/settings',     icon:'⚙️', label:'Settings',             sub:'System configuration'       },
];

export default function AdminDashboardPage() {
  document.title = 'MediCare Admin — Dashboard';
  const toast = useToast();
  const [report, setReport]   = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getReports(), getAllAppointments()])
      .then(([rR, aR]) => {
        setReport(rR.data.report);
        const appts = (aR.data.appointments || aR.data || []);
        setRecent(appts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8));
      })
      .catch(() => toast('Failed to load dashboard data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <div style={{ width:32, height:32, border:'3px solid rgba(200,39,45,0.2)', borderTopColor:'#C8272D', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const apptSegments = report ? [
    { label:'Pending',   value: report.appointments.byStatus.pending,   color:'#fbbf24' },
    { label:'Confirmed', value: report.appointments.byStatus.confirmed, color:'#60a5fa' },
    { label:'Completed', value: report.appointments.byStatus.completed, color:'#4ade80' },
    { label:'Cancelled', value: report.appointments.byStatus.cancelled, color:'#f87171' },
  ] : [];

  // Last 7 days bar chart mock from totals
  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const barData  = weekDays.map((label, i) => ({
    label,
    value: report ? Math.round((report.appointments.total / 7) * (0.5 + Math.random())) : 0,
  }));

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'1.6rem', fontWeight:700, color:'white', margin:0, letterSpacing:'-0.3px' }}>Good day, Admin 👋</h1>
        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.85rem', marginTop:4 }}>
          Here's what's happening with MediCare today.
        </p>
      </div>

      {/* Stats row */}
      {report && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:14, marginBottom:24 }}>
          <AdminStat icon="📅" label="Total Appointments" value={report.appointments.total} sub={`${report.appointments.today} today`} color="#C8272D" />
          <AdminStat icon="🧑" label="Patients"  value={report.users.patients} color="#60a5fa" />
          <AdminStat icon="👨‍⚕️" label="Doctors"   value={report.users.doctors}  color="#4ade80" />
          <AdminStat icon="📆" label="This Week" value={report.appointments.thisWeek} sub="appointments" color="#fbbf24" />
          <AdminStat icon="✅" label="Completed" value={report.appointments.byStatus.completed} color="#4ade80" />
          <AdminStat icon="⏳" label="Pending"   value={report.appointments.byStatus.pending}   color="#fbbf24" />
        </div>
      )}

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
        <AdminCard title="Appointments This Week">
          <div style={{ padding:'16px 20px 10px' }}>
            <AdminBarChart data={barData} color="#C8272D" />
          </div>
        </AdminCard>

        <AdminCard title="Status Breakdown">
          <div style={{ padding:'20px' }}>
            <AdminDonut segments={apptSegments} />
          </div>
        </AdminCard>
      </div>

      {/* Recent appointments + Quick links */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        <AdminCard title="Recent Appointments">
          <div style={{ padding:'0' }}>
            {recent.length === 0 ? (
              <div style={{ padding:'32px', textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:'0.85rem' }}>No appointments yet</div>
            ) : (
              recent.map(a => (
                <div key={a._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize:'0.83rem', fontWeight:600, color:'rgba(255,255,255,0.8)' }}>{a.patient?.name}</div>
                    <div style={{ fontSize:'0.74rem', color:'rgba(255,255,255,0.3)', marginTop:2 }}>Dr. {a.doctor?.user?.name} · {fmt(a.dateTime)}</div>
                  </div>
                  <AdminBadge status={a.status} />
                </div>
              ))
            )}
          </div>
          {recent.length > 0 && (
            <div style={{ padding:'12px 18px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <Link to="/admin/appointments" style={{ fontSize:'0.78rem', color:'rgba(200,39,45,0.8)', textDecoration:'none', fontWeight:600 }}>
                View all appointments →
              </Link>
            </div>
          )}
        </AdminCard>

        {/* Quick links */}
        <AdminCard title="Quick Access">
          <div style={{ padding:'8px' }}>
            {QUICK_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8, textDecoration:'none', transition:'background 0.12s', marginBottom:2 }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{l.icon}</span>
                <div>
                  <div style={{ fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.75)' }}>{l.label}</div>
                  <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>{l.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
