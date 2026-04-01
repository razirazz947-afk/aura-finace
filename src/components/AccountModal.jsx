import { useState } from 'react';
import Modal from './Modal';

const ACCOUNT_TYPES = ['Checking','Savings','Investment','Credit Card','Digital Assets','Cash','Other'];
const COLORS = ['#6366F1','#8083ff','#4ade80','#ffb783','#f87171','#34d399','#a78bfa','#fb923c','#06b6d4','#ec4899'];

const FieldLabel = ({ children }) => (
  <label style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
    {children}
  </label>
);

export default function AccountModal({ onClose, onSave, initial = null }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name || '',
    type: initial?.type || 'Checking',
    bank: initial?.bank || '',
    balance: initial?.balance || '',
    number: initial?.number || '',
    color: initial?.color || '#6366F1',
    change: initial?.change || 0,
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return setError('Account name is required.');
    if (!form.bank.trim()) return setError('Bank name is required.');
    if (form.balance === '' || isNaN(Number(form.balance))) return setError('Enter a valid balance.');
    setError('');
    onSave({ ...form, balance: parseFloat(form.balance), change: parseFloat(form.change) || 0 });
    onClose();
  };

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

  return (
    <Modal title={isEdit ? 'Edit Account' : 'Add Account'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <FieldLabel>Account Name</FieldLabel>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Chase Sapphire Reserve" />
        </div>
        <div style={grid2}>
          <div>
            <FieldLabel>Account Type</FieldLabel>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Bank / Institution</FieldLabel>
            <input value={form.bank} onChange={e => set('bank', e.target.value)} placeholder="e.g. JPMorgan Chase" />
          </div>
        </div>
        <div style={grid2}>
          <div>
            <FieldLabel>Current Balance ($)</FieldLabel>
            <input type="number" value={form.balance} onChange={e => set('balance', e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <FieldLabel>Account Number (masked)</FieldLabel>
            <input value={form.number} onChange={e => set('number', e.target.value)} placeholder="•••• 1234" />
          </div>
        </div>
        <div>
          <FieldLabel>Card Color</FieldLabel>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--on-surface)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s ease' }} />
            ))}
          </div>
        </div>
        {error && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="ghost-btn" onClick={onClose} style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
          <button className="gradient-btn" onClick={handleSave} style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}>
            {isEdit ? 'Save Changes' : 'Add Account'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
