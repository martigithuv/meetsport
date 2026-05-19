document.addEventListener('DOMContentLoaded', function() {
    const userStr = localStorage.getItem('user');
    if (!userStr) { window.location.href = '../login/login.php'; return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') { window.location.href = '../inici/inici.php'; return; }

    let activeTab = 'users';
    const tabContent = document.getElementById('tab-content');

    const fetchData = async () => {
        tabContent.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            const [usersRes, activitiesRes, statsRes] = await Promise.all([
                fetch("http://localhost:5000/api/admin/users", { headers }).then(r => r.json()),
                fetch("http://localhost:5000/api/admin/activities", { headers }).then(r => r.json()),
                fetch("http://localhost:5000/api/admin/stats", { headers }).then(r => r.json())
            ]);
            
            render(usersRes, activitiesRes, statsRes);
        } catch (err) { console.error(err); }
    };

    const render = (users, activities, stats) => {
        tabContent.innerHTML = '';
        if (activeTab === 'users') {
            const table = document.createElement('table');
            table.className = 'admin-table animate-fade-in';
            table.innerHTML = `
                <thead>
                    <tr><th>Usuari</th><th>Email</th><th>Pla</th><th>Estat</th><th>Accions</th></tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td><div style="font-weight:700;">${u.name}</div></td>
                            <td>${u.email}</td>
                            <td><span style="color:${u.isPremium ? 'var(--color-orange)' : 'var(--color-muted3)'}; font-weight:800; font-size:0.6rem; text-transform:uppercase;">${u.isPremium ? 'Premium' : 'Free'}</span></td>
                            <td><span style="color:${u.isBlocked ? '#ff4b4b' : 'var(--color-lime)'}; font-weight:700;">${u.isBlocked ? 'Bloquejat' : 'Actiu'}</span></td>
                            <td>
                                <button class="btn-action btn-star" onclick="openDeductModal('${u._id}', '${u.name}', ${u.total_points || 0})">⭐</button>
                                <button class="btn-action btn-block" onclick="toggleBlock('${u._id}')">🚫</button>
                                <button class="btn-action btn-delete" onclick="deleteUser('${u._id}')">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            tabContent.appendChild(table);
        } else if (activeTab === 'activities') {
            const table = document.createElement('table');
            table.className = 'admin-table animate-fade-in';
            table.innerHTML = `
                <thead>
                    <tr><th>Activitat</th><th>Creador</th><th>Esport</th><th>Visibilitat</th><th>Accions</th></tr>
                </thead>
                <tbody>
                    ${activities.map(a => `
                        <tr>
                            <td><div style="font-weight:700;">${a.title}</div></td>
                            <td>${a.creator?.name || 'Anònim'}</td>
                            <td><span class="tag-sport">${a.sport}</span></td>
                            <td>${a.isHidden ? 'Oculta' : 'Visible'}</td>
                            <td>
                                <button class="btn-action btn-block" onclick="toggleHide('${a._id}')">👁️</button>
                                <button class="btn-action btn-delete" onclick="deleteActivity('${a._id}')">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            tabContent.appendChild(table);
        } else if (activeTab === 'stats') {
            const div = document.createElement('div');
            div.className = 'animate-fade-in';
            div.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size:0.6rem; text-transform:uppercase; color:var(--color-muted3); margin-bottom:1rem;">Total Usuaris</div>
                        <div style="font-size:3rem; font-weight:800;">${users.length}</div>
                    </div>
                    <div class="stat-card" style="border-color:var(--color-lime);">
                        <div style="font-size:0.6rem; text-transform:uppercase; color:var(--color-lime); margin-bottom:1rem;">Ingressos Premium</div>
                        <div style="font-size:3rem; font-weight:800;">${stats.totalEarnings}€</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size:0.6rem; text-transform:uppercase; color:var(--color-muted3); margin-bottom:1rem;">Usuaris Premium</div>
                        <div style="font-size:3rem; font-weight:800; color:var(--color-orange);">${stats.totalPremiumUsers}</div>
                    </div>
                </div>
                <div class="charts-grid">
                    <div class="chart-container">
                        <h3 class="font-display" style="margin-bottom:2rem;">GUANYS <span class="text-lime">PER MES</span></h3>
                        <canvas id="earningsChart" height="250"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3 class="font-display" style="margin-bottom:2rem;">EVOLUCIÓ <span class="text-orange">USUARIS</span></h3>
                        <canvas id="growthChart" height="250"></canvas>
                    </div>
                </div>
            `;
            tabContent.appendChild(div);
            renderCharts(stats);
        }
    };

    const renderCharts = (stats) => {
        new Chart(document.getElementById('earningsChart'), {
            type: 'bar',
            data: {
                labels: stats.earningsHistory.map(e => e.month),
                datasets: [{
                    label: 'Guanys (€)',
                    data: stats.earningsHistory.map(e => e.amount),
                    backgroundColor: 'rgba(200, 245, 66, 0.4)',
                    borderColor: '#c8f542',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        new Chart(document.getElementById('growthChart'), {
            type: 'line',
            data: {
                labels: stats.userGrowthHistory.map(m => m.month),
                datasets: [{
                    label: 'Usuaris',
                    data: stats.userGrowthHistory.map(m => m.count),
                    borderColor: '#ff6b2b',
                    backgroundColor: 'rgba(255, 107, 43, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true }
        });
    };

    // Global action handlers
    window.toggleBlock = async (id) => {
        await fetch(`http://localhost:5000/api/admin/users/block/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchData();
    };

    window.deleteUser = async (id) => {
        if (!confirm('Eliminar usuari i totes les seves dades per sempre?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert('Usuari eliminat correctament');
                fetchData();
            } else {
                alert(data.message || 'Error al eliminar usuari');
            }
        } catch (err) {
            console.error(err);
            alert('Error de connexió');
        }
    };

    window.toggleHide = async (id) => {
        await fetch(`http://localhost:5000/api/admin/activities/hide/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchData();
    };

    window.deleteActivity = async (id) => {
        if (!confirm('Eliminar activitat i inscripcions per sempre?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/activities/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert('Activitat eliminada correctament');
                fetchData();
            } else {
                alert(data.message || 'Error al eliminar activitat');
            }
        } catch (err) {
            console.error(err);
            alert('Error de connexió');
        }
    };

    // Modal Deducció de Punts
    const deductModal = document.getElementById('deduct-modal');
    const deductForm = document.getElementById('deduct-form');

    window.openDeductModal = (userId, userName, currentPoints) => {
        document.getElementById('deduct-user-id').value = userId;
        document.getElementById('deduct-user-info').innerText = `Usuari: ${userName}`;
        document.getElementById('current-points-display').innerText = currentPoints;
        document.getElementById('points-to-deduct').value = '';
        document.getElementById('deduct-comment').value = '';
        deductModal.classList.remove('hidden');
    };

    window.closeDeductModal = () => {
        deductModal.classList.add('hidden');
    };

    if (deductForm) {
        deductForm.onsubmit = async (e) => {
            e.preventDefault();
            const userId = document.getElementById('deduct-user-id').value;
            const points = document.getElementById('points-to-deduct').value;
            const comment = document.getElementById('deduct-comment').value;

            try {
                const res = await fetch(`http://localhost:5000/api/admin/users/deduct-points/${userId}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}` 
                    },
                    body: JSON.stringify({ points, comment })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Punts restats i missatge enviat');
                    closeDeductModal();
                    fetchData();
                } else {
                    alert(data.message || 'Error al restar punts');
                }
            } catch (err) {
                console.error(err);
                alert('Error de connexió');
            }
        };
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            fetchData();
        };
    });

    fetchData();
});
