import React from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Check, X, Zap, Crown, Search, ShieldCheck, Heart, Paperclip, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Premium = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleActivatePremium = async () => {
    if (user.isPremium) {
      showToast('Ja disposes del pla Premium! Gaudeix dels teus avantatges.', 'info');
      return;
    }

    try {
      const response = await api.post('/stripe/create-checkout-session');
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        showToast('Error al processar el pagament', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Hubo un error al procesar el pago', 'error');
    }
  };

  const handleCancelPremium = async () => {
    if (window.confirm("Estàs segur que vols cancel·lar el teu pla Premium? Perdràs l'accés a tots els avantatges exclusius de manera immediata.")) {
      try {
        const response = await api.post('/stripe/cancel-premium');
        if (response.data.success) {
          showToast('Has cancel·lat el teu pla Premium.', 'success');
          // Wait briefly for the toast to appear, then reload so the context updates
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (err) {
        console.error(err);
        showToast('Error al cancel·lar el pla', 'error');
      }
    }
  };

  return (
    <div className="premium-page py-10 md:py-20 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] animate-fade-in overflow-x-hidden">
      <header className="text-center mb-16 px-4">
        <h1 className="font-display text-5xl md:text-7xl mb-6 tracking-tight">Plans <span className="text-lime">Premium</span></h1>
        <p className="text-muted3 text-xl opacity-80 max-w-2xl mx-auto">Desbloqueja tot el potencial de MeetSport i porta la teva experiència esportiva al següent nivell.</p>
      </header>

      <div className="w-full max-w-[1400px] px-4 md:px-12">
        <div className="premium-plans-grid">
          
          {/* Free Plan */}
          <div 
            className="flex flex-col p-8 lg:p-16 bg-dark2 border border-white/5 shadow-2xl relative transition-all hover:border-white/10 group premium-plan-card"
          >
            <div>
              <div className="mb-10 lg:mb-12">
                <div className="font-display text-3xl lg:text-4xl font-bold mb-4">Free</div>
                <div className="text-5xl lg:text-7xl font-black text-white">0€<span className="text-xl lg:text-2xl text-muted3 font-normal">/mes</span></div>
              </div>

              <ul className="space-y-6 lg:space-y-8 mb-14">
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl"><Check size={28} className="text-lime flex-shrink-0" /> Crear activitats il·limitades</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl"><Check size={28} className="text-lime flex-shrink-0" /> Cerca bàsica</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl"><Check size={28} className="text-lime flex-shrink-0" /> Match estàndard</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl text-muted3/30"><X size={28} className="text-red-500/50 flex-shrink-0" /> Destacar activitats</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl text-muted3/40"><X size={28} className="text-red-500/50 flex-shrink-0" /> Afegir a preferits activitats</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl text-muted3/40"><X size={28} className="text-red-500/50 flex-shrink-0" /> Enviar imatges i fitxers pel xat</li>
              </ul>
            </div>

            <button 
              onClick={user?.isPremium ? handleCancelPremium : undefined}
              className={`mt-auto self-center py-4 px-10 lg:px-14 font-bold border text-base lg:text-xl uppercase tracking-widest w-full sm:w-auto transition-all ${user?.isPremium ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 cursor-pointer' : 'bg-white/5 text-muted3 border-white/5 cursor-not-allowed'}`} 
              style={{ borderRadius: '24px', marginTop: '40px' }}
              disabled={!user?.isPremium}
            >
              {user?.isPremium ? 'Tornar al Pla Free' : 'Pla actual (Actiu)'}
            </button>
          </div>

          {/* Premium Plan */}
          <div 
            className="flex flex-col p-8 lg:p-16 bg-dark2 border border-lime/30 relative overflow-hidden shadow-[0_0_120px_rgba(200,245,66,0.15)] transition-all hover:scale-[1.02] hover:border-lime/60 group premium-plan-card"
          >
            <div className="absolute top-0 right-0 bg-lime text-dark text-xs lg:text-sm font-black px-8 py-4 uppercase tracking-[0.2em] shadow-2xl z-10" style={{ borderBottomLeftRadius: '30px' }}>
              Recomanat
            </div>

            <div>
              <div className="mb-10 lg:mb-12 mt-4 lg:mt-0">
                <div className="font-display text-3xl lg:text-4xl font-bold text-orange mb-4 flex items-center gap-4">
                  Premium <Crown size={36} className="animate-pulse" />
                </div>
                <div className="text-5xl lg:text-7xl font-black text-white">9.99€<span className="text-xl lg:text-2xl text-muted3 font-normal">/mes</span></div>
              </div>

              <ul className="space-y-6 lg:space-y-8 mb-14">
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl font-bold"><Check size={28} className="text-lime flex-shrink-0" /> Tot el pla Free</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl font-bold"><Zap size={28} className="text-orange flex-shrink-0" /> Destacar activitats</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl font-bold"><Heart size={28} className="text-orange flex-shrink-0" /> Afegir a preferits activitats</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl font-bold"><Paperclip size={28} className="text-orange flex-shrink-0" /> Enviar imatges i fitxers pel xat</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl font-bold"><Search size={28} className="text-orange flex-shrink-0" /> Filtres avançats</li>
                <li className="flex items-center gap-4 lg:gap-6 text-lg lg:text-2xl font-bold"><Eye size={28} className="text-orange flex-shrink-0" /> Veure visites al perfil</li>
              </ul>
            </div>

            <button
              onClick={handleActivatePremium}
              className={`mt-auto self-center py-4 px-10 lg:px-14 font-black transition-all text-base lg:text-xl uppercase tracking-widest w-full sm:w-auto ${user?.isPremium ? 'bg-white/5 text-lime border border-white/5 cursor-not-allowed' : 'bg-orange text-white shadow-2xl shadow-orange/40 hover:bg-orange/90 hover:shadow-orange/60 active:scale-[0.98]'}`}
              style={{ borderRadius: '24px', marginTop: '40px' }}
              disabled={user?.isPremium}
            >
              {user?.isPremium ? 'Pla actual (Actiu)' : 'Activar Premium'}
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center mt-24 opacity-40 px-6">
        <p className="text-sm lg:text-base text-muted3 max-w-lg mx-auto leading-relaxed">
          Cancel·la en qualsevol moment des del teu perfil. <br /> 
          Transaccions segures processades per Stripe amb seguretat de nivell bancari.
        </p>
      </footer>
    </div>
  );
};

export default Premium;
