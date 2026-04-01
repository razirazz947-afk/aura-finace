import { useState, useRef } from 'react';
import { Search, Download, Plus, ArrowUpRight, ArrowDownRight, Upload, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import './Transactions.css';

const CATEGORIES = ['All','Income','Investment','Groceries','Subscription','Technology','Dining','Utilities','Travel','Crypto','Shopping','Healthcare','Other'];

const DATE_FILTERS = [
  { label: 'All Time',     fn: () => true },
  { label: 'This Month',   fn: (d) => d.startsWith(new Date().toISOString().slice(0,7)) },
  { label: 'Last 3 Months',fn: (d) => new Date(d) >= new Date(Date.now() - 90*24*60*60*1000) },
  { label: 'This Week',    fn: (d) => new Date(d) >= new Date(Date.now() - 7*24*60*60*1000) },
  { label: 'Today',        fn: (d) => d === new Date().toISOString().slice(0,10) },
];

export default function Transactions() {
  const { transactions, accounts, addTransaction, updateTransaction, deleteTransaction, importTransactions, formatCurrency } = useApp();
  const toast = useToast();
  const fileRef = useRef();

  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState(0);
  const [dragOver, setDragOver]  = useState(false);
  const [modal, setModal]        = useState(null);

  const activeDateFn = DATE_FILTERS[dateFilter].fn;

  const filtered = transactions
    .filter(t => activeDateFn(t.date))
    .filter(t => catFilter === 'All' || t.category === catFilter)
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalIn  = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  const getAccName = (id) => accounts.find(a => a.id === id)?.name || '—';

  const handleSaveTx = (data) => {
    if (modal === 'add') { addTransaction(data); toast.success('Transaction added!'); }
    else if (modal?.type === 'edit') { updateTransaction(modal.tx.id, data); toast.success('Transaction updated!'); }
  };

  const handleDeleteTx = (tx) => { deleteTransaction(tx.id); toast.warning('Transaction deleted.'); };

  const handleExport = () => {
    const header = 'Date,Name,Category,Account,Type,Amount,Note,Recurring';
    const rows = filtered.map(t => `${t.date},"${t.name}",${t.category},${getAccName(t.accountId)},${t.type},${t.amount},"${t.note||''}",${t.recurring||false}`);
    const csv = [header, ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'aura-transactions.csv';
    a.click();
    toast.success(`Exported ${filtered.length} transactions.`);
  };

  const handleCSVImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').filter(Boolean);
      const rows = lines.slice(1).map(line => {
        const [date, name, category, , type, amount, note] = line.split(',').map(s => s.replace(/"/g,'').trim());
        return { date: date || new Date().toISOString().slice(0,10), name: name||'Imported', category: category||'Other', type: (type||'debit').toLowerCase(), amount: Math.abs(parseFloat(amount)||0), note: note||'', icon: '📥', accountId: accounts[0]?.id || '', recurring: false };
      }).filter(r => r.name && r.amount > 0);
      const count = importTransactions(rows);
      toast.success(`Imported ${count} transactions!`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="transactions-page">
      <div className="tx-header">
        <div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Manage & track all your transactions</p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>Transaction Hub</h1>
        </div>
        <div className="tx-header-actions">
          <button className="ghost-btn" onClick={handleExport} style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={15}/> <span className="hide-on-mobile">Export</span>
          </button>
          <button className="gradient-btn" onClick={() => setModal('add')} style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16}/> <span className="hide-on-mobile">Add Entry</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="tx-summary-grid">
        {[
          { label: 'Total In',  value: totalIn,           icon: ArrowUpRight,   color: '#4ade80',         bg: 'rgba(74,222,128,0.15)' },
          { label: 'Total Out', value: totalOut,           icon: ArrowDownRight, color: '#f87171',         bg: 'rgba(248,113,113,0.15)' },
          { label: 'Net Flow',  value: totalIn - totalOut, icon: ArrowUpRight,   color: 'var(--primary)',  bg: 'rgba(192,193,255,0.15)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card-elevated tx-stat">
              <div style={{ width: 40, height: 40, background: s.bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color: s.color }}/>
              </div>
              <div>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                <p style={{ fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: s.color }}>
                  {formatCurrency(Math.abs(s.value), 2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSV Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleCSVImport(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        className={`drop-zone glass ${dragOver ? 'drag-active' : ''}`}
      >
        <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e => handleCSVImport(e.target.files[0])}/>
        <Upload size={26} style={{ color: 'var(--primary)', flexShrink: 0 }}/>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Import CSV or Drop Receipt Here</p>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.78rem', marginTop: 2 }}>CSV with Date, Name, Category, Type, Amount columns · Click or drag</p>
        </div>
      </div>

      {/* Date Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {DATE_FILTERS.map((df, i) => (
          <button key={df.label} onClick={() => setDateFilter(i)}
            className={dateFilter === i ? 'gradient-btn' : 'ghost-btn'}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
            {df.label}
          </button>
        ))}
      </div>

      {/* Search + Category Filters */}
      <div className="tx-filters">
        <div className="tx-search-box">
          <Search size={15} style={{ color: 'var(--outline)', flexShrink: 0 }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." style={{ border:'none', background:'transparent', flex:1, padding:0, fontSize:'0.875rem', boxShadow:'none', minWidth:0 }}/>
        </div>
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={catFilter === cat ? 'gradient-btn' : 'ghost-btn'}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card tx-table-wrap">
        <table className="tx-table">
          <thead>
            <tr style={{ background: 'var(--surface-container-low)' }}>
              <th className="tx-th">Transaction</th>
              <th className="tx-th">Category</th>
              <th className="tx-th hide-col-md">Account</th>
              <th className="tx-th">Date</th>
              <th className="tx-th align-right">Amount</th>
              <th className="tx-th align-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id} className="tx-row">
                <td className="tx-td">
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{tx.icon}</span>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontWeight:600, fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.name}</p>
                      {tx.recurring && <span style={{ fontSize:'0.65rem', color:'var(--primary)', display:'flex', alignItems:'center', gap:2 }}><RefreshCw size={10}/> Recurring</span>}
                    </div>
                  </div>
                </td>
                <td className="tx-td">
                  <span style={{ background:'var(--surface-container-high)', borderRadius:'var(--radius-full)', padding:'0.2rem 0.65rem', fontSize:'0.72rem', color:'var(--on-surface-variant)', fontWeight:500 }}>{tx.category}</span>
                </td>
                <td className="tx-td hide-col-md" style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem' }}>{getAccName(tx.accountId)}</td>
                <td className="tx-td" style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem', whiteSpace:'nowrap' }}>{tx.date}</td>
                <td className="tx-td align-right">
                  <span style={{ fontWeight:700, color: tx.type === 'credit' ? '#4ade80' : 'var(--on-surface)', fontSize:'0.9rem', whiteSpace:'nowrap' }}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount, 2)}
                  </span>
                </td>
                <td className="tx-td align-right">
                  <div style={{ display:'flex', gap:'0.35rem', justifyContent:'flex-end' }}>
                    <button onClick={() => setModal({ type:'edit', tx })} style={{ background:'none', border:'none', color:'var(--outline)', cursor:'pointer', padding:'4px 6px', borderRadius:'var(--radius-sm)' }}><Edit2 size={14}/></button>
                    <button onClick={() => setModal({ type:'delete', tx })} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', padding:'4px 6px', borderRadius:'var(--radius-sm)' }}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding:'3rem', textAlign:'center', color:'var(--outline)' }}>
            <p>No transactions found. {transactions.length === 0 ? 'Add your first one!' : 'Try adjusting your filters.'}</p>
          </div>
        )}
      </div>

      {modal === 'add' && <TransactionModal onClose={() => setModal(null)} onSave={handleSaveTx} accounts={accounts}/>}
      {modal?.type === 'edit' && <TransactionModal initial={modal.tx} onClose={() => setModal(null)} onSave={handleSaveTx} accounts={accounts}/>}
      {modal?.type === 'delete' && (
        <ConfirmModal title="Delete Transaction" message={`Delete "${modal.tx.name}"? This cannot be undone.`} onConfirm={() => handleDeleteTx(modal.tx)} onClose={() => setModal(null)}/>
      )}
    </div>
  );
}
