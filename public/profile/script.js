document.addEventListener('DOMContentLoaded', function() {
    const userStr = localStorage.getItem('user');
    if (!userStr) { window.location.href = '../login/login.php'; return; }
    let user = JSON.parse(userStr);

    const profileName = document.getElementById('profile-name');
    const vipBadge = document.getElementById('vip-badge');
    const tabFavorits = document.getElementById('tab-favorits');
    const statViews = document.getElementById('stat-views');
    const tabPane = document.getElementById('tab-pane');
    
    let activeTab = 'dades';
    let myActivities = [];
    let favorites = [];
    let stats = { followers: [], following: [], profileViews: [] };

    const init = () => {
        profileName.innerText = user.name;
        if (user.isPremium) {
            vipBadge.classList.remove('hidden');
            tabFavorits.classList.remove('hidden');
            statViews.classList.remove('hidden');
            document.querySelector('.profile-main').classList.add('premium-mode');
        }
        fetchData();
    };

    const fetchData = async () => {
        const headers = { Authorization: `Bearer ${user.token}` };
        try {
            const [statsRes, favsRes, myActRes] = await Promise.all([
                fetch("http://localhost:5000/api/users/stats", { headers }).then(r => r.json()),
                user.isPremium ? fetch("http://localhost:5000/api/users/favorites", { headers }).then(r => r.json()) : Promise.resolve([]),
                fetch("http://localhost:5000/api/activities/my", { headers }).then(r => r.json())
            ]);
            stats = statsRes;
            favorites = favsRes;
            myActivities = myActRes;
            
            updateStatsUI();
            renderTab();
        } catch (err) { console.error(err); }
    };

    const updateStatsUI = () => {
        document.getElementById('count-followers').innerText = stats.followersCount || 0;
        document.getElementById('count-following').innerText = stats.followingCount || 0;
        if (user.isPremium) {
            document.getElementById('count-views').innerText = stats.profileViews?.length || 0;
        }
    };

    const renderTab = () => {
        tabPane.innerHTML = '';
        if (activeTab === 'dades') {
            tabPane.innerHTML = `
                <div class="settings-card animate-fade-in">
                    <h2 class="font-display" style="margin-bottom:2rem;">Configuració del Perfil</h2>
                    <div class="form-group">
                        <label style="color:#c8f542; font-weight:800; display:block; margin-bottom:8px;">Nom Complet</label>
                        <input type="text" id="edit-name" value="${user.name}" style="background:#222; border:1px solid #444; color:white; padding:12px; border-radius:10px; width:100%;">
                    </div>
                    <div class="form-group">
                        <label style="color:#c8f542; font-weight:800; display:block; margin-bottom:8px;">Email</label>
                        <input type="email" id="edit-email" value="${user.email}" style="background:#222; border:1px solid #444; color:white; padding:12px; border-radius:10px; width:100%;">
                    </div>
                    <div class="form-group">
                        <label style="color:#c8f542; font-weight:800; display:block; margin-bottom:8px;">Bio</label>
                        <textarea id="edit-bio" rows="3" style="background:#222; border:1px solid #444; color:white; padding:12px; border-radius:10px; width:100%;">${user.bio || ''}</textarea>
                    </div>
                    <button class="btn-save" id="save-btn">Desar canvis</button>
                </div>
            `;
            document.getElementById('save-btn').onclick = handleSave;
        } else if (activeTab === 'activitats') {
            if (myActivities.length === 0) {
                tabPane.innerHTML = '<p class="text-center">No has creat cap activitat encara.</p>';
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'explore-grid animate-fade-in';
            myActivities.forEach(act => {
                const card = document.createElement('div');
                card.className = 'activity-card';
                card.innerHTML = `
                    <div class="card-tags">
                        <span class="tag-sport">${act.sport}</span>
                    </div>
                    <h3>${act.title}</h3>
                    <p>${act.description}</p>
                    <button class="btn-delete" onclick="deleteMyActivity('${act._id}')">ELIMINAR ACTIVITAT</button>
                `;
                grid.appendChild(card);
            });
            tabPane.appendChild(grid);
        } else if (activeTab === 'favorits') {
            if (!user.isPremium) { tabPane.innerHTML = '<p class="text-center">Opció només per Premium.</p>'; return; }
            if (favorites.length === 0) {
                tabPane.innerHTML = '<p class="text-center">No tens cap activitat guardada.</p>';
                return;
            }
            const grid = document.createElement('div');
            grid.className = 'explore-grid animate-fade-in';
            favorites.forEach(act => {
                const card = document.createElement('div');
                card.className = 'activity-card';
                card.innerHTML = `
                    <div class="card-tags">
                        <span class="tag-sport">${act.sport}</span>
                    </div>
                    <h3>${act.title}</h3>
                    <p>${act.description}</p>
                    <button class="btn-remove-fav" onclick="toggleFavFromProfile('${act._id}')">TREURE DE PREFERITS</button>
                `;
                grid.appendChild(card);
            });
            tabPane.appendChild(grid);
        } else if (activeTab === 'seguidors') {
            tabPane.innerHTML = `
                <div class="animate-fade-in">
                    <h3 class="font-display" style="margin-bottom:2rem;">Seguidors (${stats.followersCount})</h3>
                    <div class="explore-grid">
                        ${stats.followers.map(f => `
                            <div class="user-card">
                                <div class="user-name">${f.name}</div>
                                <div class="user-email">${f.email}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    };

    const handleSave = async () => {
        const btn = document.getElementById('save-btn');
        btn.innerText = 'Guardant...';
        btn.disabled = true;
        try {
            const payload = {
                name: document.getElementById('edit-name').value,
                email: document.getElementById('edit-email').value,
                bio: document.getElementById('edit-bio').value
            };
            const response = await fetch("http://localhost:5000/api/users/profile", {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}` 
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok) {
                user = { ...user, ...data.user };
                localStorage.setItem('user', JSON.stringify(user));
                alert('Perfil actualitzat!');
                init();
            }
        } catch (err) { console.error(err); }
        finally { btn.innerText = 'Desar canvis'; btn.disabled = false; }
    };

    window.deleteMyActivity = async (id) => {
        if (!confirm('Segur que vols eliminar aquesta activitat?')) return;
        try {
            await fetch(`http://localhost:5000/api/activities/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchData();
        } catch (err) { console.error(err); }
    };

    window.toggleFavFromProfile = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/users/favorites/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                // Actualizar localmente el usuario para reflejar el cambio
                user.favorites = user.favorites.filter(fid => fid !== id);
                localStorage.setItem('user', JSON.stringify(user));
                alert('Eliminat de preferits');
                fetchData();
            }
        } catch (err) { 
            console.error(err); 
            alert('Error al gestionar preferits');
        }
    };

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            renderTab();
        };
    });

    init();
});
