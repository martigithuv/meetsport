import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && toast) setToast(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toast]);

  const iconMap = {
    success: '✅',
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️'
  };

  const colorMap = {
    success: { bg: '#0a1a0a', border: 'rgba(200,245,66,0.35)', glow: 'rgba(200,245,66,0.12)', iconBg: 'rgba(200,245,66,0.15)' },
    error:   { bg: '#1a0a0a', border: 'rgba(255,0,51,0.35)',    glow: 'rgba(255,0,51,0.12)',    iconBg: 'rgba(255,0,51,0.15)'   },
    warning: { bg: '#1a1508', border: 'rgba(255,140,0,0.35)',   glow: 'rgba(255,140,0,0.12)',   iconBg: 'rgba(255,140,0,0.15)'  },
    info:    { bg: '#080f1a', border: 'rgba(100,180,255,0.35)',  glow: 'rgba(100,180,255,0.12)', iconBg: 'rgba(100,180,255,0.15)' }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* OVERLAY - click to close */}
      {toast && (
        <div 
          onClick={hideToast}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            animation: 'toastOverlayIn 0.25s ease'
          }}
        />
      )}

      {/* TOAST */}
      {toast && (() => {
        const colors = colorMap[toast.type] || colorMap.success;
        return (
          <div
            key={toast.id}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '24px',
              padding: '32px 48px 32px 32px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 50px ${colors.glow}`,
              animation: 'toastPopIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px'
            }}
          >
            {/* Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: colors.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0
            }}>
              {iconMap[toast.type] || '✅'}
            </div>

            {/* Message */}
            <p style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: 1.6,
              margin: 0,
              fontFamily: 'inherit'
            }}>{toast.message}</p>

            {/* Close button */}
            <button 
              onClick={(e) => { e.stopPropagation(); hideToast(); }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                padding: '6px 10px',
                fontSize: '14px',
                fontWeight: 900,
                lineHeight: 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.color = 'white'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = 'rgba(255,255,255,0.4)'; }}
            >✕</button>
          </div>
        );
      })()}

      {/* Animations */}
      <style>{`
        @keyframes toastPopIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes toastOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
