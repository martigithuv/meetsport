<?php
$pageTitle = "Crear Activitat";
$extraCSS = "style.css";
include "../partials/header.php";
?>

<main class="crear-main pt-nav container animate-fade-in">
    <div class="form-container">
        <div class="form-header">
            <h1 class="font-display">Crea una nova <span class="text-lime">activitat</span></h1>
            <p class="text-muted3">Organitza el teu propi desenvolupament esportiu</p>
        </div>

        <form id="create-activity-form" class="form-card">
            <!-- Row 1: Títol -->
            <div class="form-group full-width">
                <label>Títol de l'activitat</label>
                <input type="text" id="title" placeholder="Ex: Partit de Pàdel 2vs2" required>
            </div>

            <!-- Row 2: Esport, Nivell, Participants -->
            <div class="form-row three-cols">
                <div class="form-group">
                    <label>Esport</label>
                    <select id="sport" required>
                        <option value="">Selecciona un esport</option>
                        <option value="padel">Pàdel</option>
                        <option value="tennis">Tennis</option>
                        <option value="football">Futbol</option>
                        <option value="futsal">Futbol Sala</option>
                        <option value="basketball">Bàsquet</option>
                        <option value="volleyball">Voleibol</option>
                        <option value="running">Running</option>
                        <option value="cycling">Ciclisme</option>
                        <option value="swimming">Natació</option>
                        <option value="gym">Gimnàs / Fitness</option>
                        <option value="yoga">Ioga</option>
                        <option value="hiking">Senderisme</option>
                        <option value="climbing">Escalada</option>
                        <option value="surf">Surf / Paddle surf</option>
                        <option value="skiing">Esquí / Snowboard</option>
                        <option value="boxing">Boxa / Arts Marcials</option>
                        <option value="golf">Golf</option>
                        <option value="altres">Altres</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nivell</label>
                    <select id="level" required>
                        <option value="">Selecciona un nivell</option>
                        <option value="Principiant">Principiant</option>
                        <option value="Intermedi">Intermedi</option>
                        <option value="Avançat">Avançat</option>
                        <option value="Tots">Tots els nivells</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Màxim de participants</label>
                    <input type="number" id="maxParticipants" min="2" value="4" required>
                </div>
            </div>

            <!-- Row 3: Data i Hora -->
            <div class="form-group full-width">
                <label>Data i Hora</label>
                <input type="datetime-local" id="date" required>
            </div>

            <!-- Row 4: Adreça i Enllaç de ubicació -->
            <div class="form-row two-cols">
                <div class="form-group">
                    <label>Adreça</label>
                    <input type="text" id="address" placeholder="Ex: Carrer de l'Esport, 123" required>
                </div>
                <div class="form-group">
                    <label>Enllaç de ubicació (URL) <span
                            style="color:var(--color-muted3); font-weight:400;">(opcional)</span></label>
                    <input type="url" id="locationUrl" placeholder="Ex: https://maps.google.com/...">
                </div>
            </div>

            <!-- Row 5: Descripció -->
            <div class="form-group full-width">
                <label>Descripció</label>
                <textarea id="description" placeholder="Explica els detalls de l'activitat..." rows="3"
                    required></textarea>
            </div>

            <div class="form-group full-width">
                <label>Imatges de l'activitat <span
                        style="color:var(--color-muted3); font-weight:400;">(opcional)</span></label>
                <div class="image-upload-section" onclick="document.getElementById('images').click()">
                    <svg class="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z">
                        </path>
                        <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <input type="file" id="images" accept="image/*" multiple>
                    <div class="upload-info">Pots pujar múltiples imatges (JPG, PNG, GIF)</div>
                    <div id="image-preview" class="image-preview"></div>
                </div>
            </div>

            <button type="submit" class="btn-primary w-full" id="submit-btn">Publicar Activitat</button>
        </form>
    </div>
</main>

<style>
    .form-container {
        max-width: 1300px;
        margin: 0 auto;
        padding: 2rem;
    }

    .form-header {
        text-align: center;
        margin-bottom: 2.5rem;
    }

    .form-header h1 {
        margin-bottom: 0.3rem;
        font-size: 2.5rem;
    }

    .form-header p {
        font-size: 1.1rem;
    }

    .form-card {
        background: var(--color-dark2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 32px;
        padding: 2.5rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group.full-width {
        grid-column: 1 / -1;
    }

    .form-row {
        display: grid;
        gap: 1.2rem;
        margin-bottom: 1rem;
    }

    .form-row.two-cols {
        grid-template-columns: 1fr 1fr;
    }

    .form-row.three-cols {
        grid-template-columns: 1fr 1fr 1fr;
    }

    label {
        display: block;
        font-size: 0.65rem;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--color-muted3);
        margin-bottom: 0.5rem;
    }

    input,
    select,
    textarea {
        width: 100%;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 0.7rem 0.9rem;
        color: var(--color-light);
        font-size: 0.9rem;
        outline: none;
        transition: all 0.3s ease;
        font-family: inherit;
    }

    /* Fix select options visibility in dark mode */
    select option {
        background-color: #1a1a2e;
        color: #ffffff;
    }

    input:focus,
    select:focus,
    textarea:focus {
        border-color: var(--color-lime);
        background: rgba(200, 245, 66, 0.02);
    }

    /* Image upload styles */
    .image-upload-section {
        border: 2px dashed rgba(200, 245, 66, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.3s ease;
        background: rgba(200, 245, 66, 0.02);
        cursor: pointer;
    }

    .image-upload-section:hover {
        border-color: var(--color-lime);
        background: rgba(200, 245, 66, 0.05);
    }

    .image-upload-section input[type="file"] {
        display: none;
    }

    .camera-icon {
        width: 48px;
        height: 48px;
        margin: 0 auto 0.8rem;
        color: var(--color-lime);
    }

    .upload-info {
        color: var(--color-muted3);
        font-size: 0.85rem;
        margin-top: 0.3rem;
    }

    .image-preview {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 0.8rem;
        margin-top: 1rem;
    }

    .image-preview-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
        aspect-ratio: 1;
    }

    .image-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .image-preview-item .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        transition: all 0.2s ease;
    }

    .image-preview-item .remove-btn:hover {
        background: rgba(255, 107, 43, 0.9);
    }

    .w-full {
        width: 100%;
        justify-content: center;
        padding: 1rem;
        margin-top: 1.2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .form-card {
            padding: 2rem;
        }

        .form-row.three-cols {
            grid-template-columns: 1fr 1fr;
        }

        .form-row.two-cols {
            grid-template-columns: 1fr;
        }

        .form-header h1 {
            font-size: 1.8rem;
        }

        .image-preview {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        }
    }

    @media (max-width: 480px) {
        .form-container {
            padding: 1rem;
        }

        .form-card {
            padding: 1.5rem;
            border-radius: 20px;
        }

        .form-row.three-cols {
            grid-template-columns: 1fr;
        }

        .form-header h1 {
            font-size: 1.5rem;
        }
    }
</style>

<script>
    // Handle image preview
    document.getElementById('images').addEventListener('change', function (e) {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';

        Array.from(this.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const item = document.createElement('div');
                item.className = 'image-preview-item';
                item.innerHTML = `
                    <img src="${event.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="remove-btn" onclick="removeImage(${index})">✕</button>
                `;
                preview.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    });

    function removeImage(index) {
        const input = document.getElementById('images');
        const dt = new DataTransfer();
        const { files } = input;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (index !== i) dt.items.add(file);
        }

        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Helper: convert File to base64 DataURL
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Handle form submission
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

        const locationUrl = document.getElementById('locationUrl').value.trim();

        // Validate URL format only if provided
        if (locationUrl) {
            try {
                new URL(locationUrl);
            } catch (error) {
                alert('Per favor, introdueix una URL de ubicació vàlida (o deixa el camp buit)');
                btn.innerText = 'Publicar Activitat';
                btn.disabled = false;
                return;
            }
        }

        // Convert images to base64
        const imageInput = document.getElementById('images');
        const imageFiles = imageInput.files ? Array.from(imageInput.files) : [];
        let imagesBase64 = [];
        if (imageFiles.length > 0) {
            btn.innerText = 'Processant imatges...';
            try {
                imagesBase64 = await Promise.all(imageFiles.map(f => fileToBase64(f)));
            } catch (err) {
                console.error('Error convertint imatges:', err);
                alert('Error en processar les imatges. Prova de nou.');
                btn.innerText = 'Publicar Activitat';
                btn.disabled = false;
                return;
            }
        }

        btn.innerText = 'Publicant...';

        const payload = {
            title: document.getElementById('title').value,
            sport: document.getElementById('sport').value,
            level: document.getElementById('level').value,
            date: document.getElementById('date').value,
            maxParticipants: parseInt(document.getElementById('maxParticipants').value),
            location: {
                address: document.getElementById('address').value,
                url: locationUrl
            },
            description: document.getElementById('description').value,
            images: imagesBase64
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
            alert('Error en conectar amb el servidor');
        } finally {
            btn.innerText = 'Publicar Activitat';
            btn.disabled = false;
        }
    };
</script>

<?php include "../partials/footer.php"; ?>