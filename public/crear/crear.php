<?php 
$pageTitle = "Crear Activitat";
$extraCSS = "style.css";
include "../partials/header.php"; 
?>

<main class="crear-main pt-nav container animate-fade-in">
    <div class="form-card">
        <h1 class="font-display">Crea una nova <span class="text-lime">activitat</span></h1>
        <p class="text-muted3">Organitza el teu propi esdeveniment esportiu</p>

        <form id="create-activity-form" class="mt-8">
            <div class="form-group">
                <label>Títol de l'activitat</label>
                <input type="text" id="title" placeholder="Ex: Partit de Pàdel 2vs2" required>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Esport</label>
                    <select id="sport" required>
                        <option value="padel">Pàdel</option>
                        <option value="running">Running</option>
                        <option value="cycling">Ciclisme</option>
                        <option value="football">Futbol</option>
                        <option value="tennis">Tennis</option>
                        <option value="altres">Altres</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nivell</label>
                    <select id="level" required>
                        <option value="Principiant">Principiant</option>
                        <option value="Intermig">Intermig</option>
                        <option value="Avançat">Avançat</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Data i Hora</label>
                    <input type="datetime-local" id="date" required>
                </div>
                <div class="form-group">
                    <label>Màxim de participants</label>
                    <input type="number" id="maxParticipants" min="2" value="4" required>
                </div>
            </div>

            <div class="form-group">
                <label>Adreça</label>
                <input type="text" id="address" placeholder="Ex: Carrer de l'Esport, 123" required>
            </div>

            <div class="form-group">
                <label>Descripció</label>
                <textarea id="description" placeholder="Explica els detalls de l'activitat..." rows="4" required></textarea>
            </div>

            <button type="submit" class="btn-primary w-full" id="submit-btn">Publicar Activitat</button>
        </form>
    </div>
</main>

<style>
    .form-card {
        max-width: 600px;
        margin: 0 auto;
        background: var(--color-dark2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 32px;
        padding: 3rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    label {
        display: block;
        font-size: 0.65rem;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--color-muted3);
        margin-bottom: 0.6rem;
    }

    input, select, textarea {
        width: 100%;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 0.8rem 1rem;
        color: var(--color-light);
        font-size: 0.9rem;
        outline: none;
        transition: all 0.3s ease;
    }

    input:focus, select:focus, textarea:focus {
        border-color: var(--color-lime);
        background: rgba(200, 245, 66, 0.02);
    }

    .w-full { width: 100%; justify-content: center; padding: 1.2rem; }
</style>

<script>
    document.getElementById('create-activity-form').onsubmit = async (e) => {
        e.preventDefault();
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Cal iniciar sessió');
            return;
        }
        const token = JSON.parse(userStr).token;
        const btn = document.getElementById('submit-btn');
        btn.innerText = 'Publicant...';
        btn.disabled = true;

        const payload = {
            title: document.getElementById('title').value,
            sport: document.getElementById('sport').value,
            level: document.getElementById('level').value,
            date: document.getElementById('date').value,
            maxParticipants: parseInt(document.getElementById('maxParticipants').value),
            location: { address: document.getElementById('address').value },
            description: document.getElementById('description').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/activities', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert('Activitat creada correctament!');
                window.location.href = '../explorar/explorar.php';
            } else {
                const data = await response.json();
                alert(data.message || 'Error en crear l\'activitat');
            }
        } catch (err) {
            console.error(err);
        } finally {
            btn.innerText = 'Publicar Activitat';
            btn.disabled = false;
        }
    };
</script>

<?php include "../partials/footer.php"; ?>
