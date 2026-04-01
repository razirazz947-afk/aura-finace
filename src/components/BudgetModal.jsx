import { useState } from 'react';
import Modal from './Modal';

const ICONS = ['🛒','🎬','🚗','💡','🍽️','🏥','📱','🛍️','🏠','🎭','⚡','✈️','📚','🏋️','🐾','💊'];
const COLORS = ['#8083ff','#ffb783','#4ade80','#c0c1ff','#f87171','#34d399','#a78bfa','#fb923c','#6366F1','#06b6d4'];
const CATEGORIES = ['Essential','Lifestyle','Savings','Business','Other'];

const FieldLabel = ({ children }) => (
  <label style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
    {children}
  </label>
);

export default function BudgetModal({ onClose, onSave, initial = null }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name || '',
    limit: initial?.limit || '',
    icon: initial?.icon || '🛒',
    color: initial?.color || '#8083ff',
    category: initial?.category || 'Essential',
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return setError('Budget name is required.');
    if (!form.limit || isNaN(Number(form.limit)) || Number(form.limit) <= 0) return setError('Enter a valid monthly limit.');
    setError('');
    onSave({ ...form, limit: parseFloat(form.limit) });
    onClose();
  };

  return (
    <Modal title={isEdit ? 'Edit Budget' : 'New Budget'} onClose={onClose} width="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <FieldLabel>Category Name</FieldLabel>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Groceries" />
          </div>
          <div>
            <FieldLabel>Monthly Limit ($)</FieldLabel>
            <input type="number" value={form.limit} onChange={e => set('limit', e.target.value)} placeholder="500" />
          </div>
        </div>

        <div>
          <FieldLabel>Type</FieldLabel>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <FieldLabel>Icon</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => set('icon', ic)}
                style={{ fontSize: '1.2rem', padding: '0.3rem 0.4rem', background: form.icon === ic ? 'var(--surface-container-high)' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px' }}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Color</FieldLabel>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--on-surface)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s ease' }} />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ padding: '0.75rem 1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>{form.icon}</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{form.name || 'Budget Name'}</p>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>Limit: ${form.limit || '0'}/month</p>
          </div>
          <div style={{ marginLeft: 'auto', width: 12, height: 12, borderRadius: '50%', background: form.color }} />
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="ghost-btn" onClick={onClose} style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
          <button className="gradient-btn" onClick={handleSave} style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}>
            {isEdit ? 'Save Changes' : 'Create Budget'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
