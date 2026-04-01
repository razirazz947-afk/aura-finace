import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? 'rgba(239,68,68,0.15)' :
                        t.type === 'warning' ? 'rgba(255,183,131,0.15)' :
                        t.type === 'info' ? 'rgba(192,193,255,0.15)' : 'rgba(74,222,128,0.15)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${
              t.type === 'error' ? 'rgba(239,68,68,0.3)' :
              t.type === 'warning' ? 'rgba(255,183,131,0.3)' :
              t.type === 'info' ? 'rgba(192,193,255,0.3)' : 'rgba(74,222,128,0.3)'
            }`,
            color: t.type === 'error' ? '#f87171' :
                   t.type === 'warning' ? '#ffb783' :
                   t.type === 'info' ? 'var(--primary)' : '#4ade80',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 600,
            maxWidth: '320px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'slideInToast 0.3s ease',
          }}>
            {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : t.type === 'warning' ? '⚠ ' : 'ℹ '}{t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
