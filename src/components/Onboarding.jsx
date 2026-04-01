import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, CreditCard, Wallet, RefreshCw } from 'lucide-react';

const steps = [
  {
    icon: '👋',
    title: 'Welcome to Aura Finance',
    desc: 'Your personal finance command centre. It takes about 2 minutes to set up. Let\'s walk you through it.',
    cta: 'Let\'s Start',
    skip: true,
  },
  {
    icon: '🏦',
    title: 'Step 1 — Link an Account',
    desc: 'Add your bank, savings, investment, or crypto accounts. Aura tracks all your balances in one place.',
    cta: 'Go to Accounts',
    nav: '/accounts',
    skip: true,
    color: '#6366F1',
    bulletIcon: CreditCard,
  },
  {
    icon: '📊',
    title: 'Step 2 — Set Up Budgets',
    desc: 'Create monthly spending limits for categories like Groceries, Dining, and Entertainment. Aura tracks your progress automatically.',
    cta: 'Go to Budgets',
    nav: '/budgets',
    skip: true,
    color: '#4ade80',
    bulletIcon: Wallet,
  },
  {
    icon: '💳',
    title: 'Step 3 — Add Transactions',
    desc: 'Log income and expenses manually, or import a CSV. Every transaction updates your budget and net worth in real time.',
    cta: 'Go to Transactions',
    nav: '/transactions',
    skip: false,
    color: '#ffb783',
    bulletIcon: RefreshCw,
  },
];

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const s = steps[step];
  const isLast = step === steps.length - 1;

  const handleCta = () => {
    if (s.nav) {
      navigate(s.nav);
    }
    if (isLast) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(10px)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface-container)',
        border: '1px solid rgba(70,69,84,0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        width: '100%', maxWidth: '460px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        position: 'relative',
        animation: 'slideUp 0.3s ease',
      }}>

        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'var(--surface-container-high)', border: 'none',
          borderRadius: 'var(--radius-full)', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--outline)',
        }}>
          <X size={14}/>
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: i <= step ? 2 : 1,
              borderRadius: 999,
              background: i <= step ? 'var(--gradient-primary)' : 'var(--surface-container-highest)',
              transition: 'all 0.3s ease',
            }}/>
          ))}
        </div>

        {/* Icon */}
        <div style={{ fontSize: '3rem', marginBottom: '1.25rem', lineHeight: 1 }}>{s.icon}</div>

        {/* Title + desc */}
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>{s.title}</h2>
        <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2rem' }}>{s.desc}</p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleCta}
            className="gradient-btn"
            style={{ flex: 1, padding: '0.85rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {s.cta} <ArrowRight size={16}/>
          </button>
          {s.skip && !isLast && (
            <button
              onClick={() => isLast ? onClose() : setStep(step + 1)}
              style={{ background: 'none', border: 'none', color: 'var(--outline)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}
            >
              Skip
            </button>
          )}
        </div>

        {/* Step counter */}
        <p style={{ color: 'var(--outline)', fontSize: '0.75rem', marginTop: '1.25rem', textAlign: 'center' }}>
          {step + 1} of {steps.length}
        </p>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
