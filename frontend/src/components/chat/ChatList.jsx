import React from 'react';
import { MessageSquare, Search, MoreHorizontal } from 'lucide-react';
import ChatItem from './ChatItem';
import styles from './Chat.module.css';

const ChatList = ({ conversations, activeChatId, onSelectChat, searchQuery, onSearchChange, hidden }) => {
  return (
    <aside className={`${styles.sidebar} ${hidden ? styles.sidebarHidden : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>
          <MessageSquare className="text-lime" size={28} />
          <h2>CONVERSES</h2>
        </div>
        
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Cerca un match..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className={`${styles.chatList} custom-scrollbar`}>
        {conversations.length > 0 ? (
          conversations.map(conv => (
            <ChatItem 
              key={conv.id}
              conv={conv}
              active={activeChatId === conv.id}
              onClick={onSelectChat}
            />
          ))
        ) : (
          <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
              <Search size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">Sense matches</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatList;
