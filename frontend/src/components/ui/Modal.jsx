import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal component.
 * Props:
 *  - isOpen: boolean to control visibility
 *  - onClose: callback to close the modal
 *  - children: modal body content
 *  - maxWidth: optional max-width for the modal content (default 620px)
 */
const Modal = ({ isOpen, onClose, children, maxWidth = '620px' }) => {
  // Prevent background scrolling when modal is open
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

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1rem',
  };

  const contentStyle = {
    background: '#111116',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2.5rem',
    borderRadius: '28px',
    width: '90%',
    maxWidth,
    position: 'relative',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
    maxHeight: '90vh', // fits within viewport
    overflowY: 'auto', // scroll if content exceeds
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    color: 'var(--color-muted3)',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '4px',
    cursor: 'pointer',
    zIndex: 50,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

