<?php 
$pageTitle = "Premium";
$extraCSS = "style.css";
include "../partials/header.php"; 
?>

<main class="premium-main pt-nav container animate-fade-in">
    <div class="premium-header text-center">
        <h1 class="font-display">Plans <span class="text-lime">Premium</span></h1>
        <p class="text-muted3">Desbloqueja tot el potencial de MeetSport</p>
    </div>

    <div class="plans-grid mt-10">
        <!-- Free Plan -->
        <div class="plan-card free">
            <div class="plan-name">Free</div>
            <div class="plan-price">0€<span class="period">/mes</span></div>
            <ul class="features">
                <li><span class="check">✓</span> Crear activitats il·limitades</li>
                <li><span class="check">✓</span> Cerca bàsica</li>
                <li><span class="check">✓</span> Match estàndard</li>
                <li class="disabled"><span class="cross">✕</span> Activitats destacades</li>
                <li class="disabled"><span class="cross">✕</span> Perfil verificat</li>
                <li class="disabled"><span class="cross">✕</span> Estadístiques avançades</li>
            </ul>
            <button class="btn-plan disabled" disabled>Pla actual</button>
        </div>

        <!-- Premium Plan -->
        <div class="plan-card premium featured">
            <div class="badge">Recomanat</div>
            <div class="plan-name text-orange">Premium</div>
            <div class="plan-price">9.99€<span class="period">/mes</span></div>
            <ul class="features">
                <li><span class="check">✓</span> Tot el pla Free</li>
                <li><span class="icon-orange">⚡</span> Destacar activitats</li>
                <li><span class="icon-orange">🚀</span> Prioritat en matches</li>
                <li><span class="check">✓</span> Perfil verificat</li>
                <li><span class="icon-orange">📊</span> Estadístiques avançades</li>
                <li><span class="icon-orange">🔍</span> Filtres avançats</li>
            </ul>
            <button class="btn-plan active" id="activate-premium">Activar Premium</button>
        </div>
    </div>
    <p class="text-center mt-8 text-muted3 text-xs">Cancel·la quan vulguis. Sense compromís. Pagament segur via Stripe.</p>
</main>

<style>
    .premium-main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 80vh;
    }

    .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        max-width: 900px;
        width: 100%;
    }

    .plan-card {
        background: var(--color-dark2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 32px;
        padding: 3rem;
        position: relative;
    }

    .plan-card.featured {
        background: var(--color-dark2);
        border: 1px solid rgba(200, 245, 66, 0.2);
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }

    .badge {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--color-lime);
        color: var(--color-dark);
        font-size: 0.6rem;
        font-weight: 800;
        padding: 6px 12px;
        border-radius: 0 0 0 12px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    .plan-name {
        font-family: var(--font-display);
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .plan-price {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 2rem;
    }

    .period {
        font-size: 0.9rem;
        color: var(--color-muted3);
        font-weight: 400;
    }

    .features {
        list-style: none;
        margin-bottom: 2.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }

    .features li {
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    .check { color: var(--color-lime); font-weight: 700; }
    .cross { color: #ff4b4b; font-weight: 700; }
    .disabled { color: var(--color-muted3); }
    .icon-orange { color: var(--color-orange); }

    .btn-plan {
        width: 100%;
        padding: 1rem;
        border-radius: 16px;
        font-weight: 700;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }

    .btn-plan.disabled {
        background: rgba(255, 255, 255, 0.05);
        color: var(--color-muted3);
        border: 1px solid rgba(255, 255, 255, 0.05);
        cursor: not-allowed;
    }

    .btn-plan.active {
        background: var(--color-orange);
        color: white;
        box-shadow: 0 10px 20px rgba(255, 107, 43, 0.2);
    }

    .btn-plan.active:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(255, 107, 43, 0.3);
    }
</style>

<script>
    document.getElementById('activate-premium').onclick = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert("Debes iniciar sesión para activar Premium");
            window.location.href = '../login/login.php';
            return;
        }
        const user = JSON.parse(userStr);
        if (user.isPremium) {
            alert("🎉 Ja disposes del pla Premium! Gaudeix dels teus avantatges.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/stripe/create-checkout-session", {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error al processar el pagament");
            }
        } catch (err) {
            console.error(err);
            alert("Hubo un error al procesar el pago");
        }
    };
</script>

<?php include "../partials/footer.php"; ?>
