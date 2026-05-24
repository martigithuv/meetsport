// Global functions for modal
let currentActivityImages = [];

const updateModalImage = (index) => {
    const mainImg = document.getElementById('modal-main-image');
    const counter = document.getElementById('image-counter');
    if (mainImg) mainImg.src = currentActivityImages[index];
    if (counter) counter.innerText = index + 1;
    
    // Update thumbnail borders
    const thumbs = document.querySelectorAll('.modal-thumbnail');
    thumbs.forEach((thumb, i) => {
        thumb.style.borderColor = i === index ? 'var(--color-lime)' : 'transparent';
    });
};

const selectImage = (index) => {
    updateModalImage(index);
};

document.addEventListener('DOMContentLoaded', function() {
    let activeView = 'Activitats';
    let activities = [];
    let users = [];
    let searchQuery = '';
    
    const grid = document.getElementById('explore-grid');
    const searchInput = document.getElementById('explore-search');
    const viewTitle = document.getElementById('view-title');
    const modalContainer = document.getElementById('modal-container');

    const fetchActivities = async () => {
        grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
        try {
            const response = await fetch(`http://localhost:5000/api/activities`);
            activities = await response.json();
            render();
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<p class="text-center">Error carregant activitats.</p>';
        }
    };

    const fetchUsers = async () => {
        if (!searchQuery.trim()) {
            grid.innerHTML = '<p class="text-center">Comença a escriure per buscar usuaris.</p>';
            return;
        }
        grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : null;
            const response = await fetch(`http://localhost:5000/api/users/search?query=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            users = await response.json();
            render();
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<p class="text-center">Error carregant usuaris.</p>';
        }
    };

    const render = () => {
        grid.innerHTML = '';
        if (activeView === 'Activitats') {
            const filtered = activities.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
            if (filtered.length === 0) {
                grid.innerHTML = '<p class="text-center">No s\'han trobat activitats.</p>';
                return;
            }
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const isPremium = currentUser?.isPremium || String(currentUser?.isPremium) === 'true';

            if (isPremium) {
                document.body.classList.add('user-is-premium');
            }

            filtered.forEach(act => {
                const isFav = currentUser?.favorites?.includes(act._id);

                // ── Status detection (finished, expiring, active) ──────────────────────────
                const now = new Date();
                const actDate = new Date(act.date);
                const daysLeft = Math.ceil((actDate - now) / (1000 * 60 * 60 * 24));
                const isFinished = actDate < now;
                const isExpiring = !isFinished && daysLeft >= 0 && daysLeft <= 7;
                const isActive = !isFinished && daysLeft > 7;

                // ── Urgency detection (≤7 days) ──────────────────────────
                const isUrgent = daysLeft >= 0 && daysLeft <= 7;

                const card = document.createElement('div');
                card.className = `activity-card animate-fade-in${isUrgent ? ' card-urgent' : ''}`;

                // Status indicator
                let statusIndicatorHTML = '';
                if (isFinished) {
                    statusIndicatorHTML = `
                        <div class="activity-status-indicator status-finished" title="Activitat finalizada"></div>
                    `;
                } else if (isExpiring) {
                    statusIndicatorHTML = `<div class="activity-status-indicator status-expiring" title="Expira en ${daysLeft} días"></div>`;
                } else if (isActive) {
                    statusIndicatorHTML = `<div class="activity-status-indicator status-active" title="Activitat activa"></div>`;
                }

                let urgentBadgeHTML = '';
                if (isUrgent && !isFinished) {
                    urgentBadgeHTML = `
                        <div class="urgent-banner">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Caduca aviat
                        </div>
                    `;
                }

                card.innerHTML = `
                    ${statusIndicatorHTML}
                    ${urgentBadgeHTML}
                    <div class="card-tags">
                        <span class="tag-sport">${act.sport}</span>
                        <span class="tag-slots ${act.isFull ? 'full' : ''}">${act.availableSlots}/${act.maxParticipants} places</span>
                    </div>
                    ${isPremium ? `
                        <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${act._id}" title="${isFav ? 'Treure de preferits' : 'Afegir a preferits'}" style="display:flex !important; opacity:1 !important;">
                            <svg viewBox="0 0 24 24" fill="${isFav ? 'var(--color-orange)' : 'none'}" stroke="${isFav ? 'var(--color-orange)' : 'white'}" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </button>
                    ` : ''}
                    <h3>${act.title}</h3>
                    <p style="font-size:0.8rem; color:var(--color-muted3); margin-bottom:0.5rem;">Creat per: <strong style="color:var(--color-lime);">${act.creator?.name || 'An\u00f2nim'}</strong></p>
                    <p>${act.description}</p>
                `;
                
                // Clic en la tarjeta (abrir modal)
                card.onclick = (e) => {
                    if (e.target.closest('.btn-fav')) return; // No abrir modal si pulsas la estrella
                    showActivityModal(act);
                };

                // Lógica de favoritos
                if (isPremium) {
                    const favBtn = card.querySelector('.btn-fav');
                    favBtn.onclick = async (e) => {
                        e.stopPropagation();
                        try {
                            const res = await fetch(`http://localhost:5000/api/users/favorites/${act._id}`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${currentUser.token}` }
                            });
                            const data = await res.json();
                            if (res.ok) {
                                // Actualizar localmente el usuario para reflejar el cambio
                                if (data.isFavorite) {
                                    currentUser.favorites = [...(currentUser.favorites || []), act._id];
                                } else {
                                    currentUser.favorites = currentUser.favorites.filter(id => id !== act._id);
                                }
                                localStorage.setItem('user', JSON.stringify(currentUser));
                                alert(data.isFavorite ? 'Afegit a preferits!' : 'Eliminat de preferits');
                                render(); // Re-renderizar para actualizar la estrella
                            }
                        } catch (err) {
                            console.error(err);
                            alert('Error al gestionar preferits');
                        }
                    };
                }

                grid.appendChild(card);
            });
        } else {
            if (users.length === 0) {
                grid.innerHTML = '<p class="text-center">No s\'han trobat usuaris.</p>';
                return;
            }
            users.forEach(u => {
                const card = document.createElement('div');
                card.className = 'user-card animate-fade-in';
                card.innerHTML = `
                    <div class="user-avatar">${u.avatar ? `<img src="${u.avatar}">` : '🧑‍🦱'}</div>
                    <div class="user-name">${u.name} ${u.isPremium ? '★' : ''}</div>
                    <div class="user-email">${u.email}</div>
                    <div class="user-actions">
                        <button class="btn-follow-user ${u.isFollowing ? 'following' : ''}" type="button" ${u.isFollowing ? 'disabled' : ''}>${u.isFollowing ? 'Seguint' : 'Seguir usuari'}</button>
                        <button class="btn-view-profile" type="button">Veure perfil</button>
                    </div>
                `;
                card.onclick = () => showUserModal(u);

                const viewBtn = card.querySelector('.btn-view-profile');
                if (viewBtn) {
                    viewBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showUserModal(u);
                    });
                }

                const followBtn = card.querySelector('.btn-follow-user');
                if (followBtn) {
                    followBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (followBtn.disabled || followBtn.classList.contains('following')) return;
                        await followUser(u._id, followBtn);
                    });
                }
                grid.appendChild(card);
            });
        }
    };

    const followUser = async (userId, btnEl) => {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const token = currentUser?.token;

        if (!token) {
            alert('Cal iniciar sessió');
            window.location.href = '../login/login.php';
            return;
        }

        if (btnEl) {
            btnEl.disabled = true;
            btnEl.innerText = '...';
        }

        try {
            const res = await fetch(`http://localhost:5000/api/users/follow/${userId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = data?.message ? String(data.message) : '';
                if (msg.toLowerCase().includes('ja segueixes')) {
                    if (btnEl) {
                        btnEl.classList.add('following');
                        btnEl.innerText = 'Seguint';
                        btnEl.disabled = true;
                    }
                    return;
                }
                alert(msg || 'Error al seguir usuari');
                if (btnEl) btnEl.innerText = 'Seguir usuari';
                return;
            }

            if (btnEl) {
                btnEl.classList.add('following');
                btnEl.innerText = 'Seguint';
                btnEl.disabled = true;
            }
        } catch (err) {
            console.error(err);
            alert('Error al seguir usuari');
            if (btnEl) btnEl.innerText = 'Seguir usuari';
        } finally {
            if (btnEl && !btnEl.classList.contains('following')) btnEl.disabled = false;
        }
    };

    const showActivityModal = (act) => {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;

        const hasImages = act.images && act.images.length > 0;
        const hasLocationUrl = act.location?.url;
        
        // Determinar si la actividad está finalizada
        const now = new Date();
        const actDate = new Date(act.date);
        const isFinished = actDate < now;
        
        // Store images globally
        currentActivityImages = act.images || [];
        
        let imagesHTML = '';
        if (hasImages) {
            imagesHTML = `
                <div style="margin-bottom:1.5rem;">
                    <div id="modal-images-carousel" style="position:relative; width:100%; height:200px; border-radius:16px; overflow:hidden; background:rgba(0,0,0,0.3);">
                        <img id="modal-main-image" src="${act.images[0]}" style="width:100%; height:100%; object-fit:cover; display:block;">
                        ${act.images.length > 1 ? `
                            <button id="prev-image" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.6); color:white; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;">❮</button>
                            <button id="next-image" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.6); color:white; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;">❯</button>
                            <div style="position:absolute; bottom:8px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.6); color:white; padding:0.25rem 0.7rem; border-radius:20px; font-size:0.7rem;">
                                <span id="image-counter">1</span>/${act.images.length}
                            </div>
                        ` : ''}
                    </div>
                    ${act.images.length > 1 ? `
                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(54px, 1fr)); gap:0.4rem; margin-top:0.6rem;">
                            ${act.images.map((img, idx) => `
                                <img src="${img}" class="modal-thumbnail" style="width:100%; height:54px; object-fit:cover; border-radius:6px; cursor:pointer; border:2px solid ${idx === 0 ? 'var(--color-lime)' : 'transparent'}; transition:all 0.2s;" onclick="selectImage(${idx})">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        let locationHTML = '';
        if (hasLocationUrl) {
            locationHTML = `<a href="${act.location.url}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 1rem; margin-bottom:1rem; border-radius:8px; font-size:0.8rem; font-weight:700; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:var(--color-muted3); text-decoration:none; transition:all 0.2s;" onmouseover="this.style.borderColor='rgba(200,245,66,0.4)'; this.style.color='var(--color-lime)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.12)'; this.style.color='var(--color-muted3)'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Veure ubicació
            </a>`;
        }
        
        modalContainer.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                ${imagesHTML}
                <div class="tag-sport" style="display:inline-block; margin-bottom:1rem;">${act.sport}</div>
                <h2 class="font-display" style="font-size:2.5rem; margin-bottom:0.5rem;">${act.title}</h2>
                <p style="font-size:0.9rem; color:var(--color-muted3); margin-bottom:1.5rem;">Creat per: <strong style="color:var(--color-lime);">${act.creator?.name || 'Anònim'}</strong></p>
                <p style="color:var(--color-muted); margin-bottom:2rem;">${act.description}</p>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2rem;">
                    <div style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:16px;">
                        <span style="font-size:0.6rem; text-transform:uppercase; color:var(--color-muted3);">Data</span>
                        <div style="font-weight:700;">${new Date(act.date).toLocaleDateString()}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:16px;">
                        <span style="font-size:0.6rem; text-transform:uppercase; color:var(--color-muted3);">Lloc</span>
                        <div style="font-weight:700;">${act.location?.address || 'No especificat'}</div>
                    </div>
                </div>

                ${locationHTML}
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${(() => {
                        const isEnrolled = act.participants?.some(p => (p._id || p) === currentUser._id);
                        if (isFinished || act.status === 'FINALITZADA') return `<button class="btn-primary" style="flex:1; min-width:150px; justify-content:center; padding:1.2rem; opacity:0.5; cursor:not-allowed;" disabled>Activitat Finalitzada</button>`;
                        if (isEnrolled) return `<button class="btn-primary" style="flex:1; min-width:150px; justify-content:center; padding:1.2rem; background:var(--color-muted3); cursor:default;" disabled>Ja estàs inscrit</button>`;
                        if (act.isFull) return `<button class="btn-primary" style="flex:1; min-width:150px; justify-content:center; padding:1.2rem; opacity:0.5; cursor:not-allowed;" disabled>Activitat Plena</button>`;
                        return `<button class="btn-primary" style="flex:1; min-width:150px; justify-content:center; padding:1.2rem;" id="join-btn">Inscriure'm</button>`;
                    })()}
                    <button class="btn-primary" style="flex:1; min-width:150px; justify-content:center; padding:1.2rem; background:rgba(255,255,255,0.1); color:white;" id="view-participants-btn">Veure participants</button>
                </div>
            </div>
        `;
        modalContainer.classList.remove('hidden');
        
        // Setup image carousel
        if (hasImages && act.images.length > 1) {
            let currentImageIndex = 0;
            const nextBtn = modalContainer.querySelector('#next-image');
            const prevBtn = modalContainer.querySelector('#prev-image');
            
            if (nextBtn) {
                nextBtn.onclick = () => {
                    currentImageIndex = (currentImageIndex + 1) % act.images.length;
                    updateModalImage(currentImageIndex);
                };
            }
            if (prevBtn) {
                prevBtn.onclick = () => {
                    currentImageIndex = (currentImageIndex - 1 + act.images.length) % act.images.length;
                    updateModalImage(currentImageIndex);
                };
            }
        }
        
        modalContainer.querySelector('.close-modal').onclick = () => modalContainer.classList.add('hidden');
        
        // Handle join button
        const joinBtn = document.getElementById('join-btn');
        if (joinBtn) {
            joinBtn.onclick = () => handleJoin(act._id);
        }

        // Handle view participants button
        const viewParticipantsBtn = document.getElementById('view-participants-btn');
        if (viewParticipantsBtn) {
            viewParticipantsBtn.onclick = () => showParticipantsModal(act._id);
        }
    };

    const showParticipantsModal = async (activityId) => {
        // Remove existing if any
        const existing = document.getElementById('participants-modal');
        if (existing) existing.remove();

        try {
            const res = await fetch(`http://localhost:5000/api/activities/${activityId}/participants`);
            const participants = await res.json();
            
            const participantsHTML = participants.length > 0 ? participants.map(p => {
                const avatar = p.profileDetails?.avatar || '../assets/default-avatar.png';
                const badgesHTML = (p.badges || []).slice(0, 3).map(ub => `<span title="${ub.badge?.name}">${ub.badge?.icon || '🏅'}</span>`).join('');
                
                return `
                    <div style="display:flex; align-items:center; gap:1rem; background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px; margin-bottom:0.8rem;">
                        <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; background:var(--color-muted2); border: 2px solid var(--color-orange);">
                            <img src="${avatar}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='../assets/default-avatar.png'">
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:white;">${p.name}</div>
                            <div style="font-size:0.8rem; color:var(--color-muted3);">${p.total_points || 0} pts <span style="margin-left:0.5rem; display:inline-flex; gap:0.3rem;">${badgesHTML}</span></div>
                        </div>
                    </div>
                `;
            }).join('') : '<p style="text-align:center; color:var(--color-muted3);">Encara no hi ha participants.</p>';

            const modalContent = `
                <div class="modal-content animate-fade-in" style="max-width:380px; position:relative; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                    <button class="close-modal" style="position:absolute; top:1rem; right:1rem; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                    <h2 class="font-display" style="margin-bottom:1.5rem; font-size:1.6rem; color:white;">Participants</h2>
                    <div style="max-height:350px; overflow-y:auto; padding-right:0.5rem;" class="custom-scrollbar">
                        ${participantsHTML}
                    </div>
                </div>
            `;
            
            const participantsOverlay = document.createElement('div');
            participantsOverlay.className = 'modal-container';
            participantsOverlay.id = 'participants-modal';
            participantsOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
                backdrop-filter: blur(5px);
            `;
            participantsOverlay.innerHTML = modalContent;
            document.body.appendChild(participantsOverlay);
            
            participantsOverlay.querySelector('.close-modal').onclick = (e) => {
                e.stopPropagation();
                participantsOverlay.remove();
            };

            // Close on background click
            participantsOverlay.onclick = (e) => {
                if (e.target === participantsOverlay) participantsOverlay.remove();
            };
            
        } catch (err) {
            console.error(err);
            alert('Error carregant participants');
        }
    };

    const handleJoin = async (id) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Cal iniciar sessió');
            window.location.href = '../login/login.php';
            return;
        }
        const token = JSON.parse(userStr).token;
        try {
            const response = await fetch(`http://localhost:5000/api/enrollments/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert('T\'has apuntat correctament!');
                modalContainer.classList.add('hidden');
                fetchActivities();
            } else {
                alert(data.message || 'Error en apuntar-te');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const showUserModal = (u) => {
        // Registrar visita (solo cuenta si el perfil destino es Premium; lo gestiona el backend)
        registerProfileView(u._id);

        modalContainer.innerHTML = `
            <div class="modal-content text-center" style="text-align:center;">
                <button class="close-modal">&times;</button>
                <div class="user-avatar" style="width:100px; height:100px; margin-bottom:1.5rem;">${u.avatar ? `<img src="${u.avatar}">` : '🧑‍🦱'}</div>
                <h2 class="font-display" style="font-size:2rem; margin-bottom:0.5rem;">${u.name} ${u.isPremium ? '💎' : ''}</h2>
                <p style="color:var(--color-muted3); margin-bottom:2rem;">${u.email}</p>
                <div style="display:flex; justify-content:center; gap:2rem; margin-bottom:2rem;">
                    <div><div style="font-size:1.5rem; font-weight:700;">${u.followersCount ?? (u.followers?.length || 0)}</div><div style="font-size:0.6rem; color:var(--color-muted3);">FOLLOWERS</div></div>
                    <div><div style="font-size:1.5rem; font-weight:700; color:var(--color-orange);">${u.isPremium ? 'YES' : 'NO'}</div><div style="font-size:0.6rem; color:var(--color-muted3);">PREMIUM</div></div>
                </div>
                <a href="../matches/matches.php?userId=${u._id}&userName=${u.name}" class="btn-primary" style="width:100%; justify-content:center; padding:1.2rem;">Enviar Missatge</a>
            </div>
        `;
        modalContainer.classList.remove('hidden');
        modalContainer.querySelector('.close-modal').onclick = () => modalContainer.classList.add('hidden');
    };

    const registerProfileView = async (targetUserId) => {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const token = currentUser?.token;
        if (!token || !targetUserId) return;

        try {
            await fetch(`http://localhost:5000/api/users/view/${targetUserId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error(err);
        }
    };

    // View toggling
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeView = btn.dataset.view;
            viewTitle.innerText = activeView.toLowerCase();
            searchInput.placeholder = activeView === 'Activitats' ? 'Busca per títol...' : 'Busca per nom...';
            if (activeView === 'Activitats') fetchActivities();
            else render();
        };
    });

    // Search handling
    let debounceTimer;
    searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (activeView === 'Usuaris') fetchUsers();
            else render();
        }, 300);
    };

    fetchActivities();
});
