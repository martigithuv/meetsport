import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal component.
 * The overlay is scrollable — the modal content grows naturally.
 * No internal scroll inside the modal.
 */
const Modal = ({ isOpen, onClose, children, maxWidth = '620px' }) => {
  // The overlay is position:fixed and scrollable — no need to lock the body.
  // We only save/restore scroll position to prevent jumpiness.
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.dataset.scrollY = scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.dataset.scrollY || '0';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY));
    }
    return () => {
      const scrollY = document.body.dataset.scrollY || '0';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Scrollable overlay — acts as the scroll container
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    overflowY: 'auto',       // scroll happens HERE, on the overlay
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start', // align top so tall modals scroll naturally
    padding: '3rem 1rem',     // breathing room top/bottom
  };

  // Modal content — grows naturally, no maxHeight, no internal scroll
  const contentStyle = {
    background: '#111116',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2.5rem',
    borderRadius: '28px',
    width: '90%',
    maxWidth,
    position: 'relative',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
    flexShrink: 0,            // don't shrink, grow naturally
  };

  // Close button — sticky so it's always visible while scrolling
  const closeButtonStyle = {
    position: 'sticky',
    top: '0',
    float: 'right',
    color: '#a1a1aa',
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    zIndex: 50,
    marginBottom: '-2rem',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose} aria-label="Tancar modal">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
