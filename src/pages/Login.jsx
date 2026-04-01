import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
  const { login, signup } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!form.name.trim()) throw new Error('Please enter your name.');
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (form.password !== form.confirm) throw new Error('Passwords do not match.');
        await signup(form.name.trim(), form.email.trim(), form.password);
        toast.success('Welcome to Aura Finance!');
      } else {
        await login(form.email.trim(), form.password);
        toast.success('Welcome back!');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', marginBottom: 0 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,rgba(192,193,255,0.15),rgba(128,131,255,0.25))', borderRadius: '16px', border: '1px solid rgba(192,193,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <span className="gradient-text" style={{ fontWeight: 900, fontSize: '1.75rem' }}>A</span>
          </div>
          <h1 className="gradient-text" style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em' }}>Aura Finance</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginTop: '0.35rem' }}>The Digital Curator</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface-container)', border: '1px solid rgba(70,69,84,0.2)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-full)', padding: '4px', marginBottom: '1.75rem' }}>
            {['login','signup'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s ease',
                  background: mode === m ? 'var(--gradient-primary)' : 'transparent',
                  color: mode === m ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Name</label>
                <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Kim" required />
              </div>
            )}

            <div>
              <label style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Email Address</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="alex@example.com" required />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle, paddingRight: '2.75rem' }} type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Confirm Password</label>
                <input style={inputStyle} type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="••••••••" required />
              </div>
            )}

            <button type="submit" disabled={loading} className="gradient-btn"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(192,193,255,0.06)', border: '1px solid rgba(192,193,255,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Zap size={14} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.78rem', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--primary)' }}>Demo:</strong> Create any account to get started with pre-loaded sample data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
