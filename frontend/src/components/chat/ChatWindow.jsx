import React, { useEffect, useRef } from 'react';
import { ChevronLeft, User, MoreHorizontal, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import styles from './Chat.module.css';

const ChatWindow = ({ 
  activeChat, 
  messages, 
  newMessage, 
  onMessageChange, 
  onSendMessage, 
  onBack, 
  isPremium, 
  onFileUpload,
  hidden 
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChat) {
    return (
      <main className={`${styles.welcomeScreen} ${hidden ? styles.windowHidden : ''}`}>
        <div className={styles.welcomeIcon}>
          <MessageSquare size={90} />
        </div>
        <h2>BENVINGUT AL <span className="text-lime">XAT</span></h2>
        <p>Selecciona un dels teus matches per començar a parlar. La teva privacitat és la nostra prioritat.</p>
      </main>
    );
  }

  return (
    <main className={`${styles.chatWindow} ${hidden ? styles.windowHidden : ''}`}>
      <header className={styles.windowHeader}>
        <div className={styles.headerInfo}>
          <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-muted3 hover:text-white">
            <ChevronLeft size={32} />
          </button>
          
          <div className={styles.avatarWrapper}>
            <div className={styles.headerAvatar}>
              {activeChat.avatar ? (
                <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover rounded-[22px]" />
              ) : (
                activeChat.name[0].toUpperCase()
              )}
            </div>
            <div className={styles.onlineBadge}></div>
          </div>

          <div className={styles.headerDetails}>
            <h3>{activeChat.name}</h3>
            <div className={styles.headerStatus}>
              <span>En línia ara</span>
            </div>
          </div>
        </div>

      </header>

      <div className={styles.messageList}>
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <MessageBubble key={msg._id || idx} msg={msg} />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <MessageSquare size={80} strokeWidth={1} className="mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.3em]">No hi ha missatges encara</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        value={newMessage}
        onChange={onMessageChange}
        onSend={onSendMessage}
        isPremium={isPremium}
        onFileUpload={onFileUpload}
      />
    </main>
  );
};

export default ChatWindow;
