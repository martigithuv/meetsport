import React from 'react';
import styles from './Chat.module.css';

const ChatItem = ({ conv, active, onClick }) => {
  const formattedTime = conv.time 
    ? new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '';

  return (
    <div 
      className={`${styles.chatItem} ${active ? styles.chatItemActive : ''}`}
      onClick={() => onClick(conv)}
    >
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar}>
          {conv.avatar ? (
            <img src={conv.avatar} alt={conv.name} />
          ) : (
            conv.name[0].toUpperCase()
          )}
        </div>
        {/* Placeholder for online status - could be passed in props if backend supports it */}
        <div className={styles.onlineBadge}></div>
      </div>

      <div className={styles.chatInfo}>
        <div className={styles.chatInfoHeader}>
          <h4 className={styles.chatName}>{conv.name}</h4>
          <span className={styles.chatTime}>{formattedTime}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className={styles.chatLastMsg}>
            {conv.lastMessage || 'Inicia una conversa...'}
          </p>
          {conv.unread && <span className={styles.unreadBadge}>{conv.unreadCount || 1}</span>}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
