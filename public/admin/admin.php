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

    <!-- Modal Deducció de Punts -->
    <div id="deduct-modal" class="modal-overlay hidden">
        <div class="modal-content animate-pop-in">
            <h2 class="font-display mb-4">RESTAR <span class="text-orange">PUNTS</span></h2>
            <div id="deduct-user-info" class="mb-4 text-muted3"></div>
            
            <form id="deduct-form">
                <input type="hidden" id="deduct-user-id">
                <div class="form-group mb-4">
                    <label class="label-small">Punts totals actuals</label>
                    <div id="current-points-display" style="font-size: 1.5rem; font-weight: 800; color: var(--color-lime);">0</div>
                </div>
                
                <div class="form-group mb-4">
                    <label class="label-small">Punts a restar</label>
                    <input type="number" id="points-to-deduct" class="input-dark" placeholder="Ex: 50" required min="1">
                </div>
                
                <div class="form-group mb-6">
                    <label class="label-small">Motiu / Comentari</label>
                    <textarea id="deduct-comment" class="input-dark" style="min-height: 100px; padding: 12px;" placeholder="Explica el motiu de la deducció..." required></textarea>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button type="button" class="btn-secondary flex-1" onclick="closeDeductModal()">Cancel·lar</button>
                    <button type="submit" class="btn-primary flex-1" style="background: var(--color-orange); border-color: var(--color-orange);">Restar Punts</button>
                </div>
            </form>
        </div>
    </div>
</main>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="script.js?v=1.1"></script>

<?php include "../partials/footer.php"; ?>
