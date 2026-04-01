import Modal from './Modal';

export default function ConfirmModal({ title, message, onConfirm, onClose, danger = true }) {
  return (
    <Modal title={title} onClose={onClose} width="420px">
      <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{message}</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button className="ghost-btn" onClick={onClose} style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          style={{
            padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
            background: danger ? 'linear-gradient(135deg,#ef4444,#f87171)' : 'var(--gradient-primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
        >
          {danger ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}
