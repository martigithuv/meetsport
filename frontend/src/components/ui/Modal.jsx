import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Reusable modal component.
 * The overlay is scrollable — the modal content grows naturally.
 * No internal scroll inside the modal.
 */
const Modal = ({ isOpen, onClose, children, maxWidth = '620px', clean = false }) => {
  // The overlay is position:fixed and scrollable — no need to lock the body.
  // We only save/restore scroll position to prevent jumpiness.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Scrollable overlay — acts as the viewport for scrolling
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    overflowY: 'auto',
    zIndex: 2000,
  };

  // Wrapper guarantees centering without top clipping
  const wrapperStyle = {
    display: 'flex',
    minHeight: '100%',
    padding: '3rem 1rem',
  };

  // Modal content
  const contentStyle = clean ? {
    margin: 'auto', // Safely centers without top-clipping
    width: '100%', // Use 100% since maxWidth will constrain it
    maxWidth,
    position: 'relative',
    flexShrink: 0,
  } : {
    margin: 'auto', // Safely centers without top-clipping
    background: '#111116',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2.5rem',
    borderRadius: '28px',
    width: '100%', // Use 100% since maxWidth will constrain it
    maxWidth,
    position: 'relative',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
    flexShrink: 0,
  };

  // Close button
  const closeButtonStyle = clean ? {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    color: '#ffffff',
    background: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    borderRadius: '50%',
    padding: '8px',
    cursor: 'pointer',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } : {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    color: '#a1a1aa',
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    zIndex: 50,
  };

  return createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={wrapperStyle}>
        <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
          <button style={closeButtonStyle} onClick={onClose} aria-label="Tancar modal">
            <X size={20} />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
