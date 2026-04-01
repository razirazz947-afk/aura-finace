import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

export function AppProvider({ children }) {
  const { user, rawUser } = useAuth();
  const uid = rawUser?.id;

  const [accounts,     setAccounts]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets,      setBudgets]      = useState([]);
  const [darkMode,     setDarkModeState] = useState(true);
  const [loading,      setLoading]      = useState(true);

  // ── Load all data when user changes ───────────────────────────────────────
  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    loadAll();
  }, [uid]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [accs, txs, bgs] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', uid).order('created_at'),
        supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', uid).order('created_at'),
      ]);
      if (accs.data)  setAccounts(accs.data.map(dbToAccount));
      if (txs.data)   setTransactions(txs.data.map(dbToTx));
      if (bgs.data)   setBudgets(bgs.data.map(dbToBudget));

      // Load dark mode from localStorage (still local preference)
      const dm = localStorage.getItem(`aura_theme_${uid}`);
      const isDark = dm === null ? true : dm === 'true';
      setDarkModeState(isDark);
      applyTheme(isDark);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── DB shape converters ───────────────────────────────────────────────────
  const dbToAccount = (r) => ({ id: r.id, name: r.name, type: r.type, bank: r.bank, balance: Number(r.balance), number: r.number, color: r.color, change: Number(r.change || 0) });
  const dbToTx      = (r) => ({ id: r.id, name: r.name, amount: Number(r.amount), type: r.type, category: r.category, accountId: r.account_id, date: r.date, icon: r.icon, note: r.note, recurring: r.recurring });
  const dbToBudget  = (r) => ({ id: r.id, name: r.name, limit: Number(r.limit_amount), color: r.color, icon: r.icon, category: r.category });

  // ── Dark mode ─────────────────────────────────────────────────────────────
  const setDarkMode = (val) => {
    setDarkModeState(val);
    applyTheme(val);
    if (uid) localStorage.setItem(`aura_theme_${uid}`, String(val));
  };

  // ── Derived: budget spending this month ───────────────────────────────────
  const getBudgetSpent = useCallback((budgetName) => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return transactions
      .filter(t => t.type === 'debit' && t.category === budgetName && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const budgetsWithSpent = budgets.map(b => ({ ...b, spent: getBudgetSpent(b.name) }));
  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

  // ── Transactions ──────────────────────────────────────────────────────────
  const addTransaction = async (tx) => {
    const row = {
      user_id:    uid,
      name:       tx.name,
      amount:     tx.amount,
      type:       tx.type,
      category:   tx.category,
      account_id: tx.accountId || null,
      date:       tx.date,
      icon:       tx.icon || '💳',
      note:       tx.note || '',
      recurring:  tx.recurring || false,
    };
    const { data, error } = await supabase.from('transactions').insert(row).select().single();
    if (error) throw new Error(error.message);
    const newTx = dbToTx(data);
    setTransactions(prev => [newTx, ...prev]);
    // Update account balance
    if (tx.accountId) {
      const acc = accounts.find(a => a.id === tx.accountId);
      if (acc) {
        const newBalance = tx.type === 'credit' ? acc.balance + tx.amount : acc.balance - tx.amount;
        await updateAccount(acc.id, { balance: newBalance });
      }
    }
    return newTx;
  };

  const updateTransaction = async (id, changes) => {
    const row = {};
    if (changes.name      !== undefined) row.name       = changes.name;
    if (changes.amount    !== undefined) row.amount     = changes.amount;
    if (changes.type      !== undefined) row.type       = changes.type;
    if (changes.category  !== undefined) row.category   = changes.category;
    if (changes.accountId !== undefined) row.account_id = changes.accountId;
    if (changes.date      !== undefined) row.date       = changes.date;
    if (changes.icon      !== undefined) row.icon       = changes.icon;
    if (changes.note      !== undefined) row.note       = changes.note;
    if (changes.recurring !== undefined) row.recurring  = changes.recurring;
    const { error } = await supabase.from('transactions').update(row).eq('id', id);
    if (error) throw new Error(error.message);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));
  };

  const deleteTransaction = async (id) => {
    const tx = transactions.find(t => t.id === id);
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setTransactions(prev => prev.filter(t => t.id !== id));
    // Reverse the account balance
    if (tx?.accountId) {
      const acc = accounts.find(a => a.id === tx.accountId);
      if (acc) {
        const newBalance = tx.type === 'credit' ? acc.balance - tx.amount : acc.balance + tx.amount;
        await updateAccount(acc.id, { balance: newBalance });
      }
    }
  };

  const importTransactions = async (rows) => {
    const dbRows = rows.map(r => ({
      user_id: uid, name: r.name, amount: r.amount, type: r.type,
      category: r.category, account_id: r.accountId || null,
      date: r.date, icon: r.icon || '📥', note: r.note || '', recurring: false,
    }));
    const { data, error } = await supabase.from('transactions').insert(dbRows).select();
    if (error) throw new Error(error.message);
    setTransactions(prev => [...data.map(dbToTx), ...prev]);
    return data.length;
  };

  // ── Accounts ──────────────────────────────────────────────────────────────
  const addAccount = async (acc) => {
    const row = { user_id: uid, name: acc.name, type: acc.type, bank: acc.bank, balance: acc.balance, number: acc.number || '', color: acc.color, change: acc.change || 0 };
    const { data, error } = await supabase.from('accounts').insert(row).select().single();
    if (error) throw new Error(error.message);
    const newAcc = dbToAccount(data);
    setAccounts(prev => [...prev, newAcc]);
    return newAcc;
  };

  const updateAccount = async (id, changes) => {
    const row = {};
    if (changes.name    !== undefined) row.name    = changes.name;
    if (changes.type    !== undefined) row.type    = changes.type;
    if (changes.bank    !== undefined) row.bank    = changes.bank;
    if (changes.balance !== undefined) row.balance = changes.balance;
    if (changes.number  !== undefined) row.number  = changes.number;
    if (changes.color   !== undefined) row.color   = changes.color;
    if (changes.change  !== undefined) row.change  = changes.change;
    const { error } = await supabase.from('accounts').update(row).eq('id', id);
    if (error) throw new Error(error.message);
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...changes } : a));
  };

  const deleteAccount = async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // ── Budgets ───────────────────────────────────────────────────────────────
  const addBudget = async (b) => {
    const row = { user_id: uid, name: b.name, limit_amount: b.limit, color: b.color, icon: b.icon, category: b.category };
    const { data, error } = await supabase.from('budgets').insert(row).select().single();
    if (error) throw new Error(error.message);
    const newB = dbToBudget(data);
    setBudgets(prev => [...prev, newB]);
    return newB;
  };

  const updateBudget = async (id, changes) => {
    const row = {};
    if (changes.name     !== undefined) row.name         = changes.name;
    if (changes.limit    !== undefined) row.limit_amount = changes.limit;
    if (changes.color    !== undefined) row.color        = changes.color;
    if (changes.icon     !== undefined) row.icon         = changes.icon;
    if (changes.category !== undefined) row.category     = changes.category;
    const { error } = await supabase.from('budgets').update(row).eq('id', id);
    if (error) throw new Error(error.message);
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b));
  };

  const deleteBudget = async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const formatCurrency = useCallback((amount, maximumFractionDigits = 2) => {
    const currency = user?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits
    }).format(amount);
  }, [user?.currency]);

  if (loading) return null; // Layout handles loading state

  return (
    <AppContext.Provider value={{
      accounts, transactions, budgets: budgetsWithSpent, netWorth, darkMode,
      addTransaction, updateTransaction, deleteTransaction, importTransactions,
      addAccount, updateAccount, deleteAccount,
      addBudget, updateBudget, deleteBudget,
      setDarkMode, refreshData: loadAll, formatCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
