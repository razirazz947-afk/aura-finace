import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, CreditCard, Building2, PiggyBank, Bitcoin, Edit2, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import AccountModal from '../components/AccountModal';
import ConfirmModal from '../components/ConfirmModal';
import './Accounts.css';

const monthlyData = [
  { month: 'Oct', income: 8200, spend: 3400 },
  { month: 'Nov', income: 8500, spend: 3800 },
  { month: 'Dec', income: 9200, spend: 5100 },
  { month: 'Jan', income: 8500, spend: 3200 },
  { month: 'Feb', income: 8500, spend: 3600 },
  { month: 'Mar', income: 9342, spend: 3814 },
];

const typeIcon = { Checking: CreditCard, Investment: Building2, Savings: PiggyBank, 'Digital Assets': Bitcoin };

const CustomTooltip = ({ active, payload, label }) => {
  const { formatCurrency } = useApp();
  if (active && payload?.length) return (
    <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid rgba(70,69,84,0.3)' }}>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 700, fontSize: '0.875rem' }}>{p.name === 'income' ? '↑ ' : '↓ '}{formatCurrency(p.value)}</p>)}
    </div>
  );
  return null;
};

function colorAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount, formatCurrency } = useApp();
  const toast = useToast();
  const [selected, setSelected] = useState(0);
  const [modal, setModal] = useState(null); // null | 'add' | { type:'edit', acc } | { type:'delete', acc }

  const total = accounts.reduce((s, a) => s + a.balance, 0);

  const handleSave = (data) => {
    if (modal === 'add') { addAccount(data); toast.success('Account added!'); }
    else if (modal?.type === 'edit') { updateAccount(modal.acc.id, data); toast.success('Account updated!'); }
  };

  const handleDelete = (acc) => { deleteAccount(acc.id); toast.warning(`${acc.name} removed.`); };

  return (
    <div className="accounts-page">
      <div className="page-header-row">
        <div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Strategic overview of your liquid assets</p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>Account Management</h1>
        </div>
        <button className="gradient-btn" onClick={() => setModal('add')} style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Plus size={16}/> Link Account
        </button>
      </div>

      <div className="account-cards-grid">
        {accounts.map((acc, i) => {
          const Icon = typeIcon[acc.type] || CreditCard;
          const isSelected = selected === i;
          const c = acc.color || '#6366F1';
          return (
            <div key={acc.id || i} onClick={() => setSelected(i)} className="account-card"
              style={{ background: isSelected ? `linear-gradient(135deg, ${colorAlpha(c, 0.2)}, ${colorAlpha(c, 0.08)})` : 'var(--surface-container)', border: isSelected ? `1px solid ${colorAlpha(c, 0.35)}` : '1px solid rgba(70,69,84,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, background: colorAlpha(c, 0.15), borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: c }}/>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <span className={acc.change >= 0 ? 'tag-green' : 'tag-red'}>
                    {acc.change >= 0 ? <ArrowUpRight size={10} style={{ display:'inline' }}/> : <ArrowDownRight size={10} style={{ display:'inline' }}/>}{Math.abs(acc.change)}%
                  </span>
                  <button onClick={e => { e.stopPropagation(); setModal({ type:'edit', acc }); }} style={{ background:'none', border:'none', color:'var(--outline)', cursor:'pointer', padding:4, borderRadius:'var(--radius-sm)' }}><Edit2 size={13}/></button>
                  <button onClick={e => { e.stopPropagation(); setModal({ type:'delete', acc }); }} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', padding:4, borderRadius:'var(--radius-sm)' }}><Trash2 size={13}/></button>
                </div>
              </div>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{acc.type}</p>
              <p style={{ fontWeight: 700, fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
                {formatCurrency(acc.balance, 2)}
              </p>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</p>
              <p style={{ color: 'var(--outline)', fontSize: '0.72rem', marginTop: '0.5rem' }}>{acc.bank} · {acc.number}</p>
            </div>
          );
        })}
        {accounts.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--outline)' }}>
            <p>No accounts yet. Click "Link Account" to add one.</p>
          </div>
        )}
      </div>

      <div className="accounts-bottom-grid">
        <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Portfolio Value</p>
          <h2 className="gradient-text" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>{formatCurrency(total)}</h2>
          <div style={{ height: 1, background: 'rgba(70,69,84,0.2)' }}/>
          {accounts.map((acc, i) => (
            <div key={acc.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: acc.color || '#6366F1', flexShrink: 0 }}/>
                <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{acc.type}</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{total > 0 ? ((acc.balance / total) * 100).toFixed(1) : 0}%</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700 }}>Income vs Spending</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: 2 }}>Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={6}>
              <CartesianGrid stroke="rgba(70,69,84,0.15)" strokeDasharray="4 4" vertical={false}/>
              <XAxis dataKey="month" tick={{ fill: 'var(--outline)', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="income" fill="#8083ff" radius={[6,6,0,0]} name="income"/>
              <Bar dataKey="spend"  fill="#ffb783" radius={[6,6,0,0]} name="spend"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modals */}
      {modal === 'add' && <AccountModal onClose={() => setModal(null)} onSave={handleSave}/>}
      {modal?.type === 'edit' && <AccountModal initial={modal.acc} onClose={() => setModal(null)} onSave={handleSave}/>}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Delete Account"
          message={`Are you sure you want to remove "${modal.acc.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(modal.acc)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
