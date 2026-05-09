document.addEventListener('DOMContentLoaded', function() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../login/login.php';
        return;
    }
    const user = JSON.parse(userStr);
    
    const matchesMain = document.querySelector('.matches-main');
    const premiumTag = document.getElementById('premium-tag');
    if (user.isPremium || String(user.isPremium) === 'true') {
        matchesMain.classList.add('premium-mode');
        document.body.classList.add('user-is-premium');
        premiumTag.classList.remove('hidden');
    }

    let activeChat = null;
    let messages = [];
    let conversations = [];
    let socket = io("http://localhost:5000");

    const convList = document.getElementById('conversations-list');
    const chatArea = document.getElementById('chat-area');
    const userSearch = document.getElementById('user-search');

    socket.on('connect', () => {
        socket.emit('join_user_room', user._id);
    });

        socket.on('receive_message', (data) => {
        // Si el mensaje es para el chat activo (ya sea que lo envié yo o el otro)
        if (activeChat && (activeChat.id === data.senderId || activeChat.id === data.recipientId)) {
            // Evitar duplicados si el mensaje ya está en la lista (por el push del handleSend)
            const exists = messages.find(m => m.id === data.id || (m.content === data.content && m.time === data.time && m.senderId === data.senderId));
            if (!exists) {
                const newMsg = { 
                    ...data, 
                    isMe: data.senderId === user._id,
                    content: data.content || data.text // Normalizar
                };
                messages.push(newMsg);
                renderMessages();
            }
        }
        // Siempre actualizar la lista de conversaciones para ver el último mensaje
        fetchConversations();
    });

    const fetchConversations = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/messages/conversations", {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            conversations = await response.json();
            renderConversations();
        } catch (err) { console.error(err); }
    };

    const renderConversations = (filtered = null) => {
        const list = filtered || conversations;
        convList.innerHTML = '';
        list.forEach(c => {
            const div = document.createElement('div');
            div.className = `conv-item ${activeChat?.id === c.id ? 'active' : ''}`;
            div.innerHTML = `
                <div class="conv-avatar">${c.name[0]}</div>
                <div class="conv-info">
                    <div class="conv-name">${c.name}</div>
                    <div class="conv-last-msg">${c.lastMessage || 'Conversa nova'}</div>
                </div>
                ${c.unread ? '<div style="width:8px; height:8px; background:var(--color-orange); border-radius:50%;"></div>' : ''}
            `;
            div.onclick = () => selectChat(c);
            convList.appendChild(div);
        });
    };

    const selectChat = async (c) => {
        activeChat = c;
        renderConversations();
        renderChatHeader(c);
        await fetchHistory(c.id);
    };

    const renderChatHeader = (c) => {
        chatArea.innerHTML = `
            <div class="chat-header">
                <div class="conv-avatar">${c.name[0]}</div>
                <div>
                    <div class="conv-name" style="font-size:1.1rem;">${c.name}</div>
                    <div style="font-size:0.65rem; color:var(--color-lime);">Online</div>
                </div>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-area">
                <div class="input-box">
                    ${(user.isPremium || String(user.isPremium) === 'true') ? `
                        <button class="btn-attach" id="attach-btn" title="Adjuntar imatge" style="display:flex !important;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:20px; height:20px;">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                            </svg>
                        </button>
                    ` : ''}
                    <input type="text" id="chat-input" placeholder="Escriu un missatge..." style="background: rgba(255,255,255,0.05) !important; color: #ffffff !important; flex: 1; border: none; outline: none; padding: 12px; font-size: 16px; border-radius: 10px; pointer-events: auto !important; position: relative; z-index: 10;">
                    <button class="btn-send" id="send-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:20px; height:20px;">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if (input) {
                input.focus();
                input.onkeydown = (e) => e.key === 'Enter' && handleSend();
            }
            const sendBtn = document.getElementById('send-btn');
            if (sendBtn) sendBtn.onclick = handleSend;
        }, 100);

        if (user.isPremium || String(user.isPremium) === 'true') {
            const attachBtn = document.getElementById('attach-btn');
            const fileInput = document.getElementById('chat-file-input');
            attachBtn.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        handleSend(event.target.result);
                        fileInput.value = ''; // Reset input
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
    };

    const fetchHistory = async (otherId) => {
        const msgContainer = document.getElementById('chat-messages');
        msgContainer.innerHTML = '<p class="text-center">Carregant...</p>';
        try {
            const response = await fetch(`http://localhost:5000/api/messages/${otherId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            messages = await response.json();
            renderMessages();
        } catch (err) { console.error(err); }
    };

    const renderMessages = () => {
        const msgContainer = document.getElementById('chat-messages');
        if (!msgContainer) return;
        msgContainer.innerHTML = '';
        messages.forEach(msg => {
            const date = msg.time ? new Date(msg.time) : new Date();
            const timeStr = isNaN(date.getTime()) ? new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            
            const messageText = msg.content || msg.text || '';
            const isMe = msg.isMe;
            
            const div = document.createElement('div');
            div.className = `message ${isMe ? 'me' : 'other'}`;
            div.innerHTML = `
                <div class="message-content">
                    ${msg.image ? `<img src="${msg.image}" class="message-img" onclick="window.open('${msg.image}', '_blank')">` : ''}
                    <div>${messageText || ''}</div>
                </div>
                <div class="message-time">${timeStr}</div>
            `;
            msgContainer.appendChild(div);
        });
        msgContainer.scrollTop = msgContainer.scrollHeight;
    };

    const handleSend = async (imgData = null) => {
        const input = document.getElementById('chat-input');
        const content = input ? input.value.trim() : '';
        
        const actualImage = typeof imgData === 'string' ? imgData : null;

        if (!content && !actualImage) return;
        if (!activeChat) return;

        try {
            const response = await fetch(`http://localhost:5000/api/messages/send/${activeChat.id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}` 
                },
                body: JSON.stringify({ content, image: actualImage })
            });
            const data = await response.json();
            
            if (input) input.value = '';
            
            // El mensaje se añadirá a la lista a través del evento 'receive_message' del socket
            // que emitimos a continuación, así evitamos duplicados y confirmamos que pasó por el servidor.

            socket.emit('send_message', {
                id: data.id,
                recipientId: activeChat.id,
                senderId: user._id,
                senderName: user.name,
                content: data.content,
                image: data.image,
                time: data.time
            });
        } catch (err) { console.error(err); }
    };

    userSearch.oninput = async (e) => {
        const q = e.target.value.trim();
        if (!q) {
            renderConversations();
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/users/search?query=${q}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const results = await response.json();
            renderConversations(results.map(r => ({
                id: r._id,
                name: r.name,
                lastMessage: r.email,
                isSearch: true
            })));
        } catch (err) { console.error(err); }
    };

    // Auto-select chat from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const userName = urlParams.get('userName');
    if (userId && userName) {
        selectChat({ id: userId, name: userName });
    }

    fetchConversations();
});
