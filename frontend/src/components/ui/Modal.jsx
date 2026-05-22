import React from 'react';
import { X } from 'lucide-react';

import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, maxWidth = '620px' }) => {
  // Lock background scrolling when modal is open
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

  return (
    <div className="modal-overlay" onClick={onClose} style={{ overflow: 'hidden' }}>
      <div
        className="modal-content animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth, maxHeight: '85vh', overflow: 'hidden' }}
      >
        <button className="close-modal" onClick={onClose} aria-label="Tancar">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        <button className="close-modal" onClick={onClose} aria-label="Tancar">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
