import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        onConfirm: () => {
          setConfirmState({ isOpen: false, message: '', onConfirm: null, onCancel: null });
          resolve(true);
        },
        onCancel: () => {
          setConfirmState({ isOpen: false, message: '', onConfirm: null, onCancel: null });
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {confirmState.isOpen && (
        <div 
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={confirmState.onCancel}
        >
          <div 
            style={{
              background: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
              padding: '32px', maxWidth: '400px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(200,245,66,0.05)',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(200,245,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8f542' }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'white' }}>Confirmació</h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.5, marginBottom: '32px' }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={confirmState.onCancel}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
              >Cancel·lar</button>
              <button 
                onClick={confirmState.onConfirm}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#c8f542', color: '#0a1a0a', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >Aceptar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </ConfirmContext.Provider>
  );
};
