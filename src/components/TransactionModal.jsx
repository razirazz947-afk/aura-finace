import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const CATEGORIES = ['Income','Investment','Groceries','Subscription','Technology','Dining','Utilities','Travel','Crypto','Shopping','Healthcare','Other'];
const ICONS = ['💼','📈','🛒','🎬','🍎','🍔','🎵','📊','💡','✈️','₿','🏠','🛍️','🏥','📱','🎭','🍽️','⚡','🚗'];

const FieldLabel = ({ children }) => (
  <label style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
    {children}
  </label>
);

export default function TransactionModal({ onClose, onSave, initial = null, accounts = [] }) {
  const { user } = useAuth();
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name || '',
    amount: initial?.amount || '',
    type: initial?.type || 'debit',
    category: initial?.category || 'Other',
    accountId: initial?.accountId || accounts[0]?.id || '',
    date: initial?.date || new Date().toISOString().slice(0, 10),
    icon: initial?.icon || '💼',
    note: initial?.note || '',
    recurring: initial?.recurring || false,
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return setError('Transaction name is required.');
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return setError('Enter a valid amount.');
    if (!form.date) return setError('Date is required.');
    setError('');
    onSave({ ...form, amount: parseFloat(form.amount) });
    onClose();
  };

  const inputStyle = { width: '100%' };
  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

  return (
    <Modal title={isEdit ? 'Edit Transaction' : 'Add Transaction'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* Name + Icon */}
        <div style={gridStyle}>
          <div style={{ gridColumn: '1 / -1' }}>
            <FieldLabel>Transaction Name</FieldLabel>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Netflix Premium" />
          </div>
        </div>

        {/* Amount + Type */}
        <div style={gridStyle}>
          <div>
            <FieldLabel>Amount ({user?.currency || 'USD'})</FieldLabel>
            <input style={inputStyle} type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['debit','credit'].map(t => (
                <button key={t} onClick={() => set('type', t)}
                  style={{
                    flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s ease',
                    background: form.type === t ? (t === 'credit' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)') : 'var(--surface-container)',
                    color: form.type === t ? (t === 'credit' ? '#4ade80' : '#f87171') : 'var(--on-surface-variant)',
                    border: form.type === t ? `1px solid ${t === 'credit' ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}` : '1px solid transparent',
                  }}>
                  {t === 'credit' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category + Account */}
        <div style={gridStyle}>
          <div>
            <FieldLabel>Category</FieldLabel>
            <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Account</FieldLabel>
            <select style={inputStyle} value={form.accountId} onChange={e => set('accountId', e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>

        {/* Date + Icon */}
        <div style={gridStyle}>
          <div>
            <FieldLabel>Date</FieldLabel>
            <input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Icon</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: 80, overflowY: 'auto', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => set('icon', ic)}
                  style={{ fontSize: '1.1rem', padding: '0.2rem', background: form.icon === ic ? 'var(--surface-container-high)' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <FieldLabel>Note (optional)</FieldLabel>
          <input style={inputStyle} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Add a note..." />
        </div>

        {/* Recurring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
          <button onClick={() => set('recurring', !form.recurring)}
            style={{ width: 44, height: 24, borderRadius: 999, background: form.recurring ? 'var(--gradient-primary)' : 'var(--surface-container-highest)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.25s ease', flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.recurring ? 23 : 3, transition: 'left 0.25s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
          </button>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Recurring Transaction</p>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>Marks this as a monthly recurring expense</p>
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button className="ghost-btn" onClick={onClose} style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
          <button className="gradient-btn" onClick={handleSave} style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}>
            {isEdit ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
