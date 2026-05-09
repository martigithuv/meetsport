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
                const card = document.createElement('div');
                card.className = 'activity-card animate-fade-in';
                card.innerHTML = `
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
                    <button class="btn-view-profile">Veure perfil</button>
                `;
                card.onclick = () => showUserModal(u);
                grid.appendChild(card);
            });
        }
    };

    const showActivityModal = (act) => {
        modalContainer.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <div class="tag-sport" style="display:inline-block; margin-bottom:1rem;">${act.sport}</div>
                <h2 class="font-display" style="font-size:2.5rem; margin-bottom:1rem;">${act.title}</h2>
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

                <button class="btn-primary" style="width:100%; justify-content:center; padding:1.2rem;" id="join-btn">
                    ${act.isFull ? 'Activitat Plena' : 'Apuntar-me'}
                </button>
            </div>
        `;
        modalContainer.classList.remove('hidden');
        
        modalContainer.querySelector('.close-modal').onclick = () => modalContainer.classList.add('hidden');
        document.getElementById('join-btn').onclick = () => handleJoin(act._id);
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
            const response = await fetch(`http://localhost:5000/api/activities/join/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
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
        modalContainer.innerHTML = `
            <div class="modal-content text-center" style="text-align:center;">
                <button class="close-modal">&times;</button>
                <div class="user-avatar" style="width:100px; height:100px; margin-bottom:1.5rem;">${u.avatar ? `<img src="${u.avatar}">` : '🧑‍🦱'}</div>
                <h2 class="font-display" style="font-size:2rem; margin-bottom:0.5rem;">${u.name} ${u.isPremium ? '💎' : ''}</h2>
                <p style="color:var(--color-muted3); margin-bottom:2rem;">${u.email}</p>
                <div style="display:flex; justify-content:center; gap:2rem; margin-bottom:2rem;">
                    <div><div style="font-size:1.5rem; font-weight:700;">${u.followers?.length || 0}</div><div style="font-size:0.6rem; color:var(--color-muted3);">FOLLOWERS</div></div>
                    <div><div style="font-size:1.5rem; font-weight:700; color:var(--color-orange);">${u.isPremium ? 'YES' : 'NO'}</div><div style="font-size:0.6rem; color:var(--color-muted3);">PREMIUM</div></div>
                </div>
                <a href="../matches/matches.php?userId=${u._id}&userName=${u.name}" class="btn-primary" style="width:100%; justify-content:center; padding:1.2rem;">Enviar Missatge</a>
            </div>
        `;
        modalContainer.classList.remove('hidden');
        modalContainer.querySelector('.close-modal').onclick = () => modalContainer.classList.add('hidden');
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
