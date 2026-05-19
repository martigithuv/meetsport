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
            
            const linkify = (text) => {
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                return text.replace(urlRegex, function(url) {
                    return '<a href="' + url + '" style="color:var(--color-lime); text-decoration:underline;" target="_blank">' + url + '</a>';
                });
            };
            
            const div = document.createElement('div');
            div.className = `message ${isMe ? 'me' : 'other'}`;
            
            // Check if it's the admin notification for rating
            const ratingMatch = messageText.match(/sha tancat la activitat (.*), es el moment de fer una valoracio \[(.*)\]/);
            
            if (ratingMatch) {
                const activityTitle = ratingMatch[1];
                const activityId = ratingMatch[2];
                div.innerHTML = `
                    <div class="message-content" style="background: linear-gradient(135deg, rgba(255, 107, 43, 0.15), rgba(20, 20, 25, 0.95)) !important; border: 1.5px solid var(--color-orange) !important; padding: 1.25rem; border-radius: 20px; box-shadow: 0 8px 32px rgba(255, 107, 43, 0.15); max-width: 340px;">
                        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.6rem;">
                            <span style="font-size:1.4rem;">🏆</span>
                            <strong style="color:white; font-size:0.95rem; font-family:var(--font-display);">Activitat Finalitzada</strong>
                        </div>
                        <div style="font-size:0.8rem; color:var(--color-muted3); line-height:1.4; margin-bottom:1rem;">
                            S'ha tancat l'activitat <span style="color:var(--color-lime); font-weight:700;">${activityTitle}</span>. És el moment de valorar el creador i els teus companys!
                        </div>
                        <button class="btn-rate-activity-msg" data-activity-id="${activityId}" style="background:var(--color-orange); color:white; border:none; padding:0.75rem 1rem; border-radius:12px; font-weight:800; font-size:0.75rem; cursor:pointer; width:100%; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:0.4rem; box-shadow: 0 4px 15px rgba(255, 107, 43, 0.3);">
                            ⭐ VALORAR ARA
                        </button>
                    </div>
                    <div class="message-time">${timeStr}</div>
                `;
            } else {
                div.innerHTML = `
                    <div class="message-content">
                        ${msg.image ? `<img src="${msg.image}" class="message-img" onclick="window.open('${msg.image}', '_blank')">` : ''}
                        <div>${linkify(messageText) || ''}</div>
                    </div>
                    <div class="message-time">${timeStr}</div>
                `;
            }
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

    // Delegated click handler for rating buttons inside chat
    document.addEventListener('click', async (e) => {
        const rateBtn = e.target.closest('.btn-rate-activity-msg');
        if (rateBtn) {
            const activityId = rateBtn.getAttribute('data-activity-id');
            console.log('[DEBUG] Open rating modal from chat for activity:', activityId);
            window.showRatingModal(activityId);
        }
    });

    // ── GLOBAL FUNCTIONS (MODALS) ────────────────────────────────────────────────
    window.showRatingModal = async function(activityId) {
        const API_BASE = 'http://localhost:5000/api';

        try {
            console.log('[DEBUG] showRatingModal started for activityId:', activityId);
            const [res, ratingsRes] = await Promise.all([
                fetch(`${API_BASE}/activities/${activityId}/participants`),
                fetch(`${API_BASE}/ratings/activity/${activityId}`)
            ]);
            
            if (!res.ok) throw new Error('Error fetching participants: ' + res.statusText);
            if (!ratingsRes.ok) throw new Error('Error fetching ratings: ' + ratingsRes.statusText);

            const participants = await res.json();
            const ratings = await ratingsRes.json();
            
            console.log('[DEBUG] showRatingModal fetched:', { participants, ratings });

            // Filter and format safely
            const myRatings = Array.isArray(ratings) ? ratings.filter(r => {
                const raterId = r && r.rater ? (r.rater._id || r.rater) : null;
                return raterId && String(raterId) === String(user._id);
            }) : [];

            const ratedIds = myRatings.map(r => {
                const recId = r && r.recipient ? (r.recipient._id || r.recipient) : null;
                return recId ? String(recId) : '';
            }).filter(Boolean);

            console.log('[DEBUG] Already rated IDs:', ratedIds);

            const toRate = Array.isArray(participants) ? participants.filter(p => {
                if (!p || !p._id) return false;
                const isSelf = String(p._id) === String(user._id);
                const isAlreadyRated = ratedIds.includes(String(p._id));
                return !isSelf && !isAlreadyRated;
            }) : [];

            console.log('[DEBUG] To rate list:', toRate);

            if (toRate.length === 0) { 
                alert('No hi ha altres participants pendents de valorar.'); 
                return; 
            }

            const overlay = document.createElement('div');
            overlay.id = 'rating-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(10px);';

            overlay.innerHTML = `
                <div style="background:#111; padding:2rem; border-radius:24px; width:90%; max-width:500px; max-height:80vh; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); position:relative;">
                    <h2 style="margin-bottom:1.5rem; color:white; font-family:inherit;">Valorar Participants</h2>
                    <div id="participants-list">
                        ${toRate.map((p, index) => {
                            const avatarUrl = p.profileDetails?.avatar || '../assets/default-avatar.png';
                            return `
                                <div class="rating-item" id="rating-step-${index}" data-recipient-id="${p._id}" style="display: ${index === 0 ? 'block' : 'none'}; background:rgba(255,255,255,0.05); padding:1.2rem; border-radius:20px; margin-bottom:1rem; border:1px solid rgba(255,255,255,0.05);">
                                    <div style="text-align:center; color:var(--color-muted3); font-size:0.75rem; margin-bottom:1rem;">Participant ${index + 1} de ${toRate.length}</div>
                                    <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.2rem;">
                                        <div style="width:45px; height:45px; border-radius:50%; overflow:hidden; border:2px solid var(--color-orange);">
                                            <img src="${avatarUrl}" style="width:100%; height:100%; object-fit:cover;">
                                        </div>
                                        <strong style="color:white; font-size:1rem;">${p.name || 'Companys'}</strong>
                                    </div>
                                    <div class="stars" style="font-size:1.8rem; cursor:pointer; color:#333; display:flex; gap:0.6rem; margin-bottom:1.2rem; justify-content:center;">
                                        <span data-val="1">★</span><span data-val="2">★</span><span data-val="3">★</span><span data-val="4">★</span><span data-val="5">★</span>
                                    </div>
                                    <textarea placeholder="Explica com ha anat..." style="width:100%; background:#000; border:1px solid #222; color:white; padding:1rem; border-radius:12px; font-size:0.85rem; outline:none;"></textarea>
                                    <button class="send-rating" style="width:100%; margin-top:1rem; background:var(--color-lime); color:black; border:none; padding:0.9rem; border-radius:12px; font-weight:800; cursor:pointer; transition:all 0.2s;">ENVIAR (+0 PTS)</button>
                                </div>
                            `;
                        }).join('')}
                        
                        <div id="rating-done" style="display:none; text-align:center; padding:2rem 0;">
                            <div style="font-size:3rem; margin-bottom:1rem;">🎉</div>
                            <h3 style="color:white; margin-bottom:1rem;">Tot valorat!</h3>
                            <p style="color:var(--color-muted3); font-size:0.85rem;">Has repartit els punts correctament. La teva feina aquí ha acabat.</p>
                        </div>
                    </div>
                    <button onclick="window.closeRatingModal();" style="width:100%; margin-top:1.5rem; background:none; border:1px solid #222; color:#555; padding:0.8rem; border-radius:12px; font-weight:700; cursor:pointer;">TANCAR</button>
                </div>
            `;

            document.body.appendChild(overlay);

            let currentStep = 0;

            overlay.querySelectorAll('.rating-item').forEach((item, index) => {
                let selected = 0;
                const stars = item.querySelectorAll('.stars span');
                const btn = item.querySelector('.send-rating');

                stars.forEach(s => {
                    s.onclick = () => {
                        selected = parseInt(s.dataset.val);
                        stars.forEach(star => {
                            star.style.color = parseInt(star.dataset.val) <= selected ? 'var(--color-orange)' : '#333';
                            star.style.textShadow = parseInt(star.dataset.val) <= selected ? '0 0 10px rgba(255,165,0,0.5)' : 'none';
                        });
                        btn.innerText = `ENVIAR (+${selected * 100} PTS)`;
                        btn.style.background = 'var(--color-orange)';
                        btn.style.color = 'white';
                    };
                });

                btn.onclick = async () => {
                    if (selected === 0) { alert('Si us plau, selecciona una puntuació (estrelles)'); return; }
                    const comment = item.querySelector('textarea').value;
                    btn.disabled = true;
                    btn.innerText = 'ENVIANT...';
                    try {
                        const r = await fetch(`${API_BASE}/ratings`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                            body: JSON.stringify({ activityId, recipientId: item.dataset.recipientId, ratingValue: selected, comment })
                        });
                        if (r.ok) {
                            // Pasar al siguiente usuario
                            item.style.display = 'none';
                            currentStep++;
                            if (currentStep < toRate.length) {
                                document.getElementById(`rating-step-${currentStep}`).style.display = 'block';
                            } else {
                                document.getElementById('rating-done').style.display = 'block';
                            }
                        } else {
                            const errData = await r.json();
                            alert(errData.message || 'Error al enviar valoración');
                            btn.disabled = false;
                            btn.innerText = `ENVIAR (+${selected * 100} PTS)`;
                        }
                    } catch (err) { 
                        alert('Error de connexió'); 
                        btn.disabled = false;
                    }
                };
            });

        } catch (err) {
            console.error('[DEBUG] Error loading rating modal:', err);
            alert('Error carregant participants: ' + err.message);
        }
    };

    window.closeRatingModal = async function() {
        const overlay = document.getElementById('rating-overlay');
        if (overlay) overlay.remove();
        if (activeChat) {
            await fetchHistory(activeChat.id);
        }
    };

    fetchConversations();
});
