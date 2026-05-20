import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Camera, User, Activity, Star, Award, Trophy, Eye,
  Users as UsersIcon, LogOut, ShieldCheck,
  MapPin, Calendar, X, Check, Trash2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

/* ── Helpers ── */
const UserChip = ({ u }) => (
  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
    <div className="w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center text-lime font-bold overflow-hidden border border-lime/20">
      {u.avatar
        ? <img src={u.avatar} className="w-full h-full object-cover" alt={u.name} />
        : (u.name?.[0] || '?')}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-sm truncate flex items-center gap-1">
        {u.name} 
        {u.isPremium && <Star size={10} className="fill-orange text-orange" />}
      </div>
      <div className="text-xs text-muted3 truncate">{u.email}</div>
    </div>
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
    <div className="text-5xl opacity-20">{icon}</div>
    <p className="text-muted3 text-sm font-medium">{text}</p>
  </div>
);

/* ── Main Component ── */
const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab]       = useState('dades');
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [tabLoading, setTabLoading]     = useState(false);
  const [profileData, setProfileData]   = useState({ name: '', bio: '' });

  // Tab data
  const [activities, setActivities]     = useState([]);
  const [enrollments, setEnrollments]   = useState([]);
  const [favorites, setFavorites]       = useState([]);
  const [ratings, setRatings]           = useState([]);
  const [followers, setFollowers]       = useState([]);
  const [profileViews, setProfileViews] = useState([]);

  // Rating flow states
  const [ratingFlow, setRatingFlow] = useState({
    isOpen: false,
    activityId: null,
    participants: [],
    currentIndex: 0
  });
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Change password states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  /* ── Fetch base stats (always) ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/users/stats');
      setStats(res.data);
      setProfileData({ 
        name: res.data.name, 
        bio: res.data.profileDetails?.bio || '' 
      });
      setFollowers(res.data.followers || []);
      setProfileViews(res.data.profileViews || []);
    } catch (err) { console.error("Error fetching stats:", err); }
  }, []);

  /* ── Fetch on mount ── */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await fetchStats();
        const [actsRes, enrollRes] = await Promise.all([
          api.get('/activities/my'),
          api.get('/enrollments/my'),
        ]);
        setActivities(actsRes.data);
        setEnrollments(enrollRes.data);
      } catch (err) { console.error("Error init profile:", err); }
      finally { setLoading(false); }
    };
    init();
  }, [fetchStats]);

  // Auto-trigger badge unlock notifications when conditions are met
  useEffect(() => {
    if (!stats || loading) return;

    if (activities.length >= 30) {
      api.post('/users/badge-notification', { badgeType: 'MEDAL' })
        .catch(err => console.error("Error sending Medal notification:", err));
    }

    if (stats.total_points >= 8000) {
      api.post('/users/badge-notification', { badgeType: 'STAR' })
        .catch(err => console.error("Error sending Star notification:", err));
    }
  }, [activities.length, stats?.total_points, loading, stats]);

  // Check for rate query parameter in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rateActivityId = params.get('rate');
    if (rateActivityId) {
      handleStartRatingFlow(rateActivityId);
      // Clean query parameter from address bar
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleStartRatingFlow = async (activityId) => {
    try {
      setTabLoading(true);
      const response = await api.get(`/activities/${activityId}/participants`);
      const participantsList = response.data;
      
      // Filter out the logged-in user so they only rate others
      const others = participantsList.filter(p => p._id !== user._id);
      
      if (others.length > 0) {
        setRatingFlow({
          isOpen: true,
          activityId,
          participants: others,
          currentIndex: 0
        });
        setRatingValue(5);
        setRatingComment('');
      } else {
        showToast('No hi ha altres participants per valorar en aquesta activitat!', 'info');
      }
    } catch (err) {
      console.error(err);
      alert('Error al carregar els participants per a la valoració');
    } finally {
      setTabLoading(false);
    }
  };

  const handleFinalizeActivity = async (activityId) => {
    if (!window.confirm('Segur que vols finalitzar aquesta activitat? Això tancarà les inscripcions i s\'obriran les valoracions dels participants.')) return;
    try {
      setTabLoading(true);
      await api.put(`/activities/${activityId}/finalize`);
      
      // Refresh my activities to reflect "FINALITZADA" status
      const actsRes = await api.get('/activities/my');
      setActivities(actsRes.data);
      
      // Start rating flow automatically for the creator
      await handleStartRatingFlow(activityId);
      
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error al finalitzar l\'activitat', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (submittingRating) return;
    
    const currentParticipant = ratingFlow.participants[ratingFlow.currentIndex];
    setSubmittingRating(true);
    
    try {
      await api.post('/ratings', {
        activityId: ratingFlow.activityId,
        recipientId: currentParticipant._id,
        ratingValue,
        comment: ratingComment
      });
      
      // Move to next or finish
      if (ratingFlow.currentIndex + 1 < ratingFlow.participants.length) {
        setRatingFlow({
          ...ratingFlow,
          currentIndex: ratingFlow.currentIndex + 1
        });
        setRatingValue(5);
        setRatingComment('');
      } else {
        showToast('Totes les valoracions s\'han enviat correctament! Moltes gràcies.', 'success');
        setRatingFlow({ isOpen: false, activityId: null, participants: [], currentIndex: 0 });
        
        // Refresh base user stats & ratings list if open
        fetchStats();
        if (activeTab === 'valoracions') {
          setTabLoading(true);
          api.get(`/ratings/user/${user._id}`)
            .then(r => setRatings(r.data.ratings || []))
            .catch(err => console.error(err))
            .finally(() => setTabLoading(false));
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error al enviar la valoració', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (changingPassword) return;

    if (!newPassword || !repeatPassword) {
      showToast('Tots els camps són obligatoris', 'warning');
      return;
    }

    if (newPassword !== repeatPassword) {
      showToast('Hi ha hagut un error, torna-ho a intentar', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('La contrasenya ha de tenir almenys 6 caràcters', 'warning');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/users/change-password', {
        newPassword,
        confirmPassword: repeatPassword
      });
      showToast('S\'ha canviat la contrasenya correctament', 'success');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setRepeatPassword('');
    } catch (err) {
      console.error(err);
      showToast('Hi ha hagut un error, torna-ho a intentar', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  /* ── Lazy load tabs ── */
  useEffect(() => {
    if (activeTab === 'favorits' && user.isPremium) {
      setTabLoading(true);
      api.get('/activities/favorites')
        .then(r => setFavorites(r.data))
        .catch(err => console.error("Error favorites:", err))
        .finally(() => setTabLoading(false));
    }
    if (activeTab === 'valoracions') {
      setTabLoading(true);
      api.get(`/ratings/user/${user._id}`)
        .then(r => setRatings(r.data.ratings || []))
        .catch(err => console.error("Error ratings:", err))
        .finally(() => setTabLoading(false));
    }
    // Scroll to content top when tab changes
    const content = document.getElementById('profile-tabs-content');
    if (content) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeTab, user._id, user.isPremium]);

  /* ── Actions ── */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', profileData);
      showToast('Perfil actualitzat correctament!', 'success');
      fetchStats();
    } catch (err) { 
      showToast(err.response?.data?.message || 'Error al actualitzar el perfil', 'error'); 
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await api.put('/users/profile', { avatar: ev.target.result });
        fetchStats();
      } catch { showToast("Error pujant l'avatar", 'error'); }
    };
    reader.readAsDataURL(file);
  };

  const handleCancelEnrollment = async (activityId) => {
    if (!window.confirm('Segur que vols cancel·lar la teva inscripció a aquesta activitat?')) return;
    
    try {
      // Use both possible IDs if one fails, but backend should accept activityId
      await api.delete(`/enrollments/${activityId}`);
      setEnrollments(prev => prev.filter(e => e._id !== activityId));
      showToast('Inscripció cancel·lada correctament', 'success');
    } catch (err) {
      console.error("Cancel error:", err);
      showToast(err.response?.data?.message || 'Error cancel·lant la inscripció', 'error');
    }
  };

  const handleRemoveFavorite = async (activityId) => {
    try {
      await api.post(`/users/favorites/${activityId}`);
      setFavorites(prev => prev.filter(a => a._id !== activityId));
      
      const newFavorites = (user.favorites || []).filter(favId => favId !== activityId);
      updateUser({ favorites: newFavorites });
      
      showToast("L'activitat s'ha eliminat de preferits", 'success');
    } catch { 
      showToast('Error eliminant de preferits', 'error'); 
    }
  };

  /* ── Loading ── */
  if (loading && !stats) {
    return <div className="loader h-screen flex items-center justify-center"><div className="spinner w-12 h-12 border-4 border-lime border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const tabs = [
    { id: 'dades',       label: 'Dades',              icon: <User size={16} /> },
    { id: 'activitats',  label: 'Activitats',         icon: <Activity size={16} /> },
    { id: 'inscripcions',label: 'Inscripcions',        icon: <ShieldCheck size={16} /> },
    { id: 'insignies',   label: 'Insígnies',          icon: <Trophy size={16} /> },
    { id: 'valoracions', label: 'Valoracions',         icon: <Award size={16} /> },
    { id: 'seguidors',   label: 'Seguidors',           icon: <UsersIcon size={16} /> },
    ...(user.isPremium ? [
      { id: 'favorits', label: 'Preferits', icon: <Star size={16} /> },
      { id: 'visites',  label: 'Visites',   icon: <Eye size={16} /> },
    ] : []),
  ];

  const TabLoader = () => (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="spinner w-10 h-10 border-4 border-lime border-t-transparent rounded-full animate-spin"></div>
      <p className="text-muted3 text-sm animate-pulse">Carregant dades...</p>
    </div>
  );

  return (
    <>
      <div className="profile-page animate-fade-in pb-20 overflow-x-hidden">
      {/* Premium Banner */}
      <div className="h-64 bg-gradient-to-br from-dark3 via-dark2 to-dark3 relative rounded-b-[60px] shadow-2xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(200,245,66,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-lime/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4" style={{ marginTop: '-120px' }}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-10 mb-12">
          {/* Avatar with Ring */}
          <div className="relative group">
            <div className={`w-40 h-40 rounded-[48px] overflow-hidden border-4 ${user.isPremium ? 'border-orange shadow-[0_0_30px_rgba(255,107,43,0.3)]' : 'border-lime shadow-[0_0_30px_rgba(200,245,66,0.2)]'} bg-dark2 transition-transform duration-500 group-hover:scale-105`}>
              {stats?.profileDetails?.avatar
                ? <img src={stats.profileDetails.avatar} className="w-full h-full object-cover" alt="Profile" />
                : <div className="flex items-center justify-center h-full text-6xl">🧑‍🦱</div>}
            </div>
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-[40px] text-white backdrop-blur-sm">
              <Camera size={28} className="mb-2" />
              <span className="text-[10px] font-bold tracking-widest">CANVIAR FOTO</span>
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* Identity & Stats */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
              <h1 className="font-display text-4xl font-black text-white tracking-tight">{stats?.name}</h1>
              {user.isPremium && (
                <span className="bg-gradient-to-r from-orange to-red-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-orange/20 uppercase tracking-widest">PREMIUM PRO</span>
              )}
            </div>
            <p className="text-muted3 text-lg font-medium opacity-80 mb-6">@{stats?.email?.split('@')[0]} · {stats?.profileDetails?.bio || 'Sense biografia'}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-white/5 backdrop-blur-xl px-8 py-4 rounded-[28px] border border-white/10 flex gap-10">
                {[
                  { val: stats?.followersCount || 0, label: 'FOLLOWERS' },
                  { val: stats?.followingCount || 0, label: 'FOLLOWING' },
                  { val: stats?.total_points || 0, label: 'PUNTS', color: 'text-lime' }
                ].map(s => (
                  <div key={s.label} className="text-center group cursor-default">
                    <div className={`text-3xl font-black transition-transform group-hover:scale-110 ${s.color || 'text-white'}`}>{s.val}</div>
                    <div className="text-[9px] text-muted3 font-black tracking-[0.2em] mt-1 opacity-60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sticky top-24 z-20 mb-12">
          <div className="bg-dark2/80 backdrop-blur-2xl p-2 rounded-[32px] border border-white/5 shadow-2xl flex gap-2 overflow-x-auto no-scrollbar w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-[24px] whitespace-nowrap text-sm font-black transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-lime text-dark shadow-xl shadow-lime/20 scale-105' 
                    : 'text-muted3 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={activeTab === tab.id ? 'scale-110' : 'opacity-60'}>{tab.icon}</span>
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div id="profile-tabs-content" className="min-h-[500px] animate-fade-in-up">
          {/* ── Tab: Insígnies ── */}
          {activeTab === 'insignies' && (
            <div className="bg-dark2 p-12 md:p-16 rounded-[40px] border border-white/5 shadow-2xl flex flex-col items-center justify-center min-h-[450px]">
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl font-black text-white tracking-tight mb-2">LES TEVES INSÍGNIES</h2>
                <p className="text-muted3 text-sm font-medium opacity-60">Supera reptes per desbloquejar assoliments únics i destacar a la comunitat.</p>
              </div>

              <div className="flex flex-col md:flex-row items-stretch justify-center gap-10 w-full max-w-4xl">
                {/* Badge 1: Medal */}
                {(() => {
                  const isUnlocked = activities.length >= 30;
                  return (
                    <div className="flex-1 bg-white/5 backdrop-blur-xl p-8 rounded-[36px] border border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col items-center justify-between text-center gap-6 relative overflow-hidden group">
                      {isUnlocked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-transparent pointer-events-none"></div>
                      )}
                      
                      {/* Icon Container */}
                      <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 ${
                        isUnlocked 
                          ? 'bg-orange/20 border-2 border-orange/40 text-orange shadow-[0_0_40px_rgba(255,107,43,0.4)] animate-[pulse_2s_infinite_ease-in-out] scale-105' 
                          : 'bg-white/5 border border-white/10 text-white/20 grayscale opacity-40'
                      }`}>
                        <Award size={48} className={isUnlocked ? 'fill-orange/20 animate-[spin_20s_infinite_linear]' : ''} />
                      </div>

                      {/* Text details */}
                      <div className="space-y-3">
                        <h3 className={`font-black text-xl tracking-tight transition-colors duration-300 ${isUnlocked ? 'text-orange' : 'text-white/40'}`}>
                          🏅 MEDALLA D'ORGANITZADOR
                        </h3>
                        <p className="text-sm text-muted3 leading-relaxed px-2">
                          {isUnlocked 
                            ? 'Ja has publicat 30 activitats.' 
                            : 'Desbloquejaràs aquesta medalla quan aconsegueixis publicar 30 activitats.'}
                        </p>
                      </div>

                      {/* Progress Bar / Indicator */}
                      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5 mt-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isUnlocked ? 'bg-orange shadow-[0_0_10px_rgba(255,107,43,0.8)]' : 'bg-white/20'}`}
                          style={{ width: `${Math.min((activities.length / 30) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] font-black text-muted3/60 tracking-widest uppercase">
                        PROGRÉS: {activities.length} / 30 ACTIVITATS
                      </div>
                    </div>
                  );
                })()}

                {/* Badge 2: Star */}
                {(() => {
                  const isUnlocked = (stats?.total_points || 0) >= 8000;
                  return (
                    <div className="flex-1 bg-white/5 backdrop-blur-xl p-8 rounded-[36px] border border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col items-center justify-between text-center gap-6 relative overflow-hidden group">
                      {isUnlocked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-lime/5 to-transparent pointer-events-none"></div>
                      )}
                      
                      {/* Icon Container */}
                      <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 ${
                        isUnlocked 
                          ? 'bg-lime/20 border-2 border-lime/40 text-lime shadow-[0_0_40px_rgba(200,245,66,0.4)] animate-[pulse_2s_infinite_ease-in-out] scale-105' 
                          : 'bg-white/5 border border-white/10 text-white/20 grayscale opacity-40'
                      }`}>
                        <Star size={48} className={isUnlocked ? 'fill-lime/20 animate-[pulse_3s_infinite_ease-in-out]' : ''} />
                      </div>

                      {/* Text details */}
                      <div className="space-y-3">
                        <h3 className={`font-black text-xl tracking-tight transition-colors duration-300 ${isUnlocked ? 'text-lime' : 'text-white/40'}`}>
                          ⭐ ESTRELLA DE PUNTS
                        </h3>
                        <p className="text-sm text-muted3 leading-relaxed px-2">
                          {isUnlocked 
                            ? 'Ja has arribat als 8000 punts.' 
                            : 'Aconseguiràs l\'estrella quan aconsegueixis els 8000 punts.'}
                        </p>
                      </div>

                      {/* Progress Bar / Indicator */}
                      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5 mt-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isUnlocked ? 'bg-lime shadow-[0_0_10px_rgba(200,245,66,0.8)]' : 'bg-white/20'}`}
                          style={{ width: `${Math.min(((stats?.total_points || 0) / 8000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] font-black text-muted3/60 tracking-widest uppercase">
                        PROGRÉS: {stats?.total_points || 0} / 8000 PUNTS
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ── Tab: Dades ── */}
          {activeTab === 'dades' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-dark2 p-10 rounded-[40px] border border-white/5 shadow-xl">
                <h2 className="font-display text-2xl font-black mb-8 flex items-center gap-3">
                  <User className="text-lime" /> Informació del Perfil
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="form-group">
                      <label className="text-[10px] font-black tracking-[0.2em] text-muted3 mb-3 block uppercase">Nom Complet</label>
                      <input type="text" className="input-dark w-full bg-white/5 border-white/10 rounded-2xl p-4 text-white focus:border-lime transition-all" value={profileData.name}
                        onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="text-[10px] font-black tracking-[0.2em] text-muted3 mb-3 block uppercase">Email (Privat)</label>
                      <input type="email" className="input-dark w-full bg-white/5 border-white/10 rounded-2xl p-4 text-muted3 cursor-not-allowed" value={stats?.email} disabled />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="text-[10px] font-black tracking-[0.2em] text-muted3 mb-3 block uppercase">Biografia</label>
                    <textarea className="input-dark w-full bg-white/5 border-white/10 rounded-2xl p-4 text-white focus:border-lime transition-all min-h-[150px] resize-none" value={profileData.bio}
                      placeholder="Explica una mica sobre tu i els esports que t'agraden..."
                      onChange={e => setProfileData({ ...profileData, bio: e.target.value })} />
                  </div>
                  <div className="flex justify-center mt-8">
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ maxWidth: '180px', width: '100%', padding: '12px 20px', fontSize: '16px', fontWeight: '900' }}
                    >
                      GUARDAR CANVIS
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-8">
                <div className="bg-dark2 p-10 rounded-[40px] border border-white/5 shadow-xl">
                  <h2 className="font-display text-xl font-black mb-6">Seguretat</h2>
                  <button onClick={() => setIsPasswordModalOpen(true)} className="w-full py-4 rounded-2xl border border-white/10 text-sm font-bold text-white hover:bg-white/5 transition-all mb-4">
                    CANVIAR CONTRASENYA
                  </button>
                  <button onClick={logout} className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                    <LogOut size={16} /> TANCAR SESSIÓ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Activitats (Creades) ── */}
          {activeTab === 'activitats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {activities.length > 0 ? activities.map((act, index) => (
                <div key={`${act._id || index}-${index}`} className="bg-dark2 p-8 rounded-[40px] border border-white/5 flex flex-col gap-4 group hover:border-lime/30 transition-all duration-500 hover:-translate-y-2 shadow-xl">
                  <div className="flex justify-between items-center">
                    <span className="bg-lime/10 text-lime text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">{act.sport}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${act.status === 'FINALITZADA' ? 'bg-orange animate-pulse' : 'bg-lime animate-pulse'}`}></div>
                      <span className="text-[10px] font-black text-muted3 tracking-widest">{act.status}</span>
                    </div>
                  </div>
                  <h3 className="font-black text-xl text-white group-hover:text-lime transition-colors">{act.title}</h3>
                  <p className="text-sm text-muted3 line-clamp-2 leading-relaxed opacity-60">
                    {act.description}
                  </p>
                  <div className="flex items-center gap-4 mt-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted3">
                      <Calendar size={14} className="text-lime" />
                      {new Date(act.date).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted3">
                      <UsersIcon size={14} className="text-lime" />
                      {act.participantsCount} participants
                    </div>
                  </div>
                  {act.status !== 'FINALITZADA' && (
                    <button
                      onClick={() => handleFinalizeActivity(act._id)}
                      className="w-full mt-4 py-3 rounded-2xl bg-orange/10 text-orange border border-orange/20 hover:bg-orange hover:text-white transition-all duration-300 font-black text-xs tracking-widest flex items-center justify-center gap-2 uppercase cursor-pointer"
                    >
                      ⭐ Finalitzar activitat
                    </button>
                  )}
                </div>
              )) : <EmptyState icon="🏃" text="Encara no has creat cap activitat. Anima't a organitzar-ne una!" />}
            </div>
          )}

          {/* ── Tab: Inscripcions ── */}
          {activeTab === 'inscripcions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {enrollments.length > 0 ? enrollments.map((enr, index) => {
                const act = enr.activity || enr;
                const actId = act._id || enr.activity;
                const actDate = act.date ? new Date(act.date) : null;
                const isFinished = actDate && actDate < new Date();
                
                return (
                  <div key={`${enr._id || index}-${index}`} className="bg-dark2 p-8 rounded-[40px] border relative overflow-hidden group transition-all duration-500 hover:shadow-2xl"
                    style={{ borderColor: isFinished ? 'rgba(255,255,255,0.05)' : 'rgba(200,245,66,0.1)' }}>
                    
                    {/* Visual bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${isFinished ? 'bg-muted3/20' : 'bg-gradient-to-r from-lime to-transparent'}`}></div>

                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div>
                        <span className="bg-white/5 text-muted3 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest mb-3 inline-block">
                          {act.sport || 'Esport'}
                        </span>
                        <h3 className="font-black text-2xl text-white group-hover:text-lime transition-colors">{act.title || 'Activitat'}</h3>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        isFinished ? 'bg-red-500/10 text-red-500 shadow-red-500/10' : 'bg-lime/10 text-lime shadow-lime/10'
                      }`}>
                        {isFinished ? 'FINALITZADA' : 'ACTIVA'}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {actDate && (
                        <div className="flex items-center gap-3 text-sm text-muted3">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-lime"><Calendar size={16} /></div>
                          <span className="font-medium">{actDate.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                      )}
                      {act.location?.address && (
                        <div className="flex items-center gap-3 text-sm text-muted3">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-lime"><MapPin size={16} /></div>
                          <span className="font-medium truncate">{act.location.address}</span>
                        </div>
                      )}
                    </div>

                    {!isFinished && (
                      <button
                        onClick={() => handleCancelEnrollment(actId)}
                        className="w-full py-4 rounded-2xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-xs tracking-widest flex items-center justify-center gap-3 uppercase"
                      >
                        <Trash2 size={16} /> Cancel·lar inscripció
                      </button>
                    )}
                  </div>
                );
              }) : <EmptyState icon="📋" text="No estàs inscrit a cap activitat ara mateix." />}
            </div>
          )}

          {/* ── Tab: Valoracions ── */}
          {activeTab === 'valoracions' && (
            tabLoading ? <TabLoader /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {ratings.length > 0 ? ratings.map((r, i) => (
                  <div key={r._id || i} className="bg-dark2 p-8 rounded-[40px] border border-white/5 shadow-xl hover:border-orange/20 transition-all duration-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center text-orange font-bold overflow-hidden border border-orange/20 shadow-lg">
                          {r.rater?.avatar
                            ? <img src={r.rater.avatar} className="w-full h-full object-cover" alt="" />
                            : <span className="text-xl">{r.rater?.name?.[0] || '?'}</span>}
                        </div>
                        <div>
                          <div className="font-black text-lg text-white">{r.rater?.name || 'Usuari'}</div>
                          <div className="text-[10px] text-muted3 font-black tracking-widest uppercase opacity-60">{r.activity?.title || r.activityTitle || 'Activitat'}</div>
                        </div>
                      </div>
                      <div className="flex bg-white/5 p-2 rounded-xl border border-white/5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star 
                            key={s} 
                            size={16} 
                            className={s <= (r.ratingValue || r.score) ? 'fill-orange text-orange' : 'text-white/10'} 
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <div className="relative">
                        <div className="absolute -top-4 -left-2 text-4xl text-orange/10 font-serif">“</div>
                        <p className="text-sm text-muted3 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5 italic">
                          {r.comment}
                        </p>
                      </div>
                    )}
                    <div className="text-[9px] text-muted3 mt-6 font-black tracking-widest opacity-40 text-right">
                      PUBLICAT EL {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ca-ES').toUpperCase() : ''}
                    </div>
                  </div>
                )) : <EmptyState icon="⭐" text="Encara no has rebut cap valoració. Participa en activitats per guanyar reputació!" />}
              </div>
            )
          )}

          {/* ── Tab: Seguidors ── */}
          {activeTab === 'seguidors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {followers.length > 0
                ? followers.map((f, idx) => <UserChip key={`${f._id || idx}-${idx}`} u={f} />)
                : <EmptyState icon="👥" text="Encara no tens seguidors. Sigues actiu a la comunitat per fer amics!" />}
            </div>
          )}

          {/* ── Tab: Preferits (Premium) ── */}
          {activeTab === 'favorits' && (
            tabLoading ? <TabLoader /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {favorites.length > 0 ? favorites.map((act, index) => (
                  <div 
                    key={`${act._id || index}-${index}`} 
                    className="bg-dark2 p-8 rounded-[40px] border border-white/5 group hover:border-orange/30 transition-all duration-500 shadow-xl overflow-hidden"
                    style={{ position: 'relative' }}
                  >
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '4px', 
                        height: '100%', 
                        backgroundColor: 'var(--color-orange, #ff6b2b)', 
                        opacity: 0.4 
                      }}
                    ></div>
                    
                    <button
                      onClick={() => handleRemoveFavorite(act._id)}
                      className="group"
                      style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 107, 43, 0.1)',
                        color: 'var(--color-orange, #ff6b2b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'all 0.3s ease'
                      }}
                      title="Treure de preferits"
                    >
                      <X size={18} />
                    </button>
                    
                    <div className="mb-4">
                      <span className="bg-orange/10 text-orange text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest mb-3 inline-block">
                        {act.sport}
                      </span>
                      <h3 className="font-black text-xl text-white group-hover:text-orange transition-colors">{act.title}</h3>
                    </div>
                    
                    <p className="text-sm text-muted3 line-clamp-3 leading-relaxed mb-6 opacity-60">
                      {act.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                      {act.date && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted3 tracking-widest uppercase">
                          <Calendar size={14} className="text-orange" />
                          {new Date(act.date).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>
                )) : <EmptyState icon="❤️" text="No has afegit cap activitat a preferits." />}
              </div>
            )
          )}

          {/* ── Tab: Visites (Premium) ── */}
          {activeTab === 'visites' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {profileViews.length > 0 ? profileViews.map((v, i) => (
                <div key={i} className="flex items-center gap-6 bg-dark2 p-6 rounded-[32px] border border-white/5 hover:bg-white/5 transition-all duration-300 group shadow-lg">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300">
                    {v.user?.avatar
                      ? <img src={v.user.avatar} className="w-full h-full object-cover" alt="" />
                      : <span className="text-2xl">{v.user?.name?.[0] || '?'}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-lg text-white group-hover:text-lime transition-colors">{v.user?.name || 'Usuari'}</div>
                    <div className="text-xs text-muted3 font-medium opacity-60 truncate">{v.user?.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-lime tracking-widest">
                      {v.viewedAt ? new Date(v.viewedAt).toLocaleDateString('ca-ES') : ''}
                    </div>
                    <div className="text-[10px] text-muted3 font-bold opacity-40 uppercase mt-1">
                      {v.viewedAt ? new Date(v.viewedAt).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              )) : <EmptyState icon="👁️" text="Encara no has rebut visites al teu perfil. Fes que el teu perfil destaqui!" />}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Rating Flow Modal */}
      {ratingFlow.isOpen && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] backdrop-blur-xl p-4 animate-fade-in">
          <div className="bg-dark2 p-8 md:p-10 rounded-[40px] border border-white/10 shadow-2xl max-w-[500px] w-full max-h-[85vh] overflow-y-auto relative animate-fade-in-up">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-black text-white">Valorar Participants</h2>
              <button 
                onClick={() => setRatingFlow({ isOpen: false, activityId: null, participants: [], currentIndex: 0 })}
                className="text-muted3 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content */}
            {ratingFlow.participants.length > 0 && ratingFlow.currentIndex < ratingFlow.participants.length ? (
              <form onSubmit={handleRatingSubmit} className="space-y-6">
                
                {/* Step indicator */}
                <div className="text-center text-xs font-black tracking-widest text-muted3 uppercase opacity-60">
                  Participant {ratingFlow.currentIndex + 1} de {ratingFlow.participants.length}
                </div>

                {/* Target profile */}
                <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center text-orange font-bold overflow-hidden border border-orange/20 shadow-lg">
                    {ratingFlow.participants[ratingFlow.currentIndex].profileDetails?.avatar ? (
                      <img 
                        src={ratingFlow.participants[ratingFlow.currentIndex].profileDetails.avatar} 
                        className="w-full h-full object-cover" 
                        alt="" 
                      />
                    ) : (
                      <span className="text-2xl">
                        {ratingFlow.participants[ratingFlow.currentIndex].name?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white">
                      {ratingFlow.participants[ratingFlow.currentIndex].name}
                    </h3>
                    <p className="text-xs text-muted3 mt-1 uppercase tracking-wider font-bold">
                      Participant de l'activitat
                    </p>
                  </div>
                </div>

                {/* Stars selector */}
                <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="text-xs font-black tracking-widest text-muted3 uppercase mb-3">
                    Selecciona la puntuació
                  </div>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRatingValue(val)}
                        className="p-1 hover:scale-125 transition-transform border-none bg-transparent outline-none cursor-pointer"
                      >
                        <Star 
                          size={40} 
                          className={`transition-all ${
                            val <= ratingValue 
                              ? 'fill-orange text-orange drop-shadow-[0_0_12px_rgba(255,107,43,0.6)]' 
                              : 'text-white/10'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div className="form-group">
                  <label className="text-[10px] font-black tracking-[0.2em] text-muted3 mb-3 block uppercase">
                    Comentari
                  </label>
                  <textarea 
                    className="input-dark w-full bg-white/5 border-white/10 rounded-2xl p-4 text-white focus:border-lime transition-all min-h-[100px] resize-none"
                    placeholder="Explica com ha anat l'activitat amb aquesta persona..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  disabled={submittingRating}
                  className="btn-primary w-full py-5 rounded-2xl bg-lime hover:scale-105 active:scale-95 text-dark font-black transition-all shadow-lg shadow-lime/20 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer"
                >
                  {submittingRating ? 'Enviant...' : `Enviar (+${ratingValue * 100} Pts)`}
                </button>

              </form>
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="font-black text-xl text-white">Tot valorat!</h3>
                <p className="text-muted3 text-sm">
                  Has repartit correctament els punts a tots els participants.
                </p>
                <button 
                  onClick={() => setRatingFlow({ isOpen: false, activityId: null, participants: [], currentIndex: 0 })}
                  className="w-full py-4 mt-6 rounded-2xl border border-white/10 text-sm font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  TANCAR
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Password Change Modal (Sleek, Taller, Narrow & Top-Right Positioned via Inline Styles) */}
      {isPasswordModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            zIndex: 99999,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '24px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#15161a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '40px 24px',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
              width: '280px',
              marginTop: '560px',
              marginRight: '30px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setIsPasswordModalOpen(false);
                setNewPassword('');
                setRepeatPassword('');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                color: '#a3a3a3',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = '#a3a3a3'}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: '28px', textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'inherit', fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: 0 }}>Canviar Contrasenya</h2>
              <p style={{ color: '#a3a3a3', fontSize: '11px', marginTop: '6px', marginBottom: 0 }}>Escriu la teva nova contrasenya</p>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.2em', color: '#a3a3a3', textTransform: 'uppercase' }}>Nova contrasenya</label>
                <input 
                  type="password" 
                  className="input-dark"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Mínim 6 caràcters"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.2em', color: '#a3a3a3', textTransform: 'uppercase' }}>Repetir contrasenya</label>
                <input 
                  type="password" 
                  className="input-dark"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Repeteix la contrasenya"
                  required
                  value={repeatPassword}
                  onChange={e => setRepeatPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={changingPassword}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#c8f542',
                  color: '#15161a',
                  fontWeight: '900',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '12px',
                  marginTop: '10px',
                  transition: 'transform 0.2s'
                }}
              >
                {changingPassword ? 'Canviant...' : 'Desar Contrasenya'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
