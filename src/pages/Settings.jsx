import { useState } from 'react';
import { User, Bell, Shield, Palette, Link, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { worldCurrencies } from '../lib/currencies';
import './Settings.css';

const sections = [
  { id: 'profile',       label: 'Profile',       icon: User    },
  { id: 'notifications', label: 'Notifications', icon: Bell    },
  { id: 'security',      label: 'Security',       icon: Shield  },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
  { id: 'connections',   label: 'Connections',   icon: Link    },
];

const accents = ['#6366F1','#8083ff','#4ade80','#f59e0b','#ec4899','#06b6d4'];

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width:48, height:26, borderRadius:999, flexShrink:0, background: value ? 'var(--gradient-primary)' : 'var(--surface-container-highest)', border:'none', cursor:'pointer', transition:'all 0.25s ease', position:'relative' }}>
      <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: value ? 25 : 3, transition:'left 0.25s ease', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
    </button>
  );
}

function FieldLabel({ children }) {
  return <label style={{ display:'block', color:'var(--on-surface-variant)', fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:'0.5rem' }}>{children}</label>;
}

export default function Settings() {
  const { darkMode, setDarkMode } = useApp();
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();

  const [active,  setActive]  = useState('profile');
  const [accent,  setAccent]  = useState('#6366F1');
  const [form,    setForm]    = useState({ name: user?.name || '', email: user?.email || '', currency: user?.currency || 'USD', timezone: user?.timezone || 'America/New_York' });
  const [notifs,  setNotifs]  = useState({ budgetAlerts: true, weeklyReport: true, transactionAlerts: false, aiInsights: true });
  const [pwdForm, setPwdForm] = useState({ current:'', next:'', confirm:'' });

  const handleSaveProfile = () => {
    if (!form.name.trim()) return toast.error('Name cannot be empty.');
    updateProfile({ name: form.name.trim(), email: form.email.trim(), currency: form.currency });
    toast.success('Profile saved!');
  };

  const handleSavePassword = () => {
    if (pwdForm.next.length < 6) return toast.error('New password must be at least 6 characters.');
    if (pwdForm.next !== pwdForm.confirm) return toast.error('Passwords do not match.');
    toast.success('Password updated!');
    setPwdForm({ current:'', next:'', confirm:'' });
  };

  const handleSaveNotifs = () => toast.success('Notification preferences saved!');

  return (
    <div className="settings-page">
      <div>
        <p style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>Customize your Aura experience</p>
        <h1 style={{ fontSize:'clamp(1.4rem, 4vw, 1.75rem)', fontWeight:800, letterSpacing:'-0.02em', marginTop:'0.25rem' }}>Settings</h1>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav card">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)} className={`settings-nav-item ${active === id ? 'active' : ''}`}>
              <Icon size={16}/><span>{label}</span>
              {active === id && <ChevronRight size={13} style={{ marginLeft:'auto' }}/>}
            </button>
          ))}
          <button onClick={() => { logout(); toast.info('Signed out.'); }} className="settings-nav-item" style={{ color:'#f87171', marginTop:'auto' }}>
            <span>Sign Out</span>
          </button>
        </nav>

        <div className="settings-panel">

          {/* ---- Profile ---- */}
          {active === 'profile' && (
            <div className="card settings-section">
              <div className="profile-hero">
                <div className="avatar-lg">{user?.name?.[0] || 'A'}{user?.name?.split(' ')[1]?.[0] || ''}</div>
                <div>
                  <h3 style={{ fontWeight:700 }}>{user?.name}</h3>
                  <p style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{user?.email}</p>
                </div>
              </div>
              <div className="form-grid-2">
                <div><FieldLabel>Full Name</FieldLabel><input value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></div>
                <div><FieldLabel>Email Address</FieldLabel><input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})}/></div>
                <div><FieldLabel>Currency</FieldLabel>
                  <input 
                    list="currencies" 
                    value={form.currency} 
                    onChange={e => setForm({...form, currency:e.target.value.substring(0, 3).toUpperCase()})} 
                    placeholder="Search by country or code..." 
                    style={{ width:'100%', marginBottom:0 }}
                  />
                  <datalist id="currencies">
                    {worldCurrencies.map(c => (
                      <option key={c.code} value={c.code}>{`${c.code} - ${c.country} (${c.name})`}</option>
                    ))}
                  </datalist>
                </div>
                <div><FieldLabel>Timezone</FieldLabel>
                  <select value={form.timezone} onChange={e => setForm({...form, timezone:e.target.value})}>
                    {['America/New_York','America/Los_Angeles','Europe/London','Asia/Dubai','Asia/Tokyo'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={handleSaveProfile} className="gradient-btn" style={{ padding:'0.65rem 1.5rem', fontSize:'0.875rem' }}>Save Profile</button>
              </div>
            </div>
          )}

          {/* ---- Notifications ---- */}
          {active === 'notifications' && (
            <div className="card settings-section">
              <h3 style={{ fontWeight:700, marginBottom:'1.25rem' }}>Notification Preferences</h3>
              {[
                { key:'budgetAlerts',      label:'Budget Alerts',      sub:'Get notified when approaching or exceeding budget limits' },
                { key:'weeklyReport',      label:'Weekly Report',      sub:'Receive a curated weekly financial summary every Monday' },
                { key:'transactionAlerts', label:'Transaction Alerts', sub:'Real-time notifications for every transaction above $50' },
                { key:'aiInsights',        label:'AI Insights',        sub:'Proactive Curator insights and portfolio recommendations' },
              ].map(({ key, label, sub }) => (
                <div key={key} className="notif-row">
                  <div><p style={{ fontWeight:600, fontSize:'0.9rem' }}>{label}</p><p style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem', marginTop:2 }}>{sub}</p></div>
                  <Toggle value={notifs[key]} onChange={v => setNotifs({...notifs, [key]:v})}/>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={handleSaveNotifs} className="gradient-btn" style={{ padding:'0.65rem 1.5rem', fontSize:'0.875rem' }}>Save Preferences</button>
              </div>
            </div>
          )}

          {/* ---- Security ---- */}
          {active === 'security' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="card settings-section">
                <h3 style={{ fontWeight:700, marginBottom:'1rem' }}>Change Password</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  <div><FieldLabel>Current Password</FieldLabel><input type="password" placeholder="••••••••" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current:e.target.value})}/></div>
                  <div><FieldLabel>New Password</FieldLabel><input type="password" placeholder="••••••••" value={pwdForm.next} onChange={e => setPwdForm({...pwdForm, next:e.target.value})}/></div>
                  <div><FieldLabel>Confirm New Password</FieldLabel><input type="password" placeholder="••••••••" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm:e.target.value})}/></div>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                  <button onClick={handleSavePassword} className="gradient-btn" style={{ padding:'0.65rem 1.5rem', fontSize:'0.875rem' }}>Update Password</button>
                </div>
              </div>
              <div className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                <div><p style={{ fontWeight:600 }}>Two-Factor Authentication</p><p style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem', marginTop:2 }}>Add an extra layer of security</p></div>
                <button className="gradient-btn" onClick={() => toast.info('2FA coming soon!')} style={{ padding:'0.5rem 1.25rem', fontSize:'0.8rem' }}>Enable 2FA</button>
              </div>
            </div>
          )}

          {/* ---- Appearance ---- */}
          {active === 'appearance' && (
            <div className="card settings-section">
              <div style={{ marginBottom:'1.5rem' }}>
                <h3 style={{ fontWeight:700, marginBottom:'0.75rem' }}>Color Mode</h3>
                <div className="color-mode-grid">
                  {[['Light','☀️',false],['Dark','🌙',true],['System','💻',null]].map(([mode, emoji, val]) => {
                    const isActive = val === null ? false : darkMode === val;
                    return (
                      <button key={mode} onClick={() => { if (val !== null) { setDarkMode(val); toast.success(`${mode} mode enabled!`); } }}
                        style={{ padding:'1rem', borderRadius:'var(--radius-lg)', cursor:'pointer', fontFamily:'Inter', fontWeight:500, color:'var(--on-surface)', background: isActive ? 'linear-gradient(135deg,rgba(192,193,255,0.15),rgba(128,131,255,0.12))' : 'var(--surface-container)', border: isActive ? '1px solid rgba(192,193,255,0.3)' : '1px solid rgba(70,69,84,0.15)', transition:'all 0.2s ease' }}>
                        {emoji}<br/><span style={{ fontSize:'0.8rem', marginTop:'0.4rem', display:'block' }}>{mode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 style={{ fontWeight:700, marginBottom:'0.75rem' }}>Accent Color</h3>
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                  {accents.map(color => (
                    <button key={color} onClick={() => setAccent(color)}
                      style={{ width:36, height:36, borderRadius:'50%', background:color, flexShrink:0, border: accent === color ? '3px solid var(--on-surface)' : '3px solid transparent', cursor:'pointer', transition:'all 0.2s ease', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {accent === color && <Check size={14} color="#fff"/>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- Connections ---- */}
          {active === 'connections' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Coming soon notice */}
              <div className="card" style={{ border:'1px solid rgba(192,193,255,0.15)', background:'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(128,131,255,0.03))' }}>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'1.4rem', flexShrink:0 }}>🔌</span>
                  <div>
                    <p style={{ fontWeight:700, marginBottom:'0.35rem' }}>Automatic Bank Sync — Coming Soon</p>
                    <p style={{ color:'var(--outline)', fontSize:'0.85rem', lineHeight:1.6 }}>
                      Direct integration with banks (Chase, HSBC, Vanguard, Coinbase) is planned for a future update. For now, add accounts manually on the <a href="/accounts" style={{ color:'var(--primary)', textDecoration:'none', fontWeight:600 }}>Accounts page</a> and log transactions on the <a href="/transactions" style={{ color:'var(--primary)', textDecoration:'none', fontWeight:600 }}>Transactions page</a>.
                    </p>
                  </div>
                </div>
              </div>


              <div>
                <p style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem', marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Your Accounts</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  <a href="/accounts" style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'1rem', background:'var(--surface-container-high)', borderRadius:'var(--radius-md)', textDecoration:'none', transition:'background 0.2s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bright)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-container-high)'}>
                    <span style={{ fontSize:'1.2rem' }}>➕</span>
                    <div>
                      <p style={{ fontWeight:600, color:'var(--primary)', fontSize:'0.9rem' }}>Manage Accounts</p>
                      <p style={{ color:'var(--outline)', fontSize:'0.78rem' }}>Add, edit or remove your linked accounts</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Data export */}
              <div className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                <div>
                  <p style={{ fontWeight:600 }}>Export Your Data</p>
                  <p style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem', marginTop:2 }}>Download all transactions as CSV</p>
                </div>
                <a href="/transactions" style={{ background:'var(--gradient-primary)', color:'var(--on-primary)', border:'none', borderRadius:'var(--radius-full)', padding:'0.5rem 1.25rem', fontSize:'0.8rem', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  Go to Export →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
