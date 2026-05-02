// ── Shared dark-theme UI components for Admin Dashboard ──────────────────────

// Stat card
export function AdminStat({ icon, label, value, sub, color = '#C8272D', trend }) {
  return (
    <div style={{ background:'#1E2433', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'20px 22px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', right:16, top:16, width:40, height:40, borderRadius:10, background:`${color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>{icon}</div>
      <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:'2rem', fontWeight:700, color:'white', lineHeight:1, marginBottom:4 }}>{value}</div>
      {sub && <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)' }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ position:'absolute', bottom:16, right:16, fontSize:'0.72rem', fontWeight:600, color: trend >= 0 ? '#4ade80' : '#f87171' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// Card wrapper
export function AdminCard({ children, title, action, style = {} }) {
  return (
    <div style={{ background:'#1E2433', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden', ...style }}>
      {title && (
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:'0.88rem', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{title}</div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Table
export function AdminTable({ columns, rows, empty = 'No data found' }) {
  if (!rows?.length) {
    return (
      <div style={{ padding:'48px', textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:'0.88rem' }}>
        <div style={{ fontSize:'2rem', marginBottom:8, opacity:0.4 }}>○</div>
        {empty}
      </div>
    );
  }
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.84rem' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ padding:'11px 16px', textAlign:'left', fontSize:'0.7rem', fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              {columns.map(col => (
                <td key={col.key} style={{ padding:'12px 16px', color:'rgba(255,255,255,0.7)', verticalAlign:'middle' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Status badge (dark version)
export function AdminBadge({ status }) {
  const map = {
    pending:   { bg:'rgba(234,179,8,0.15)',   color:'#fbbf24', label:'Pending'   },
    confirmed: { bg:'rgba(59,130,246,0.15)',  color:'#60a5fa', label:'Confirmed' },
    completed: { bg:'rgba(74,222,128,0.15)',  color:'#4ade80', label:'Completed' },
    cancelled: { bg:'rgba(248,113,113,0.15)', color:'#f87171', label:'Cancelled' },
    patient:   { bg:'rgba(59,130,246,0.15)',  color:'#60a5fa', label:'Patient'   },
    doctor:    { bg:'rgba(74,222,128,0.15)',  color:'#4ade80', label:'Doctor'    },
    admin:     { bg:'rgba(248,113,113,0.15)', color:'#f87171', label:'Admin'     },
  };
  const s = map[status] || { bg:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', label: status };
  return (
    <span style={{ padding:'3px 9px', borderRadius:20, fontSize:'0.72rem', fontWeight:700, background:s.bg, color:s.color, letterSpacing:'0.03em' }}>{s.label}</span>
  );
}

// Button
export function AdminBtn({ children, onClick, variant = 'primary', size = 'md', disabled, style = {} }) {
  const base = { border:'none', borderRadius:8, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily:'Outfit, sans-serif', fontWeight:600, transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:6, opacity: disabled ? 0.5 : 1 };
  const sizes = { sm:{ padding:'5px 12px', fontSize:'0.76rem' }, md:{ padding:'8px 16px', fontSize:'0.83rem' }, lg:{ padding:'11px 22px', fontSize:'0.9rem' } };
  const variants = {
    primary: { background:'#C8272D', color:'white' },
    ghost:   { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' },
    danger:  { background:'rgba(248,113,113,0.15)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// Input (dark)
export function AdminInput({ label, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600, marginBottom:6 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'white', fontSize:'0.85rem', fontFamily:'Outfit, sans-serif', outline:'none', transition:'border 0.15s', boxSizing:'border-box' }}
        onFocus={e => e.target.style.borderColor='rgba(200,39,45,0.5)'}
        onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
    </div>
  );
}

// Select (dark)
export function AdminSelect({ label, value, onChange, options, style = {} }) {
  return (
    <div style={{ marginBottom:16, ...style }}>
      {label && <label style={{ display:'block', fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600, marginBottom:6 }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ width:'100%', background:'#1E2433', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', color:'white', fontSize:'0.85rem', fontFamily:'Outfit, sans-serif', outline:'none', cursor:'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background:'#1E2433' }}>{o.label}</option>)}
      </select>
    </div>
  );
}

// Modal (dark)
export function AdminModal({ title, onClose, children, width = 480 }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#1E2433', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, width:'100%', maxWidth:width, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ fontSize:'1rem', fontWeight:600, color:'white' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:'1.1rem', lineHeight:1, padding:'2px 6px', borderRadius:4, transition:'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color='white'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.35)'}>✕</button>
        </div>
        <div style={{ padding:'20px 22px', overflowY:'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// Bar chart (CSS only)
export function AdminBarChart({ data, color = '#C8272D' }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80, padding:'0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ width:'100%', background:`${color}`, borderRadius:'3px 3px 0 0', height:`${(d.value / max) * 64}px`, minHeight:3, transition:'height 0.4s', opacity:0.8 }}/>
          <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.3)', whiteSpace:'nowrap' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// Donut chart (CSS only)
export function AdminDonut({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let cumPct = 0;
  const gradient = segments.map(s => {
    const pct = (s.value / total) * 100;
    const from = cumPct; cumPct += pct;
    return `${s.color} ${from}% ${cumPct}%`;
  }).join(', ');
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <div style={{ width:80, height:80, borderRadius:'50%', background:`conic-gradient(${gradient})`, flexShrink:0, position:'relative' }}>
        <div style={{ position:'absolute', inset:16, borderRadius:'50%', background:'#1E2433' }}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:s.color, flexShrink:0 }}/>
            <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)' }}>{s.label}</span>
            <span style={{ fontSize:'0.75rem', fontWeight:700, color:'rgba(255,255,255,0.8)', marginLeft:'auto' }}>{Math.round(s.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
