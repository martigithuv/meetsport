<?php 
$pageTitle = "Admin Dashboard";
$extraCSS = "style.css";
include "../partials/header.php"; 
?>

<main class="admin-main pt-nav container animate-fade-in">
    <div class="admin-header">
        <div>
            <h1 class="font-display">ADMIN <span class="text-lime">DASHBOARD</span></h1>
            <p class="text-muted3">Gestió centralitzada de MeetSport</p>
        </div>
        <div class="tabs-selector">
            <button class="tab-btn active" data-tab="users">Usuaris</button>
            <button class="tab-btn" data-tab="activities">Activitats</button>
            <button class="tab-btn" data-tab="stats">Estadístiques</button>
        </div>
    </div>

    <div id="tab-content" class="tab-content mt-10">
        <!-- Content will be injected here -->
        <div class="loader"><div class="spinner"></div></div>
    </div>
</main>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="script.js"></script>

<style>
    .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2rem;
    }

    .tabs-selector {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 4px;
        display: flex;
    }

    .tab-btn {
        padding: 10px 24px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted3);
    }

    .tab-btn.active {
        background: var(--color-lime);
        color: var(--color-dark);
        box-shadow: 0 4px 12px rgba(200, 245, 66, 0.2);
    }

    .admin-table {
        width: 100%;
        background: var(--color-dark2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 32px;
        overflow: hidden;
        border-collapse: collapse;
    }

    .admin-table th {
        background: rgba(255, 255, 255, 0.03);
        padding: 1.5rem;
        text-align: left;
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--color-muted3);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .admin-table td {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        font-size: 0.9rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        margin-bottom: 3rem;
    }

    .stat-card {
        background: var(--color-dark2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 32px;
        padding: 2.5rem;
    }

    .charts-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    .chart-container {
        background: var(--color-dark2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 32px;
        padding: 2.5rem;
    }

    .btn-action {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 0.5rem;
        transition: all 0.3s ease;
    }

    .btn-delete { background: rgba(255, 75, 75, 0.1); color: #ff4b4b; }
    .btn-block { background: rgba(255, 255, 255, 0.05); color: var(--color-muted3); }
    
    .btn-delete:hover { background: #ff4b4b; color: white; }
    .btn-block:hover { background: var(--color-lime); color: var(--color-dark); }
</style>

<?php include "../partials/footer.php"; ?>
