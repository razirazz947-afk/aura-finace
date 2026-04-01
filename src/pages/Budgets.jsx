import { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../components/ConfirmModal';
import './Budgets.css';

function BudgetBar({ spent, limit, color }) {
  const pct = Math.min((spent / limit) * 100, 100);
  const over = spent > limit;
  return (
    <div style={{ background: 'var(--surface-container-highest)', borderRadius: 999, height: 8, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: over ? 'linear-gradient(90deg,#ef4444,#f87171)' : `linear-gradient(90deg,${color},${color}cc)`, borderRadius: 999, transition: 'width 0.6s ease', boxShadow: over ? '0 0 8px rgba(239,68,68,0.5)' : `0 0 8px ${color}44` }}/>
    </div>
  );
}

export default function Budgets() {
  const { budgets, addBudget, updateBudget, deleteBudget, transactions, formatCurrency } = useApp();
  const toast = useToast();
  const [modal, setModal] = useState(null);

  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const overBudget = budgets.filter(b => (b.spent || 0) > b.limit).length;

  const handleSave = (data) => {
    if (modal === 'add') { addBudget(data); toast.success(`"${data.name}" budget created!`); }
    else if (modal?.type === 'edit') { updateBudget(modal.b.id, data); toast.success('Budget updated!'); }
  };

  const handleDelete = (b) => { deleteBudget(b.id); toast.warning(`"${b.name}" budget deleted.`); };

  return (
    <div className="budgets-page">
      <div className="page-header-row">
        <div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Monthly spending limits & tracking</p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>Budget Manager</h1>
        </div>
        <button className="gradient-btn" onClick={() => setModal('add')} style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Plus size={16}/> New Budget
        </button>
      </div>

      {/* Summary */}
      <div className="budget-summary-grid">
        <div className="card-elevated" style={{ padding: '1.25rem' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Spent</p>
          <p style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem' }}>{formatCurrency(totalSpent)}</p>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: 2 }}>of {formatCurrency(totalLimit)} budget</p>
          <BudgetBar spent={totalSpent} limit={totalLimit || 1} color="#8083ff"/>
        </div>
        <div className="card-elevated" style={{ padding: '1.25rem' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Remaining</p>
          <p style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem', color: '#4ade80' }}>{formatCurrency(Math.max(0, totalLimit - totalSpent))}</p>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: 2 }}>until month end</p>
        </div>
        <div className="card-elevated" style={{ padding: '1.25rem' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Over Budget</p>
          <p style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem', color: overBudget > 0 ? '#f87171' : '#4ade80' }}>{overBudget}</p>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: 2 }}>categories exceeded</p>
          {overBudget > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem' }}><AlertTriangle size={12} style={{ color: '#f87171' }}/><span style={{ color: '#f87171', fontSize: '0.72rem' }}>Action recommended</span></div>}
        </div>
      </div>

      {/* Budget Cards */}
      <div className="budget-cards-grid">
        {budgets.map(b => {
          const spent = b.spent || 0;
          const pct = Math.round((spent / b.limit) * 100);
          const over = spent > b.limit;
          return (
            <div key={b.id} className="card budget-card" style={{ borderColor: over ? 'rgba(239,68,68,0.2)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{b.icon}</span>
                  <div><p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.name}</p><p style={{ color: 'var(--on-surface-variant)', fontSize: '0.72rem' }}>{b.category}</p></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  {over && <span className="tag-red" style={{ fontSize: '0.65rem' }}>Over</span>}
                  <button onClick={() => setModal({ type:'edit', b })} style={{ background:'none', border:'none', color:'var(--outline)', cursor:'pointer', padding:4 }}><Edit2 size={13}/></button>
                  <button onClick={() => setModal({ type:'delete', b })} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', padding:4 }}><Trash2 size={13}/></button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{formatCurrency(spent, 0)} spent</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: over ? '#f87171' : 'var(--on-surface)' }}>{pct}%</span>
              </div>
              <BudgetBar spent={spent} limit={b.limit} color={b.color}/>
              <p style={{ color: 'var(--outline)', fontSize: '0.72rem', marginTop: '0.5rem', textAlign: 'right' }}>limit: {formatCurrency(b.limit, 0)}</p>
            </div>
          );
        })}
        {budgets.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--outline)' }}>
            <p>No budgets yet. Click "New Budget" to create one.</p>
          </div>
        )}
      </div>

      {modal === 'add' && <BudgetModal onClose={() => setModal(null)} onSave={handleSave}/>}
      {modal?.type === 'edit' && <BudgetModal initial={modal.b} onClose={() => setModal(null)} onSave={handleSave}/>}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Delete Budget"
          message={`Remove the "${modal.b.name}" budget? This cannot be undone.`}
          onConfirm={() => handleDelete(modal.b)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
