import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, UserPlus } from 'lucide-react';
import ChatItem from './ChatItem';
import styles from './Chat.module.css';
import api from '../../services/api';

const ChatList = ({ conversations, activeChatId, onSelectChat, searchQuery, onSearchChange, hidden }) => {
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searching, setSearching] = useState(false);

  // Debounced user search when query has no matching conversations
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchedUsers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await api.get(`/users/search?query=${searchQuery}`);
        // Filter out users that already have a conversation
        const existingIds = conversations.map(c => c.id);
        const newUsers = response.data.filter(u => !existingIds.includes(u._id));
        setSearchedUsers(newUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, conversations]);

  const handleStartChat = (user) => {
    onSelectChat({ id: user._id, name: user.name, avatar: user.avatar });
    onSearchChange('');
    setSearchedUsers([]);
  };

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
            placeholder="Cerca conversa o usuari..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className={`${styles.chatList} custom-scrollbar`}>
        {/* Existing conversations */}
        {conversations.length > 0 && conversations.map(conv => (
          <ChatItem 
            key={conv.id}
            conv={conv}
            active={activeChatId === conv.id}
            onClick={onSelectChat}
          />
        ))}

        {/* New users found by search (not in existing conversations) */}
        {searchQuery.trim() && searchedUsers.length > 0 && (
          <>
            <div style={{ padding: '12px 20px 6px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.25)' }}>
              Nous usuaris
            </div>
            {searchedUsers.map(u => (
              <div
                key={u._id}
                onClick={() => handleStartChat(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  margin: '2px 8px',
                  transition: 'all 0.2s',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,245,66,0.08)'; e.currentTarget.style.borderColor = 'rgba(200,245,66,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
              >
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(200,245,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(200,245,66,0.5)', fontWeight: 900, fontSize: '14px' }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>Nou missatge</div>
                </div>
                <UserPlus size={16} style={{ color: 'rgba(200,245,66,0.6)', flexShrink: 0 }} />
              </div>
            ))}
          </>
        )}

        {/* Empty state */}
        {conversations.length === 0 && searchedUsers.length === 0 && !searching && (
          <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
              <Search size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">
              {searchQuery ? 'Cap resultat' : 'Sense converses'}
            </p>
          </div>
        )}

        {/* Loading */}
        {searching && (
          <div className="py-6 flex justify-center">
            <div style={{ width: 24, height: 24, border: '3px solid rgba(200,245,66,0.15)', borderTopColor: '#c8f542', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatList;
