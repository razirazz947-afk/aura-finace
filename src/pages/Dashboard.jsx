import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Eye, EyeOff, Plus, TrendingUp, Shield, Zap, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import TransactionModal from '../components/TransactionModal';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

const EmptyState = ({ icon, title, sub, action, onAction }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem', textAlign: 'center', gap: '0.75rem' }}>
    <span style={{ fontSize: '2rem' }}>{icon}</span>
    <p style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{title}</p>
    <p style={{ color: 'var(--outline)', fontSize: '0.8rem' }}>{sub}</p>
    {action && <button className="gradient-btn" onClick={onAction} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>{action}</button>}
  </div>
);

export default function Dashboard() {
  const { accounts, transactions, budgets, netWorth, addTransaction, formatCurrency } = useApp();
  const { user } = useAuth();
  const toast = useToast();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showTxModal, setShowTxModal] = useState(false);

  // --- Computed stats ---
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTx   = transactions.filter(t => t.date.startsWith(thisMonth));
  const income     = monthTx.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const spend      = monthTx.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? (((income - spend) / income) * 100).toFixed(1) : '0';
  const recent     = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Build chart from real transactions grouped by month
  const chartData = (() => {
    const months = {};
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      if (!months[m]) months[m] = 0;
      months[m] += t.type === 'credit' ? t.amount : -t.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, net]) => ({ month: month.slice(5), net: Math.round(net) }));
  })();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const handleAddTx = (tx) => { addTransaction(tx); toast.success('Transaction added!'); };

  // Getting started checklist
  const hasAccounts     = accounts.length > 0;
  const hasBudgets      = budgets.length > 0;
  const hasTransactions = transactions.length > 0;
  const allDone = hasAccounts && hasBudgets && hasTransactions;

  const ChecklistItem = ({ done, label, subLabel, href }) => (
    <a href={href} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: done ? 'transparent' : 'var(--surface-container-high)', textDecoration: 'none', transition: 'background 0.2s ease' }}
      onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'var(--surface-bright)'; }}
      onMouseLeave={e => { if (!done) e.currentTarget.style.background = 'var(--surface-container-high)'; }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'rgba(74,222,128,0.15)' : 'var(--surface-container-highest)', border: `2px solid ${done ? '#4ade80' : 'var(--outline-variant)'}`, transition: 'all 0.3s ease' }}>
        {done ? <Check size={14} style={{ color: '#4ade80' }}/> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--outline)' }}/>}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: done ? 'var(--outline)' : 'var(--on-surface)', textDecoration: done ? 'line-through' : 'none' }}>{label}</p>
        <p style={{ color: 'var(--outline)', fontSize: '0.75rem' }}>{subLabel}</p>
      </div>
      {!done && <ArrowRight size={14} style={{ color: 'var(--outline)', flexShrink: 0 }}/>}
    </a>
  );

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{greeting}, {firstName} 👋</p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Dashboard</h1>
        </div>
        <button className="gradient-btn" onClick={() => setShowTxModal(true)} style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Getting Started Checklist — hides when everything is done */}
      {!allDone && (
        <div className="card" style={{ border: '1px solid rgba(192,193,255,0.15)', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(128,131,255,0.03))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>🚀 Getting Started</p>
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Set up Aura Finance in 3 steps</h3>
            </div>
            <div style={{ padding: '0.35rem 0.85rem', background: 'rgba(192,193,255,0.12)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {[hasAccounts, hasBudgets, hasTransactions].filter(Boolean).length}/3 complete
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <ChecklistItem done={hasAccounts}     label="Link your first account"   subLabel="Add a bank, savings, or investment account" href="/accounts" />
            <ChecklistItem done={hasBudgets}      label="Create a budget category"  subLabel="Set monthly spending limits by category"    href="/budgets" />
            <ChecklistItem done={hasTransactions} label="Log your first transaction" subLabel="Add income or an expense to get started"    href="/transactions" />
          </div>
        </div>
      )}


      {/* Net Worth Hero */}
      <div className="net-worth-hero card-elevated">
        <div className="net-worth-header">
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Net Worth</p>
            <div className="net-worth-value">
              {balanceVisible
                ? <h2 className="gradient-text" style={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{formatCurrency(netWorth, 0)}</h2>
                : <h2 style={{ fontWeight: 900, color: 'var(--outline)', letterSpacing: '-0.03em', lineHeight: 1 }}>••••••••</h2>
              }
            </div>
          </div>
          <button className="ghost-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setBalanceVisible(!balanceVisible)}>
            {balanceVisible ? <EyeOff size={15}/> : <Eye size={15}/>}
            <span className="hide-on-mobile">{balanceVisible ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        <div className="net-worth-stats">
          <div className="stat-item">
            <TrendingUp size={16} style={{ color: '#4ade80', flexShrink: 0 }}/>
            <div><p className="stat-label">Monthly Income</p><p className="stat-value" style={{ color: '#4ade80' }}>+{formatCurrency(income, 0)}</p></div>
          </div>
          <div className="stat-divider"/>
          <div className="stat-item">
            <ArrowDownRight size={16} style={{ color: '#f87171', flexShrink: 0 }}/>
            <div><p className="stat-label">Monthly Spend</p><p className="stat-value" style={{ color: '#f87171' }}>-{formatCurrency(spend, 0)}</p></div>
          </div>
          <div className="stat-divider"/>
          <div className="stat-item">
            <Shield size={16} style={{ color: 'var(--primary)', flexShrink: 0 }}/>
            <div><p className="stat-label">Savings Rate</p><p className="stat-value" style={{ color: 'var(--primary)' }}>{savingsRate}%</p></div>
          </div>
          <div className="stat-divider"/>
          <div className="stat-item">
            <Zap size={16} style={{ color: 'var(--tertiary)', flexShrink: 0 }}/>
            <div><p className="stat-label">Net Cash Flow</p><p className="stat-value" style={{ color: income - spend >= 0 ? 'var(--tertiary)' : '#f87171' }}>{income - spend >= 0 ? '+' : '-'}{formatCurrency(Math.abs(income - spend), 0)}</p></div>
          </div>
        </div>
      </div>

      {/* Chart + Accounts */}
      <div className="grid-2">

        {/* Cash Flow Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Cash Flow History</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: 2 }}>Monthly net flow from transactions</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8083ff" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#8083ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(70,69,84,0.15)" strokeDasharray="4 4"/>
                <XAxis dataKey="month" tick={{ fill: 'var(--outline)', fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{ background: 'var(--surface-container)', border: '1px solid rgba(70,69,84,0.3)', borderRadius: 12 }} labelStyle={{ color: 'var(--on-surface-variant)', fontSize: 12 }}/>
                <Area type="monotone" dataKey="net" stroke="#c0c1ff" strokeWidth={2.5} fill="url(#nwGrad)" dot={false} name={`Net Flow (${user?.currency || 'USD'})`}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="📊" title="No data yet" sub="Add transactions to see your cash flow chart." action="Add Transaction" onAction={() => setShowTxModal(true)}/>
          )}
        </div>

        {/* Linked Accounts */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Linked Accounts</h3>
          </div>
          {accounts.length > 0 ? (
            <div className="accounts-list">
              {accounts.slice(0, 4).map((acc, i) => (
                <div key={acc.id || i} className="account-row">
                  <div className="account-icon" style={{ color: acc.color || 'var(--primary)' }}>{acc.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</p>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>{acc.type}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{formatCurrency(acc.balance, 0)}</p>
                    {acc.change !== 0 && <span className={acc.change >= 0 ? 'tag-green' : 'tag-red'}>{acc.change >= 0 ? '+' : ''}{acc.change}%</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="🏦" title="No accounts linked" sub="Go to Accounts to add your first account."/>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div><h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Transactions</h3><p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: 2 }}>Latest activity</p></div>
          <button className="ghost-btn" onClick={() => setShowTxModal(true)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
            <Plus size={12}/> Add
          </button>
        </div>
        {recent.length > 0 ? (
          <div className="transactions-list">
            {recent.map(tx => (
              <div key={tx.id} className="transaction-row">
                <div className="tx-icon">{tx.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.name}</p>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>{tx.category} · {tx.date}</p>
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: tx.type === 'credit' ? '#4ade80' : 'var(--on-surface)', flexShrink: 0 }}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="💳" title="No transactions yet" sub="Start by adding your first income or expense." action="Add Transaction" onAction={() => setShowTxModal(true)}/>
        )}
      </div>

      {showTxModal && <TransactionModal onClose={() => setShowTxModal(false)} onSave={handleAddTx} accounts={accounts}/>}
    </div>
  );
}
