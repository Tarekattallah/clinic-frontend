import { useState, useEffect, useRef } from 'react';
import { getMyDoctorProfile, updateDoctorProfile, uploadDoctorAvatar, deleteDoctorAvatar, getSpecialties } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initParticles } from '../utils/particles';

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const toast    = useToast();
  const bgRef    = useRef(null);
  const fileRef  = useRef(null);

  const [form, setForm]           = useState({ bio:'', phone:'', experienceYears:0 });
  const [allSpecs, setAll]        = useState([]);
  const [selSpecs, setSel]        = useState([]);
  const [avatarUrl, setAvatar]    = useState('');
  const [loading, setLoad]        = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(null);

  document.title = 'MediCare — My Profile';

  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('prof-bg', 'light'); }, 60);
    Promise.all([getMyDoctorProfile(), getSpecialties()])
      .then(([dR, sR]) => {
        const mine  = dR.data.profile || dR.data;
        const specs = sR.data.specialties || sR.data;
        if (mine) {
          setForm({ bio: mine.bio||'', phone: mine.phone||'', experienceYears: mine.experienceYears||0 });
          setSel(mine.specialties?.map(s => s._id)||[]);
          setAvatar(mine.avatarUrl || '');
        }
        setAll(Array.isArray(specs) ? specs : []);
      })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoad(false));
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  // ── Avatar handlers ───────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast('Image must be under 3MB', 'error'); return; }
    setPreview(URL.createObjectURL(file));
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const r = await uploadDoctorAvatar(fd);
      setAvatar(r.data.avatarUrl);
      setPreview(null);
      toast('Profile photo updated ✓', 'success');
    } catch (err) {
      setPreview(null);
      toast(err.response?.data?.message || 'Upload failed', 'error');
    } finally { setUploading(false); }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Remove your profile photo?')) return;
    setUploading(true);
    try {
      await deleteDoctorAvatar();
      setAvatar(''); setPreview(null);
      toast('Profile photo removed', 'success');
    } catch { toast('Failed to remove photo', 'error'); }
    finally { setUploading(false); }
  };

  // ── Profile save ──────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // FIX: send specialties together with profile data in one request
      await updateDoctorProfile({
        ...form,
        specialties: selSpecs,
        experienceYears: parseInt(form.experienceYears) || 0
      });
      toast('Profile updated successfully ✓', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  const toggleSpec = (id) => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const completionItems = [
    { l: 'Profile Photo', done: !!avatarUrl,              icon: '📷' },
    { l: 'Bio',           done: !!form.bio,               icon: '📝' },
    { l: 'Phone',         done: !!form.phone,             icon: '📞' },
    { l: 'Experience',    done: form.experienceYears > 0, icon: '⭐' },
    { l: 'Specialties',   done: selSpecs.length > 0,      icon: '🏥' },
  ];
  const completionPct = Math.round(completionItems.filter(i => i.done).length / completionItems.length * 100);
  const displayAvatar = preview || avatarUrl;

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="red-spinner"/>
    </div>
  );

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="prof-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* ── Hero Banner ── */}
        <div className="hero-section" style={{ padding:'2rem 2.5rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:24, position:'relative', overflow:'hidden' }}>

          {/* Avatar clickable in hero */}
          <div
            style={{ position:'relative', zIndex:1, flexShrink:0, cursor:'pointer' }}
            title="Click to change photo"
            onClick={() => !uploading && fileRef.current.click()}
          >
            <div style={{ width:88, height:88, borderRadius:'50%', overflow:'hidden', border:'3px solid rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', transition:'transform 0.2s' }}>
              {displayAvatar ? (
                <img src={displayAvatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              ) : (
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              )}
              {uploading && (
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}>
                  <div className="spinner-border spinner-border-sm text-white"/>
                </div>
              )}
              {/* camera overlay on hover */}
              {!uploading && (
                <div style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}>📷</div>
              )}
            </div>
          </div>

          <div style={{ position:'relative', zIndex:1, flex:1, minWidth:0 }}>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Doctor Profile</div>
            <h1 style={{ fontSize:'1.9rem', margin:0, lineHeight:1.2 }}>Dr. <em>{user.name}</em></h1>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', marginTop:4 }}>{user.email}</div>
            {selSpecs.length > 0 && (
              <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:6 }}>
                {allSpecs.filter(s => selSpecs.includes(s._id)).map(s => (
                  <span key={s._id} style={{ background:'rgba(255,255,255,0.18)', color:'white', fontSize:'0.72rem', fontWeight:600, padding:'3px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,0.3)' }}>
                    {s.icon && <span style={{ marginRight:4 }}>{s.icon}</span>}{s.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Completion badge in hero */}
          <div style={{ position:'relative', zIndex:1, flexShrink:0, textAlign:'center' }}>
            <div style={{ width:70, height:70, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'1.2rem', fontWeight:700, color:'white', lineHeight:1 }}>{completionPct}%</span>
              <span style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.7)', lineHeight:1, marginTop:2 }}>complete</span>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="row g-4">

          {/* LEFT — Main form (wider) */}
          <div className="col-12 col-lg-8">

            {/* Photo Upload Card */}
            <div className="clinic-card p-4 mb-4">
              <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.25rem', marginBottom:'0.3rem' }}>Profile Photo</h5>
              <div className="red-rule" style={{ marginBottom:'1.2rem' }}/>
              <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
                {/* Large preview circle */}
                <div
                  style={{ width:96, height:96, borderRadius:'50%', overflow:'hidden', border:'2px dashed var(--gray-300)', background:'var(--gray-50)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative', cursor: uploading ? 'wait' : 'pointer' }}
                  onClick={() => !uploading && fileRef.current.click()}
                  title="Click to upload photo"
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="avatar preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  ) : (
                    <div style={{ textAlign:'center', color:'var(--gray-400)' }}>
                      <div style={{ fontSize:'1.8rem', marginBottom:2 }}>📷</div>
                      <div style={{ fontSize:'0.62rem', lineHeight:1.3 }}>Click to<br/>upload</div>
                    </div>
                  )}
                  {uploading && (
                    <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div className="spinner-border spinner-border-sm" style={{ color:'var(--red)' }}/>
                    </div>
                  )}
                </div>

                <div style={{ flex:1 }}>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handleFileChange}/>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                    <button type="button" className="btn btn-red btn-sm" disabled={uploading} onClick={() => fileRef.current.click()}>
                      {uploading ? '⏳ Uploading...' : displayAvatar ? '🔄 Change Photo' : '📷 Upload Photo'}
                    </button>
                    {displayAvatar && !uploading && (
                      <button type="button" onClick={handleRemoveAvatar}
                        style={{ background:'none', border:'1.5px solid var(--gray-200)', color:'var(--gray-600)', borderRadius:'var(--r-sm)', padding:'5px 12px', cursor:'pointer', fontSize:'0.78rem', fontFamily:'Outfit' }}>
                        🗑 Remove
                      </button>
                    )}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 20px' }}>
                    {[['📸','Professional headshot'],['💡','Good lighting'],['🔲','Square crop'],['😊','Friendly smile']].map(([ic,tip]) => (
                      <span key={tip} style={{ fontSize:'0.75rem', color:'var(--gray-500)' }}>{ic} {tip}</span>
                    ))}
                  </div>
                  <div style={{ marginTop:6, fontSize:'0.72rem', color:'var(--gray-400)' }}>JPEG, PNG or WebP · Max 3MB</div>
                </div>
              </div>
            </div>

            {/* Professional Info Form */}
            <div className="clinic-card p-4">
              <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.25rem', marginBottom:'0.3rem' }}>Professional Information</h5>
              <div className="red-rule" style={{ marginBottom:'1.4rem' }}/>
              <form onSubmit={handleSave} className="clinic-form">

                {/* Name + Email (read-only) */}
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label style={{ fontSize:'0.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--gray-500)', marginBottom:4, display:'block' }}>Name</label>
                    <input className="form-control" value={user.name} disabled style={{ background:'var(--gray-100)', color:'var(--gray-500)' }}/>
                  </div>
                  <div className="col-sm-6">
                    <label style={{ fontSize:'0.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--gray-500)', marginBottom:4, display:'block' }}>Email</label>
                    <input className="form-control" value={user.email} disabled style={{ background:'var(--gray-100)', color:'var(--gray-500)' }}/>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-3">
                  <label style={{ fontSize:'0.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--gray-600)', marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                    <span>Professional Bio</span>
                    <span style={{ color: form.bio.length > 900 ? 'var(--red)' : 'var(--gray-400)', fontWeight:400 }}>{form.bio.length}/1000</span>
                  </label>
                  <textarea className="form-control" rows={4} maxLength={1000}
                    placeholder="Write a professional bio to help patients learn about you, your approach, and your expertise..."
                    value={form.bio} onChange={e => setForm({...form, bio:e.target.value})}
                    style={{ resize:'vertical' }}
                  />
                </div>

                {/* Phone + Experience */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label style={{ fontSize:'0.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--gray-600)', marginBottom:4, display:'block' }}>Phone Number</label>
                    <input className="form-control" placeholder="+20 1xx xxx xxxx"
                      value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/>
                  </div>
                  <div className="col-sm-6">
                    <label style={{ fontSize:'0.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--gray-600)', marginBottom:4, display:'block' }}>Years of Experience</label>
                    <input type="number" className="form-control" min={0} max={60}
                      value={form.experienceYears} onChange={e => setForm({...form, experienceYears:parseInt(e.target.value)||0})}/>
                  </div>
                </div>

                {/* ── SPECIALTIES ── */}
                <div className="mb-4">
                  <label style={{ fontSize:'0.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--gray-600)', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                    <span>Medical Specialties</span>
                    {selSpecs.length > 0 && (
                      <span style={{ background:'var(--red)', color:'white', fontSize:'0.65rem', fontWeight:700, padding:'2px 8px', borderRadius:12 }}>
                        {selSpecs.length} selected
                      </span>
                    )}
                  </label>

                  {allSpecs.length === 0 ? (
                    <div style={{ padding:'16px', background:'var(--gray-50)', borderRadius:'var(--r-md)', border:'1px dashed var(--gray-200)', textAlign:'center' }}>
                      <div style={{ fontSize:'1.5rem', marginBottom:6 }}>🏥</div>
                      <p style={{ fontSize:'0.85rem', color:'var(--gray-400)', fontStyle:'italic', margin:0 }}>No specialties available. Ask admin to add specialties.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {allSpecs.map(s => {
                          const on = selSpecs.includes(s._id);
                          return (
                            <button key={s._id} type="button" onClick={() => toggleSpec(s._id)}
                              style={{
                                border: `2px solid ${on ? 'var(--red)' : 'var(--gray-200)'}`,
                                background: on ? 'var(--red)' : 'white',
                                color: on ? 'white' : 'var(--gray-700)',
                                borderRadius: 30,
                                padding: '7px 16px',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                transition: 'all 0.18s',
                                fontFamily: 'Outfit, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: on ? '0 2px 8px rgba(220,38,38,0.25)' : 'none',
                              }}>
                              {s.icon && <span>{s.icon}</span>}
                              {on && <span>✓</span>}
                              {s.name}
                            </button>
                          );
                        })}
                      </div>
                      {selSpecs.length === 0 && (
                        <p style={{ fontSize:'0.78rem', color:'var(--gray-400)', marginTop:8, fontStyle:'italic' }}>
                          Click to select your specialties
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:4 }}>
                  <button type="submit" className="btn btn-red" disabled={saving} style={{ minWidth:140 }}>
                    {saving
                      ? <span className="d-flex align-items-center gap-2"><span className="spinner-border spinner-border-sm"/>Saving...</span>
                      : '💾 Save Profile'
                    }
                  </button>
                  <span style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>All changes saved to your profile</span>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT — Sidebar */}
          <div className="col-12 col-lg-4">

            {/* Profile Completion Card */}
            <div style={{ background:'linear-gradient(135deg, var(--red), var(--red-deeper))', borderRadius:'var(--r-lg)', padding:'1.6rem', color:'white', position:'relative', overflow:'hidden', marginBottom:'1rem' }}>
              <div style={{ position:'absolute', right:'-10px', top:'-10px', fontSize:'7rem', opacity:0.06, fontFamily:'Cormorant Garamond, serif' }}>✚</div>
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.15rem', marginBottom:4, position:'relative', zIndex:1 }}>Profile Completion</div>
              <div style={{ fontSize:'2.2rem', fontWeight:700, marginBottom:12, position:'relative', zIndex:1 }}>{completionPct}%</div>

              {/* Progress bar */}
              <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:6, height:8, marginBottom:16, position:'relative', zIndex:1 }}>
                <div style={{ background:'white', width:`${completionPct}%`, height:'100%', borderRadius:6, transition:'width 0.5s ease' }}/>
              </div>

              {/* Items */}
              <div style={{ display:'flex', flexDirection:'column', gap:10, position:'relative', zIndex:1 }}>
                {completionItems.map(({ l, done, icon }) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background: done ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)', border: done ? 'none' : '1.5px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'0.65rem', color: done ? 'var(--red)' : 'transparent', fontWeight:700 }}>
                      {done ? '✓' : ''}
                    </div>
                    <span style={{ fontSize:'0.83rem', opacity: done ? 1 : 0.55, flex:1 }}>{icon} {l}</span>
                    {done && <span style={{ fontSize:'0.65rem', opacity:0.7 }}>✓</span>}
                  </div>
                ))}
              </div>

              {completionPct === 100 && (
                <div style={{ marginTop:16, padding:'10px 14px', background:'rgba(255,255,255,0.15)', borderRadius:'var(--r-md)', fontSize:'0.8rem', textAlign:'center', position:'relative', zIndex:1 }}>
                  🎉 Profile complete! Patients can find you easily.
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="clinic-card p-4 mb-3">
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.1rem', fontWeight:600, marginBottom:12, color:'var(--dark)' }}>Quick Stats</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'Experience', value: form.experienceYears > 0 ? `${form.experienceYears} yrs` : '—', icon:'⭐' },
                  { label:'Specialties', value: selSpecs.length > 0 ? selSpecs.length : '—', icon:'🏥' },
                  { label:'Phone', value: form.phone ? '✓ Set' : '—', icon:'📞' },
                  { label:'Bio', value: form.bio ? `${form.bio.length} chars` : '—', icon:'📝' },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background:'var(--gray-50)', borderRadius:'var(--r-md)', padding:'12px', textAlign:'center' }}>
                    <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{icon}</div>
                    <div style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--dark)', marginBottom:2 }}>{value}</div>
                    <div style={{ fontSize:'0.68rem', color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div className="clinic-card p-4">
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.1rem', fontWeight:600, marginBottom:12, color:'var(--dark)' }}>Tips for a Great Profile</div>
              {[
                ['📸', 'Upload a professional headshot — profiles with photos get more bookings'],
                ['✍️', 'Write a bio that explains your approach and expertise'],
                ['🏥', 'Select all your specialties so patients can find you'],
                ['📞', 'Add your phone so patients can reach you easily'],
              ].map(([icon, tip]) => (
                <div key={tip} style={{ display:'flex', gap:10, marginBottom:12, fontSize:'0.82rem', color:'var(--gray-600)', lineHeight:1.5 }}>
                  <span style={{ flexShrink:0, fontSize:'1rem' }}>{icon}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
