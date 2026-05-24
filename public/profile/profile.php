<?php
$pageTitle = "El meu Perfil";
$extraCSS = "style.css";
include "../partials/header.php";
?>

<style>
    /* FORZAR DISEÑO PREMIUM EN FORMULARIO */
    .form-group input,
    .form-group textarea {
        width: 100% !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 16px !important;
        padding: 1.2rem 1.5rem !important;
        color: white !important;
        font-family: inherit !important;
        font-size: 1rem !important;
        outline: none !important;
        margin-top: 0.5rem !important;
    }

    .form-group label {
        color: var(--color-lime) !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        font-size: 0.7rem !important;
    }

    .settings-card {
        background: #111 !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5) !important;
    }
</style>


<main class="profile-main pt-nav animate-fade-in">
    <div class="profile-banner">
        <div class="banner-overlay"></div>
    </div>

    <div class="container profile-content">
        <div class="profile-header">
            <div class="avatar-section">
                <div class="avatar-controls">
        <div class="avatar-card" id="avatar-card" style="
            width:120px !important;
            height:120px !important;
            min-width:120px !important;
            max-width:120px !important;
            border-radius:50% !important;
            overflow:hidden !important;
            position:relative !important;
            flex-shrink:0 !important;
            display:flex !important;
            align-items:center;
            justify-content:center;
            background:var(--color-dark3);
            border:3px solid var(--color-lime);
            box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 4px rgba(200,245,66,0.15);
            cursor:pointer;
        ">
            <div class="avatar-placeholder">🧑‍🦱</div>
            <div class="avatar-hover">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span>Canviar</span>
            </div>
            <input type="file" id="avatar-input" hidden accept="image/*">
        </div>
        <button class="btn-avatar-upload" id="avatar-upload-btn" type="button">Canviar foto</button>
    </div>
                <div class="user-info">
                    <div class="name-badge">
                        <h1 id="profile-name" class="font-display">Carregant...</h1>
                        <span id="vip-badge" class="badge-vip hidden">VIP</span>
                    </div>
                    <p id="profile-handle" class="text-muted3">@usuari · Barcelona</p>
                </div>
            </div>

            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-val" id="count-followers">0</div>
                    <div class="stat-lab">Followers</div>
                </div>
                <div class="stat-item">
                    <div class="stat-val" id="count-following">0</div>
                    <div class="stat-lab">Following</div>
                </div>
                <div class="stat-item">
                    <div class="stat-val" id="count-points">0</div>
                    <div class="stat-lab">⭐ Punts</div>
                </div>
                <div class="stat-item hidden" id="stat-views">
                    <div class="stat-val" id="count-views">0</div>
                    <div class="stat-lab">Visites</div>
                </div>
            </div>
        </div>

        <div class="profile-tabs">
            <button class="tab-btn active" data-tab="dades">Dades</button>
            <button class="tab-btn" data-tab="activitats">Les meves activitats</button>
            <button class="tab-btn" data-tab="inscripcions">Inscripcions</button>
            <button class="tab-btn" data-tab="valoracions">Valoracions</button>
            <button class="tab-btn hidden" data-tab="favorits" id="tab-favorits">Preferits</button>
            <button class="tab-btn" data-tab="seguidors">Seguidors</button>
            <button class="tab-btn hidden" data-tab="visites" id="tab-visites">Visites</button>
        </div>

        <div id="tab-pane" class="tab-pane mt-10">
            <!-- Content injected here -->
        </div>
    </div>
</main>

<script src="script.js?v=2.1"></script>

<?php include "../partials/footer.php"; ?>