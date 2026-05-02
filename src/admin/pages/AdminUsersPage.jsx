import { useEffect, useState } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../services/api';
import { AdminCard, AdminTable, AdminBadge, AdminBtn, AdminModal, AdminInput, AdminSelect } from '../components/AdminUI';
import { useToast } from '../../context/ToastContext';

const ROLE_OPTS = [
  { value:'patient', label:'Patient' },
  { value:'doctor',  label:'Doctor'  },
  { value:'admin',   label:'Admin'   },
];

function UserModal({ editUser, onClose, onSave }) {
  const toast = useToast();
  const [form, setForm]   = useState({ name: editUser?.name||'', email: editUser?.email||'', password:'', role: editUser?.role||'patient' });
  const [saving, setSave] = useState(false);
  const isEdit = !!editUser;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { toast('Name and email required', 'error'); return; }
    if (!isEdit && form.password.length < 6) { toast('Password min 6 chars', 'error'); return; }
    setSave(true);
    try {
      const payload = { name:form.name, email:form.email, role:form.role };
      if (form.password) payload.password = form.password;
      const r = isEdit ? await updateUser(editUser._id, payload) : await createUser({ ...payload, password:form.password });
      toast(isEdit ? 'User updated' : 'User created', 'success');
      onSave(r.data.user);
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSave(false); }
  };

  return (
    <AdminModal title={isEdit ? 'Edit User' : 'Add New User'} onClose={onClose}>
      <form onSubmit={submit}>
        {/* Role selector */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:18 }}>
          {ROLE_OPTS.map(r => {
            const colors = { patient:'#60a5fa', doctor:'#4ade80', admin:'#f87171' };
            const active = form.role === r.value;
            return (
              <button key={r.value} type="button" onClick={() => setForm({...form, role:r.value})}
                style={{ padding:'10px 8px', borderRadius:8, border:`2px solid ${active ? colors[r.value] : 'rgba(255,255,255,0.08)'}`, background: active ? `${colors[r.value]}18` : 'transparent', color: active ? colors[r.value] : 'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'0.82rem', fontWeight:700, transition:'all 0.15s', fontFamily:'Outfit, sans-serif' }}>
                {r.label}
              </button>
            );
          })}
        </div>
        <AdminInput label="Full Name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Ahmed Hassan" required />
        <AdminInput label="Email" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="user@example.com" required />
        <AdminInput
          label={isEdit ? 'New Password (leave empty to keep)' : 'Password'}
          type="password" value={form.password}
          onChange={e => setForm({...form, password:e.target.value})}
          placeholder={isEdit ? 'Leave empty to keep current' : 'Min 6 characters'} />
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
          <AdminBtn variant="ghost" onClick={onClose}>Cancel</AdminBtn>
          <AdminBtn onClick={submit} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}</AdminBtn>
        </div>
      </form>
    </AdminModal>
  );
}

export default function AdminUsersPage() {
  document.title = 'MediCare Admin — Users';
  const toast = useToast();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoad]    = useState(true);
  const [modal,   setModal]   = useState(null); // null | 'add' | user object
  const [search,  setSearch]  = useState('');
  const [roleF,   setRoleF]   = useState('all');

  useEffect(() => {
    getAllUsers()
      .then(r => setUsers(r.data.users || r.data || []))
      .catch(() => toast('Failed to load users', 'error'))
      .finally(() => setLoad(false));
  }, []);

  const handleSave = (saved) => {
    setUsers(prev => {
      const ex = prev.find(u => u._id === saved._id);
      return ex ? prev.map(u => u._id === saved._id ? saved : u) : [saved, ...prev];
    });
    setModal(null);
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete "${u.name}"?`)) return;
    try {
      await deleteUser(u._id);
      setUsers(p => p.filter(x => x._id !== u._id));
      toast('User deleted', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const filtered = users
    .filter(u => roleF === 'all' || u.role === roleF)
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const COLS = [
    { key:'name',  label:'User', render:(v, row) => (
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(200,39,45,0.2)', border:'1px solid rgba(200,39,45,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.82rem', color:'#ff8080', flexShrink:0 }}>{v?.[0]?.toUpperCase()}</div>
        <div>
          <div style={{ fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{v}</div>
          <div style={{ fontSize:'0.73rem', color:'rgba(255,255,255,0.3)' }}>{row.email}</div>
        </div>
      </div>
    )},
    { key:'role',      label:'Role',   render: v => <AdminBadge status={v} /> },
    { key:'createdAt', label:'Joined', render: v => <span style={{ fontFamily:'monospace', fontSize:'0.78rem' }}>{new Date(v).toLocaleDateString('en-GB')}</span> },
    { key:'_id', label:'Actions', render:(_, row) => (
      <div style={{ display:'flex', gap:6 }}>
        <AdminBtn size="sm" variant="ghost" onClick={() => setModal(row)}>Edit</AdminBtn>
        {row.role !== 'admin' && <AdminBtn size="sm" variant="danger" onClick={() => handleDelete(row)}>Delete</AdminBtn>}
      </div>
    )},
  ];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
        <div>
          <h2 style={{ color:'white', fontWeight:700, fontSize:'1.25rem', margin:0 }}>User Management</h2>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', marginTop:3 }}>{users.length} total users</p>
        </div>
        <AdminBtn onClick={() => setModal('add')}>+ Add User</AdminBtn>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
          style={{ flex:1, minWidth:200, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 13px', color:'white', fontSize:'0.83rem', fontFamily:'Outfit, sans-serif', outline:'none' }}
          onFocus={e => e.target.style.borderColor='rgba(200,39,45,0.4)'}
          onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.05)', padding:4, borderRadius:8 }}>
          {['all','patient','doctor','admin'].map(r => (
            <button key={r} onClick={() => setRoleF(r)}
              style={{ padding:'6px 13px', borderRadius:6, border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'Outfit, sans-serif', transition:'all 0.15s', background: roleF===r ? '#C8272D' : 'transparent', color: roleF===r ? 'white' : 'rgba(255,255,255,0.45)' }}>
              {r.charAt(0).toUpperCase()+r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AdminCard>
        {loading
          ? <div style={{ padding:'40px', textAlign:'center', color:'rgba(255,255,255,0.3)' }}>Loading...</div>
          : <AdminTable columns={COLS} rows={filtered} empty="No users found" />
        }
      </AdminCard>

      {modal && <UserModal editUser={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
