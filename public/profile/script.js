// ── GLOBAL ERROR HANDLER ───────────────────────────────────────────────────
window.onerror = function(msg, url, line, col, error) {
    console.log(`[JS ERROR] ${msg} at ${url}:${line}:${col}`, error);
    return false;
};

document.addEventListener('DOMContentLoaded', function () {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../login/login.php';
        return;
    }
    let user = JSON.parse(userStr);
    const headers = { 'Authorization': `Bearer ${user.token}` };
    const API_BASE = 'http://localhost:5000/api';

    // Elementos del DOM (IDs sincronizados con profile.php)
    const profileName = document.getElementById('profile-name');
    const vipBadge = document.getElementById('vip-badge');
    const avatarCard = document.getElementById('avatar-card');
    const avatarInput = document.getElementById('avatar-input');
    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    const tabPane = document.getElementById('tab-pane');
    
    // Stats
    const countPoints = document.getElementById('count-points');
    const countFollowers = document.getElementById('count-followers');
    const countFollowing = document.getElementById('count-following');
    const countViews = document.getElementById('count-views');
    const statViews = document.getElementById('stat-views');
    
    // Tabs
    const tabFavorits = document.getElementById('tab-favorits');
    const tabVisites = document.getElementById('tab-visites');

    let statsData = null;
    let myActivities = [];
    let myEnrollments = [];
    let myFavorites = [];
    let myRatingsReceived = [];
    let activeTab = 'dades';

    // ── DATA FETCHING ────────────────────────────────────────────────────────
    async function fetchData() {
        if (tabPane) tabPane.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
        
        try {
            const [statsRes, activitiesRes, enrollmentsRes, favoritesRes, ratingsRes] = await Promise.all([
                fetch(`${API_BASE}/users/stats`, { headers }),
                fetch(`${API_BASE}/activities/my`, { headers }),
                fetch(`${API_BASE}/enrollments/my`, { headers }),
                fetch(`${API_BASE}/activities/favorites`, { headers }).catch(() => ({ json: () => [] })),
                fetch(`${API_BASE}/ratings/user/${user._id}`, { headers }).catch(() => ({ json: () => ({ ratings: [] }) }))
            ]);

            if (statsRes.ok) statsData = await statsRes.json();
            if (activitiesRes.ok) myActivities = await activitiesRes.json();
            if (enrollmentsRes.ok) myEnrollments = await enrollmentsRes.json();
            
            try {
                myFavorites = Array.isArray(favoritesRes) ? favoritesRes : await favoritesRes.json();
            } catch(e) { myFavorites = []; }

            try {
                const rData = await ratingsRes.json();
                myRatingsReceived = rData.ratings || [];
            } catch(e) { myRatingsReceived = []; }

            console.log('[DEBUG] Data loaded:', { 
                stats: statsData,
                activities: myActivities.length, 
                enrollments: myEnrollments.length, 
                favorites: myFavorites.length 
            });

        } catch (err) {
            console.error('[DEBUG] Fetch error:', err);
        }
    }

    // ── TAB RENDERING ────────────────────────────────────────────────────────
    function renderTab(tabName = activeTab) {
        if (!tabPane) return;
        tabPane.innerHTML = '';

        if (tabName === 'dades') {
            tabPane.innerHTML = `
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:2rem; align-items:start;">
                    <div class="settings-card animate-fade-in" style="background:#111; padding:2rem; border-radius:24px; border:1px solid rgba(255,255,255,0.1);">
                        <h2 class="font-display" style="font-size:1.5rem; margin-bottom:1.5rem;">El meu Perfil</h2>
                        <form id="profile-form">
                            <div style="display:flex; flex-direction:column; gap:1.2rem;">
                                <div class="form-group">
                                    <label>Nom d'usuari</label>
                                    <input type="text" name="name" value="${statsData?.name || user.name}" required>
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" value="${statsData?.email || user.email}" disabled style="opacity:0.6;">
                                </div>
                                <div class="form-group">
                                    <label>Biografia</label>
                                    <textarea name="bio" rows="4" placeholder="Explica alguna cosa sobre tu...">${statsData?.profileDetails?.bio || ''}</textarea>
                                </div>
                            </div>
                            <button type="submit" class="btn-save" style="margin-top:1.5rem; background:var(--color-lime); color:black; border:none; padding:0.8rem 1.5rem; border-radius:12px; font-weight:800; cursor:pointer; font-size:0.9rem;">Guardar Canvis</button>
                        </form>
                    </div>

                    <div class="settings-card animate-fade-in" style="background:#111; padding:2rem; border-radius:24px; border:1px solid rgba(255,255,255,0.1);">
                        <h2 class="font-display" style="font-size:1.5rem; margin-bottom:1.5rem;">Canviar Contrasenya</h2>
                        <form id="password-form">
                            <div style="display:flex; flex-direction:column; gap:1.2rem;">
                                <div class="form-group">
                                    <label>Nova contrasenya</label>
                                    <input type="password" name="newPassword" placeholder="******" required minlength="6">
                                </div>
                                <div class="form-group">
                                    <label>Repetir contrasenya</label>
                                    <input type="password" name="confirmPassword" placeholder="******" required minlength="6">
                                </div>
                            </div>
                            <button type="submit" class="btn-save" style="margin-top:1.5rem; background:var(--color-orange); color:white; border:none; padding:0.8rem 1.5rem; border-radius:12px; font-weight:800; cursor:pointer; font-size:0.9rem;">Desar nova contrassenya</button>
                        </form>
                    </div>
                </div>
            `;
            const form = document.getElementById('profile-form');
            if (form) form.onsubmit = handleProfileUpdate;

            const pwForm = document.getElementById('password-form');
            if (pwForm) pwForm.onsubmit = async (e) => {
                e.preventDefault();
                const btn = pwForm.querySelector('button[type="submit"]');
                const fd = new FormData(pwForm);
                const newPassword = fd.get('newPassword');
                const confirmPassword = fd.get('confirmPassword');

                if (newPassword !== confirmPassword) {
                    alert('Les contrasenyes no coincideixen');
                    return;
                }

                btn.disabled = true;
                btn.innerText = 'Desant...';

                try {
                    const res = await fetch(`${API_BASE}/users/change-password`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                        body: JSON.stringify({ newPassword, confirmPassword })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        alert('Contrasenya canviada correctament.');
                        pwForm.reset();
                    } else {
                        alert(data.message || 'Error canviant la contrasenya');
                    }
                } catch (err) {
                    alert('Error de connexió');
                }
                btn.disabled = false;
                btn.innerText = 'Desar nova contrassenya';
            };

        } else if (tabName === 'activitats') {
            const grid = document.createElement('div');
            grid.className = 'visit-grid animate-fade-in';
            
            if (!myActivities || myActivities.length === 0) {
                grid.innerHTML = '<p class="text-center" style="grid-column:1/-1;">No has creat cap activitat encara.</p>';
            } else {
                myActivities.forEach(act => {
                    const isFinalized = act.status === 'FINALITZADA';
                    grid.innerHTML += `
                        <div class="activity-card" style="background:var(--color-dark2); padding:1.5rem; border-radius:24px; border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:0.5rem;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <span class="tag-sport">${act.sport}</span>
                                <span style="color:${isFinalized ? 'var(--color-orange)' : 'var(--color-lime)'}; font-size:0.65rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">${act.status}</span>
                            </div>
                            <h3 style="margin:0.5rem 0; font-size:1.1rem;">${act.title}</h3>
                            <div style="font-size:0.75rem; color:var(--color-lime); font-weight:700;">👥 ${act.participantsCount || 0} / ${act.maxParticipants} apuntats</div>
                            <p style="font-size:0.75rem; color:var(--color-muted3); flex:1; margin-bottom:1rem; margin-top:0.2rem;">${act.description}</p>
                            
                            <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                ${!isFinalized ? `
                                    <button class="btn-finalize-activity" data-id="${act._id}" style="background:var(--color-lime); color:black; border:none; padding:0.6rem; border-radius:10px; font-weight:800; font-size:0.75rem; cursor:pointer; width:100%;">FINALITZAR</button>
                                ` : `
                                    <button class="btn-rate-participants" data-id="${act._id}" style="background:var(--color-orange); color:white; border:none; padding:0.6rem; border-radius:10px; font-weight:800; font-size:0.75rem; cursor:pointer; width:100%;">VALORAR PARTICIPANTS</button>
                                `}
                                <button class="btn-delete" data-id="${act._id}" style="background:rgba(255,0,0,0.1); color:#ff4444; border:none; padding:0.5rem; border-radius:10px; font-weight:700; font-size:0.65rem; cursor:pointer; width:100%;">ELIMINAR</button>
                            </div>
                        </div>
                    `;
                });
            }
            tabPane.appendChild(grid);

        } else if (tabName === 'inscripcions') {
            const grid = document.createElement('div');
            grid.className = 'visit-grid animate-fade-in';

            if (!myEnrollments || myEnrollments.length === 0) {
                grid.innerHTML = '<p class="text-center" style="grid-column:1/-1;">No estàs inscrit a cap activitat.</p>';
            } else {
                myEnrollments.forEach(act => {
                    const isFinished = new Date(act.date) < new Date() || act.status === 'FINALITZADA';
                    grid.innerHTML += `
                        <div class="activity-card" style="background:var(--color-dark2); padding:1.5rem; border-radius:24px; border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:0.5rem;">
                            <div class="inscription-sport-tag" style="background:rgba(255,255,255,0.05); width:fit-content; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.6rem; font-weight:700;">${act.sport}</div>
                            <h3 style="margin:0.5rem 0; font-size:1.1rem;">${act.title}</h3>
                            <div style="font-size:0.7rem; color:${isFinished ? 'var(--color-orange)' : 'var(--color-lime)'}; font-weight:800;">${isFinished ? 'FINALITZADA' : new Date(act.date).toLocaleDateString()}</div>
                            <p style="font-size:0.75rem; color:var(--color-muted3); flex:1;">Creat per: <strong>${act.creator?.name || 'Anònim'}</strong></p>
                            
                            <div style="display:flex; flex-direction:column; gap:0.4rem; margin-top:1rem;">
                                ${isFinished ? 
                                    `<button class="btn-rate-participants" data-id="${act._id}" style="background:var(--color-orange); color:white; border:none; padding:0.6rem; border-radius:10px; font-weight:800; font-size:0.75rem; cursor:pointer; width:100%;">VALORAR</button>` : 
                                    `<button class="btn-cancel-inscription" data-activity-id="${act._id}" style="background:rgba(255,255,255,0.05); color:white; border:1px solid rgba(255,255,255,0.1); padding:0.6rem; border-radius:10px; font-weight:800; font-size:0.7rem; cursor:pointer; width:100%;">CANCELAR INSCRIPCIÓ</button>`
                                }
                            </div>
                        </div>
                    `;
                });
            }
            tabPane.appendChild(grid);

        } else if (tabName === 'favorits') {
            const grid = document.createElement('div');
            grid.className = 'visit-grid animate-fade-in';
            if (!myFavorites || myFavorites.length === 0) {
                grid.innerHTML = '<p class="text-center" style="grid-column:1/-1;">No tens cap activitat preferida.</p>';
            } else {
                myFavorites.forEach(act => {
                    grid.innerHTML += `
                        <div class="activity-card" style="background:var(--color-dark2); padding:1.5rem; border-radius:24px; border:1px solid rgba(255,255,255,0.05);">
                            <div class="inscription-sport-tag">${act.sport}</div>
                            <h3 style="margin:1rem 0; font-size:1.1rem;">${act.title}</h3>
                            <button class="btn-remove-fav" data-id="${act._id}" style="width:100%; background:rgba(255,0,0,0.05); color:#ff4444; border:1px solid rgba(255,0,0,0.1); padding:0.6rem; border-radius:10px; font-weight:800; font-size:0.65rem; cursor:pointer;">ELIMINAR DE PREFERITS</button>
                        </div>
                    `;
                });
            }
            tabPane.appendChild(grid);

        } else if (tabName === 'valoracions') {
            const grid = document.createElement('div');
            grid.className = 'visit-grid animate-fade-in';
            if (!myRatingsReceived || myRatingsReceived.length === 0) {
                grid.innerHTML = '<p class="text-center" style="grid-column:1/-1;">Encara no has rebut cap valoració.</p>';
            } else {
                myRatingsReceived.forEach(rating => {
                    const starsHTML = Array.from({length: 5}, (_, i) => 
                        `<span style="color:${i < rating.ratingValue ? 'var(--color-orange)' : '#333'};">★</span>`
                    ).join('');
                    
                    grid.innerHTML += `
                        <div class="rating-card" style="background:var(--color-dark2); padding:1.2rem; border-radius:20px; border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:0.5rem;">
                            <div style="display:flex; align-items:center; gap:0.8rem;">
                                <div style="width:35px; height:35px; border-radius:50%; overflow:hidden; background:var(--color-dark3); border:1px solid var(--color-lime);">
                                    <img src="${rating.rater?.profileDetails?.avatar || '../assets/default-avatar.png'}" style="width:100%; height:100%; object-fit:cover;">
                                </div>
                                <div style="flex:1;">
                                    <div style="font-weight:800; font-size:0.9rem;">${rating.rater?.name || 'Usuari'}</div>
                                    <div style="font-size:0.65rem; color:var(--color-muted3);">${new Date(rating.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style="font-size:1.2rem;">${starsHTML}</div>
                            </div>
                            <div style="font-size:0.85rem; color:white; margin-top:0.5rem; font-style:italic;">
                                "${rating.comment || 'Sense comentari'}"
                            </div>
                        </div>
                    `;
                });
            }
            tabPane.appendChild(grid);

        } else if (tabName === 'seguidors') {
            tabPane.innerHTML = `
                <div class="animate-fade-in">
                    <h3 class="font-display" style="margin-bottom:2rem;">Seguidors (${statsData?.followersCount || 0})</h3>
                    <div class="visit-grid">
                        ${(statsData?.followers || []).map(f => `
                            <div class="user-card" style="background:#111; padding:1.5rem; border-radius:24px; border:1px solid rgba(255,255,255,0.05); text-align:center;">
                                <div style="width:50px; height:50px; border-radius:50%; background:var(--color-dark3); margin:0 auto 1rem; overflow:hidden; border:2px solid var(--color-lime);">
                                    ${f.avatar ? `<img src="${f.avatar}" style="width:100%; height:100%; object-fit:cover;">` : '👤'}
                                </div>
                                <div class="user-name" style="font-weight:800; font-size:1rem; color:white;">${f.name}</div>
                                <div class="user-email" style="font-size:0.7rem; color:var(--color-muted3);">${f.email}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

        } else if (tabName === 'visites') {
            const visits = Array.isArray(statsData?.profileViews) ? statsData.profileViews : [];
            tabPane.innerHTML = `
                <div class="animate-fade-in">
                    <h3 class="font-display" style="margin-bottom:2rem;">Visites recents (${visits.length})</h3>
                    <div class="visit-grid">
                        ${visits.map(v => `
                            <div class="visit-card" style="display:flex; align-items:center; gap:1.5rem; background:#111; padding:1.2rem; border-radius:24px; border:1px solid rgba(255,255,255,0.05);">
                                <div class="visit-avatar" style="width:45px; height:45px; border-radius:50%; background:var(--color-dark3); overflow:hidden; border:2px solid var(--color-orange);">
                                    ${v.user?.avatar ? `<img src="${v.user.avatar}" style="width:100%; height:100%; object-fit:cover;">` : '👤'}
                                </div>
                                <div class="visit-info">
                                    <div class="visit-name" style="font-weight:800; color:white; font-size:0.95rem;">${v.user?.name || 'Usuari'}</div>
                                    <div class="visit-time" style="font-size:0.65rem; color:var(--color-muted3);">${v.viewedAt ? new Date(v.viewedAt).toLocaleString() : ''}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    // ── EVENT DELEGATION (REPAIR) ──────────────────────────────────────────
    if (tabPane) {
        tabPane.onclick = async (e) => {
            const target = e.target;
            console.log('[DEBUG] Click detected on:', target.className);

            // Cancelar Inscripció
            const cancelBtn = target.closest('.btn-cancel-inscription');
            if (cancelBtn) {
                const id = cancelBtn.getAttribute('data-activity-id');
                if (!confirm('Vols cancelar la teva inscripció?')) return;
                try {
                    const res = await fetch(`${API_BASE}/enrollments/${id}`, { method: 'DELETE', headers });
                    if (res.ok) { 
                        alert('Inscripció cancel·lada!'); 
                        await fetchData(); 
                        renderTab(); 
                    } else {
                        const errData = await res.json();
                        alert('Error: ' + (errData.message || 'No s\'ha pogut cancel·lar'));
                    }
                } catch (err) { alert('Error de connexió'); }
            }

            // Finalitzar Activitat
            const finalizeBtn = target.closest('.btn-finalize-activity');
            if (finalizeBtn) {
                const id = finalizeBtn.getAttribute('data-id');
                if (!confirm('Vols finalitzar aquesta activitat?')) return;
                try {
                    const res = await fetch(`${API_BASE}/activities/${id}/finalize`, { method: 'PUT', headers });
                    if (res.ok) { 
                        alert('Activitat finalitzada!'); 
                        await fetchData(); 
                        renderTab(); 
                        window.showRatingModal(id);
                    } else {
                        const errData = await res.json();
                        alert('Error: ' + (errData.message || 'No s\'ha pogut finalitzar'));
                    }
                } catch (err) { alert('Error de connexió'); }
            }

            // Eliminar Activitat
            const deleteBtn = target.closest('.btn-delete');
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (!confirm('Segur que vols eliminar l\'activitat?')) return;
                try {
                    const res = await fetch(`${API_BASE}/activities/${id}`, { method: 'DELETE', headers });
                    if (res.ok) { alert('Activitat eliminada!'); await fetchData(); renderTab(); }
                } catch (err) { alert('Error'); }
            }

            // Valorar
            const rateBtn = target.closest('.btn-rate-participants');
            if (rateBtn) {
                const id = rateBtn.getAttribute('data-id');
                console.log('[DEBUG] Opening rating modal for:', id);
                window.showRatingModal(id);
            }

            // Eliminar Favorit
            const favBtn = target.closest('.btn-remove-fav');
            if (favBtn) {
                const id = favBtn.getAttribute('data-id');
                try {
                    const res = await fetch(`${API_BASE}/users/favorites/${id}`, { method: 'POST', headers });
                    if (res.ok) { await fetchData(); renderTab(); }
                } catch (err) { alert('Error'); }
            }
        };
    }

    async function handleProfileUpdate(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = { 
            name: formData.get('name'), 
            bio: formData.get('bio')
        };
        try {
            const res = await fetch(`${API_BASE}/users/profile`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) { 
                alert('Perfil actualitzat!'); 
                await fetchData(); 
                updateProfileUI(); 
            }
        } catch (err) { alert('Error'); }
    }

    function updateProfileUI() {
        if (!statsData) return;
        if (profileName) profileName.innerText = statsData.name;
        
        const avatarImg = avatarCard ? avatarCard.querySelector('img') || avatarCard.querySelector('.avatar-placeholder') : null;
        if (statsData.profileDetails?.avatar) {
            if (avatarCard) {
                // Inserir o actualitzar NOMÉS la imatge, sense destruir l'overlay i l'input
                let img = avatarCard.querySelector('img');
                const placeholder = avatarCard.querySelector('.avatar-placeholder');
                if (!img) {
                    img = document.createElement('img');
                    img.alt = 'Avatar';
                    // Inserir la imatge com a primer fill (sota l'overlay)
                    avatarCard.insertBefore(img, avatarCard.firstChild);
                }
                img.src = statsData.profileDetails.avatar;
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;pointer-events:none;';
                // Amagar el placeholder emoji si existeix
                if (placeholder) placeholder.style.display = 'none';
            }
        }

        if (countPoints) countPoints.innerText = statsData.total_points || 0;
        if (countFollowers) countFollowers.innerText = statsData.followersCount || 0;
        if (countFollowing) countFollowing.innerText = statsData.followingCount || 0;
        if (countViews) countViews.innerText = statsData.profileViews?.length || 0;

        const isPremium = statsData.isPremium || String(statsData.isPremium) === 'true';
        if (isPremium) {
            if (vipBadge) vipBadge.classList.remove('hidden');
            if (tabFavorits) tabFavorits.classList.remove('hidden');
            if (tabVisites) tabVisites.classList.remove('hidden');
            if (statViews) statViews.classList.remove('hidden');
        }
    }

    // Tab buttons setup
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            renderTab();
        };
    });

    // Avatar handlers
    if (avatarCard && avatarInput) {
        avatarCard.onclick = () => avatarInput.click();
        if (avatarUploadBtn) avatarUploadBtn.onclick = () => avatarInput.click();
        
        avatarInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target.result;
                try {
                    const res = await fetch(`${API_BASE}/users/profile`, {
                        method: 'PUT',
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avatar: base64 })
                    });
                    if (res.ok) { await fetchData(); updateProfileUI(); }
                } catch (err) { alert('Error pujant avatar'); }
            };
            reader.readAsDataURL(file);
        };
    }

    async function init() {
        await fetchData();
        updateProfileUI();
        
        // Comprovar si hi ha un paràmetre ?rate= a la URL
        const urlParams = new URLSearchParams(window.location.search);
        const rateId = urlParams.get('rate');
        
        if (rateId) {
            renderTab('inscripcions'); // Opcional, mostra la pestanya d'inscripcions
            window.showRatingModal(rateId);
        } else {
            renderTab('dades');
        }
    }
    init();
});

// ── GLOBAL FUNCTIONS (MODALS) ────────────────────────────────────────────────
window.showRatingModal = async function(activityId) {
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
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
                <button onclick="if(window.closeRatingModal){window.closeRatingModal();}else{document.getElementById('rating-overlay').remove(); window.location.reload();}" style="width:100%; margin-top:1.5rem; background:none; border:1px solid #222; color:#555; padding:0.8rem; border-radius:12px; font-weight:700; cursor:pointer;">TANCAR</button>
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
