import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Import new components
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import styles from '../components/chat/Chat.module.css';

const Matches = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_user_room', user._id);
    });

    newSocket.on('receive_message', (data) => {
      fetchConversations();
      // Check if the message belongs to the currently active chat
      if (activeChat && (activeChat.id === data.senderId || activeChat.id === data.recipientId)) {
        setMessages(prev => {
          const exists = prev.find(m => m._id === data._id);
          if (exists) return prev;
          return [...prev, { ...data, isMe: data.senderId === user._id }];
        });
      }
    });

    return () => newSocket.close();
  }, [user._id, activeChat]);

  useEffect(() => {
    fetchConversations();
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    const userName = params.get('userName');
    if (userId && userName) {
      setActiveChat({ id: userId, name: userName });
      fetchHistory(userId);
    }
  }, [location.search]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchHistory = async (otherId) => {
    try {
      const response = await api.get(`/messages/${otherId}`);
      setMessages(response.data.map(m => ({
        ...m,
        isMe: m.senderId === user._id
      })));
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleSelectChat = (conv) => {
    setActiveChat(conv);
    fetchHistory(conv.id);
  };

  const handleSend = async (imgData = null) => {
    // Prevent accidental passing of event objects
    const finalImage = typeof imgData === 'string' ? imgData : null;
    
    if (!newMessage.trim() && !finalImage) return;
    if (!activeChat) return;

    try {
      const response = await api.post(`/messages/send/${activeChat.id}`, {
        content: newMessage,
        image: finalImage
      });
      
      const data = response.data;
      
      // Añadir el mensaje inmediatamente a la vista local
      setMessages(prev => [...prev, { ...data, isMe: true }]);
      setNewMessage('');
      
      socket.emit('send_message', {
        _id: data._id,
        recipientId: activeChat.id,
        senderId: user._id,
        senderName: user.name,
        content: data.content,
        image: data.image,
        time: data.time
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleSend(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.chatContainer}>
      <ChatList 
        conversations={filteredConversations}
        activeChatId={activeChat?.id}
        onSelectChat={handleSelectChat}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hidden={!!activeChat} // Mobile: hide list if chat is active
      />
      
      <ChatWindow 
        activeChat={activeChat}
        messages={messages}
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        onSendMessage={handleSend}
        onBack={() => setActiveChat(null)}
        isPremium={user.isPremium}
        onFileUpload={handleFileUpload}
        hidden={!activeChat} // Mobile: hide window if no chat is active
      />
    </div>
  );
};

export default Matches;
