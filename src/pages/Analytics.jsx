import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Zap, Target, AlertTriangle, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useApp } from '../context/AppContext';
import './Analytics.css';

const SimpleTooltip = ({ active, payload, label }) => {
  const { formatCurrency } = useApp();
  if (active && payload && payload.length) {
    return (
      <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid rgba(70,69,84,0.3)' }}>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.72rem', marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: '0.8rem' }}>
            {p.name}: {typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value, 0) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EmptyAnalytics = ({ onNavigate }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 2rem', textAlign:'center', gap:'1.25rem' }}>
    <div style={{ width:72, height:72, borderRadius:'var(--radius-xl)', background:'rgba(192,193,255,0.08)', border:'1px solid rgba(192,193,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <BarChart2 size={32} style={{ color:'var(--primary)', opacity:0.7 }}/>
    </div>
    <div>
      <h3 style={{ fontWeight:700, fontSize:'1.2rem', marginBottom:'0.5rem' }}>No data to analyze yet</h3>
      <p style={{ color:'var(--on-surface-variant)', lineHeight:1.7, maxWidth:380 }}>
        Analytics unlock once you add transactions. Start by linking an account and logging your income and expenses.
      </p>
    </div>
    <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', justifyContent:'center' }}>
      <button className="gradient-btn" onClick={() => onNavigate('/accounts')} style={{ padding:'0.65rem 1.25rem', fontSize:'0.875rem' }}>
        Add Account
      </button>
      <button className="ghost-btn" onClick={() => onNavigate('/transactions')} style={{ padding:'0.65rem 1.25rem', fontSize:'0.875rem' }}>
        Add Transaction
      </button>
    </div>
  </div>
);

const COLORS = ['#8083ff','#c0c1ff','#6366F1','#ffb783','#4ade80','#f87171','#34d399','#a78bfa'];

export default function Analytics() {
  const { transactions, accounts, budgets, formatCurrency } = useApp();
  const navigate = useNavigate();

  const hasData = transactions.length > 0;

  // Build category spending chart from real data
  const categorySpend = {};
  transactions.filter(t => t.type === 'debit').forEach(t => {
    categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
  });
  const categoryData = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value]) => ({ name, value: Math.round(value) }));

  // Build monthly income vs spend from real data
  const monthlyMap = {};
  transactions.forEach(t => {
    const m = t.date.slice(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { month: m.slice(5), income: 0, spend: 0 };
    if (t.type === 'credit') monthlyMap[m].income += t.amount;
    else monthlyMap[m].spend += t.amount;
  });
  const monthlyData = Object.values(monthlyMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({ ...m, income: Math.round(m.income), spend: Math.round(m.spend) }));

  // Allocation from accounts
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const allocationData = accounts.map((a, i) => ({
    name:  a.name.length > 16 ? a.name.slice(0, 16) + '…' : a.name,
    value: totalBalance > 0 ? parseFloat(((a.balance / totalBalance) * 100).toFixed(1)) : 0,
    color: COLORS[i % COLORS.length],
  })).filter(a => a.value > 0);

  // Simple derived stats
  const totalIn  = transactions.filter(t => t.type === 'credit').reduce((s,t) => s+t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'debit').reduce((s,t) => s+t.amount, 0);
  const savingsRate = totalIn > 0 ? ((totalIn - totalOut) / totalIn * 100).toFixed(1) : 0;
  const avgMonthlySpend = monthlyData.length > 0 ? (totalOut / monthlyData.length).toFixed(0) : 0;
  const topCategory = categoryData[0]?.name || '—';

  const statCards = [
    { label:'Total Income',       value:formatCurrency(totalIn, 0),       sub:'All time',          icon:TrendingUp,    good:true  },
    { label:'Total Expenses',     value:formatCurrency(totalOut, 0),      sub:'All time',          icon:TrendingDown,  good:false },
    { label:'Savings Rate',       value:`${savingsRate}%`,                sub:'Income vs spend',   icon:Target,        good: parseFloat(savingsRate) >= 20 },
    { label:'Top Spend Category', value:topCategory,                      sub:`Avg ${formatCurrency(avgMonthlySpend, 0)}/mo`, icon:AlertTriangle, good:false },
  ];

  return (
    <div className="analytics-page">
      <div>
        <p style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>Powered by your real financial data</p>
        <h1 style={{ fontSize:'clamp(1.4rem, 4vw, 1.75rem)', fontWeight:800, letterSpacing:'-0.02em', marginTop:'0.25rem' }}>Advanced Analytics</h1>
      </div>

      {!hasData ? (
        <div className="card" style={{ padding: 0 }}>
          <EmptyAnalytics onNavigate={navigate} />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="metrics-grid">
            {statCards.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="card-elevated metric-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                    <Icon size={18} style={{ color: m.good ? 'var(--primary)' : 'var(--tertiary)' }} />
                    <span className={m.good ? 'tag-green' : 'tag-amber'} style={{ fontSize:'0.65rem' }}>
                      {m.good ? 'Healthy' : 'Monitor'}
                    </span>
                  </div>
                  <p style={{ fontSize:'clamp(1rem, 2.5vw, 1.4rem)', fontWeight:800, letterSpacing:'-0.02em', color: m.good ? 'var(--primary)' : 'var(--tertiary)', wordBreak:'break-word' }}>{m.value}</p>
                  <p style={{ fontWeight:600, fontSize:'0.875rem', marginTop:'0.25rem' }}>{m.label}</p>
                  <p style={{ color:'var(--on-surface-variant)', fontSize:'0.72rem', marginTop:2 }}>{m.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Monthly Income vs Spend */}
          {monthlyData.length > 0 && (
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.5rem' }}>
                <div>
                  <h3 style={{ fontWeight:700 }}>Monthly Income vs Spending</h3>
                  <p style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem', marginTop:2 }}>Based on your transactions</p>
                </div>
                <div style={{ display:'flex', gap:'1rem' }}>
                  {[['Income','#8083ff'],['Spend','#ffb783']].map(([n,c]) => (
                    <div key={n} style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:c }}/>
                      <span style={{ fontSize:'0.72rem', color:'var(--on-surface-variant)' }}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid stroke="rgba(70,69,84,0.15)" strokeDasharray="4 4" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fill:'var(--outline)', fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip content={<SimpleTooltip/>}/>
                  <Bar dataKey="income" fill="#8083ff" radius={[6,6,0,0]} name="Income"/>
                  <Bar dataKey="spend"  fill="#ffb783" radius={[6,6,0,0]} name="Spend"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Spend + Allocation */}
          <div className="analytics-bottom-grid">
            {/* Category breakdown */}
            {categoryData.length > 0 && (
              <div className="card">
                <h3 style={{ fontWeight:700, marginBottom:'0.5rem' }}>Spending by Category</h3>
                <p style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem', marginBottom:'1.25rem' }}>All-time total by category</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  {categoryData.map((c, i) => {
                    const pct = categoryData[0].value > 0 ? (c.value / categoryData[0].value) * 100 : 0;
                    return (
                      <div key={c.name}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:'0.8rem', fontWeight:500 }}>{c.name}</span>
                          <span style={{ fontSize:'0.8rem', fontWeight:700 }}>{formatCurrency(c.value, 0)}</span>
                        </div>
                        <div style={{ background:'var(--surface-container-highest)', borderRadius:999, height:6 }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:COLORS[i % COLORS.length], borderRadius:999, transition:'width 0.6s ease' }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Portfolio allocation */}
            {allocationData.length > 0 && (
              <div className="card allocation-card">
                <h3 style={{ fontWeight:700, marginBottom:'0.5rem' }}>Account Allocation</h3>
                <p style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem', marginBottom:'1rem' }}>Balance distribution across accounts</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <PieChart width={160} height={160}>
                    <Pie data={allocationData} cx={75} cy={75} innerRadius={44} outerRadius={72} paddingAngle={3} dataKey="value">
                      {allocationData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                  </PieChart>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginTop:'0.75rem' }}>
                  {allocationData.map(item => (
                    <div key={item.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', minWidth:0 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:item.color, flexShrink:0 }}/>
                        <span style={{ fontSize:'0.8rem', color:'var(--on-surface-variant)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize:'0.85rem', fontWeight:600, flexShrink:0 }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary insight */}
          <div className="card" style={{ borderLeft:'3px solid var(--primary)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <Zap size={18} style={{ color:'var(--primary)' }}/>
              <h3 style={{ fontWeight:700 }}>Financial Summary</h3>
            </div>
            <p style={{ color:'var(--on-surface-variant)', lineHeight:1.7, fontSize:'0.95rem' }}>
              You have logged <strong style={{ color:'var(--on-surface)' }}>{transactions.length} transactions</strong> across{' '}
              <strong style={{ color:'var(--on-surface)' }}>{accounts.length} account{accounts.length !== 1 ? 's' : ''}</strong>.{' '}
              {parseFloat(savingsRate) > 0
                ? <>Your savings rate is <strong style={{ color:'#4ade80' }}>{savingsRate}%</strong> — {parseFloat(savingsRate) >= 20 ? 'excellent work!' : 'try to aim for 20% or more.'}</>
                : 'Add more income transactions to calculate your savings rate.'
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
}
