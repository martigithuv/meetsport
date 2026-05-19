import React, { useRef } from 'react';
import { Paperclip, Send } from 'lucide-react';
import styles from './Chat.module.css';

const MessageInput = ({ value, onChange, onSend, isPremium, onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <footer className={styles.inputArea}>
      <div className={styles.inputWrapper}>
        {isPremium && (
          <button 
            className={styles.iconBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Adjuntar imatge"
          >
            <Paperclip size={22} />
          </button>
        )}
        
        <input 
          type="text"
          placeholder="Escriu un missatge..."
          className={styles.inputMain}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button 
          className={`${styles.iconBtn} ${styles.sendBtn} ${!value.trim() ? styles.sendBtnDisabled : ''}`}
          onClick={() => onSend()}
          disabled={!value.trim()}
        >
          <Send size={22} />
        </button>
      </div>
      
      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={onFileUpload} 
      />
    </footer>
  );
};

export default MessageInput;
