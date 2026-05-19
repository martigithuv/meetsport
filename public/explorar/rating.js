// ── RATING FUNCTIONALITY ──────────────────────────────────────────────
// Esta función debe ser agregada al script de explorar

const showRatingModal = async (activity, currentUser) => {
    const modalContainer = document.getElementById('modal-container');
    const now = new Date();
    const isFinished = new Date(activity.date) < now;
    
    if (!isFinished) {
        alert('Esta actividad aún no ha finalizado. Podrás valorarla cuando termine.');
        return;
    }

    // Verificar si el usuario está inscrito en la actividad
    const enrolled = activity.participants?.some(p => p === currentUser._id || p._id === currentUser._id);
    if (!enrolled) {
        alert('Solo usuarios inscritos pueden valorar.');
        return;
    }

    const participants = activity.participants || [];
    let participantsHTML = '';
    
    participants.forEach((participant, idx) => {
        const pId = participant._id || participant;
        const pName = participant.name || `Participante ${idx + 1}`;
        participantsHTML += `
            <div style="margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <h4 style="font-weight: 700; margin-bottom: 1rem;">${pName}</h4>
                <div class="rating-form">
                    <div class="rating-form-section">
                        <div class="rating-form-label">Valoración</div>
                        <div class="stars-rating" id="stars-${pId}">
                            <span class="star" data-value="1" onclick="selectStar(this, '${pId}')">⭐</span>
                            <span class="star" data-value="2" onclick="selectStar(this, '${pId}')">⭐</span>
                            <span class="star" data-value="3" onclick="selectStar(this, '${pId}')">⭐</span>
                            <span class="star" data-value="4" onclick="selectStar(this, '${pId}')">⭐</span>
                            <span class="star" data-value="5" onclick="selectStar(this, '${pId}')">⭐</span>
                        </div>
                    </div>
                    <div class="rating-form-section">
                        <div class="rating-form-label">Comentario (opcional)</div>
                        <textarea class="rating-comment" id="comment-${pId}" placeholder="Comparte tu experiencia..."></textarea>
                    </div>
                </div>
            </div>
        `;
    });

    modalContainer.innerHTML = `
        <div class="modal-content" style="max-height: 95vh; overflow-y: auto;">
            <button class="close-modal">&times;</button>
            <h2 class="font-display" style="font-size: 2rem; margin-bottom: 1rem;">Valorar Actividad</h2>
            <p style="color: var(--color-muted); margin-bottom: 2rem;">Valora a los participantes de esta actividad finalizada.</p>
            <div id="ratings-container">
                ${participantsHTML}
            </div>
            <div class="rating-buttons">
                <button class="btn-submit-rating" onclick="submitRatings('${activity._id}', '${currentUser._id}')">
                    Enviar Valoraciones
                </button>
                <button class="btn-cancel-rating" onclick="document.getElementById('modal-container').classList.add('hidden')">
                    Cancelar
                </button>
            </div>
        </div>
    `;

    modalContainer.classList.remove('hidden');
    modalContainer.querySelector('.close-modal').onclick = () => modalContainer.classList.add('hidden');
};

const selectStar = (element, participantId) => {
    const container = element.parentElement;
    const stars = container.querySelectorAll('.star');
    const value = element.getAttribute('data-value');
    
    stars.forEach((star, idx) => {
        if (idx < value) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    element.parentElement.setAttribute('data-rating', value);
};

const submitRatings = async (activityId, currentUserId) => {
    const modalContainer = document.getElementById('modal-container');
    const container = document.getElementById('ratings-container');
    const activities = window.activities || [];
    const activity = activities.find(a => a._id === activityId);
    
    if (!activity) {
        alert('Error: actividad no encontrada');
        return;
    }

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const token = currentUser?.token;

    if (!token) {
        alert('Cal iniciar sessió');
        window.location.href = '../login/login.php';
        return;
    }

    const participants = activity.participants || [];
    const ratings = [];

    // Recopilar todas las valoraciones
    for (const participant of participants) {
        const pId = participant._id || participant;
        const starsContainer = document.getElementById(`stars-${pId}`);
        const commentElement = document.getElementById(`comment-${pId}`);
        
        const rating = starsContainer?.getAttribute('data-rating');
        const comment = commentElement?.value || '';

        if (rating) {
            ratings.push({
                activityId,
                recipientId: pId,
                ratingValue: parseInt(rating),
                comment
            });
        }
    }

    if (ratings.length === 0) {
        alert('Por favor, valora al menos a un participante');
        return;
    }

    try {
        const submitBtn = document.querySelector('.btn-submit-rating');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando...';

        // Enviar todas las valoraciones
        for (const ratingData of ratings) {
            const response = await fetch('http://localhost:5000/api/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ratingData)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Error en valoración:', error);
            }
        }

        alert('¡Valoraciones enviadas correctamente!');
        modalContainer.classList.add('hidden');
        
        // Recargar actividades
        if (window.fetchActivities) {
            window.fetchActivities();
        }
    } catch (err) {
        console.error('Error enviando valoraciones:', err);
        alert('Error al enviar valoraciones');
    }
};
