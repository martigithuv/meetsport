import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, maxWidth = '520px' }) => {
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
