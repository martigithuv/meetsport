import React from 'react';
import { Star, Users, Calendar, MapPin, ExternalLink } from 'lucide-react';

const ActivityCard = ({ activity, onOpen, isPremium, isFavorite, onToggleFavorite }) => {
  const now = new Date();
  const actDate = new Date(activity.date);
  const isFinished = actDate < now;
  
  // Logic for colored status dot
  const diffTime = actDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusColor = '#c8f542'; // Green (Lime)
  if (isFinished) {
    statusColor = '#ef4444'; // Red
  } else if (diffDays <= 7) {
    statusColor = '#ff6b2b'; // Orange
  }

  const handleOpenMaps = (e) => {
    e.stopPropagation();
    const url = activity.location?.url;
    const address = activity.location?.address || 'Barcelona';
    
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    } else {
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(searchUrl, '_blank');
    }
  };

  return (
    <div 
      className="activity-card-horizontal group relative overflow-hidden" 
      onClick={() => onOpen(activity)}
    >
      {/* Left Accent Bar */}
      <div className={`w-1.5 h-full absolute left-0 top-0 z-10 transition-all duration-300 ${isFinished ? 'bg-red-500' : 'bg-lime group-hover:w-3'}`}></div>
      
      {/* Star Icon - Right side - Visible for premium users only */}
      {isPremium && (
        <button 
          className={`absolute top-10 right-4 z-20 p-2.5 rounded-xl transition-all duration-300 ${isFavorite ? 'bg-orange/25 text-orange shadow-lg shadow-orange/20' : 'bg-white/5 text-white/30 hover:bg-white/15'}`} 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(activity._id);
          }}
          title={isFavorite ? "Treure de preferits" : "Afegir a preferits"}
        >
          <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
        </button>
      )}

      {/* Status Dot - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <div 
          className="w-4.5 h-4.5 rounded-full border border-white/20 shadow-md"
          style={{ 
            backgroundColor: statusColor,
            boxShadow: `0 0 14px ${statusColor}cc`,
            animation: !isFinished ? 'pulse-custom 1.5s ease-in-out infinite' : 'none'
          }}
          title={isFinished ? "Activitat finalitzada" : (diffDays <= 7 ? "Expira en menys de 7 dies" : "Expira en 7 dies o més")}
        ></div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch h-full w-full">
        {/* Info Column (Left/Top) */}
        <div className="p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 min-w-[150px] items-center text-center bg-white/[0.02]">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-lime uppercase tracking-widest mb-1">{actDate.toLocaleDateString('ca-ES', { month: 'short' })}</span>
            <span className="text-4xl font-black text-white leading-none mb-1">{actDate.getDate()}</span>
            <span className="text-[11px] font-bold text-muted3">{actDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div className="mt-4">
            <div className="w-3.5 h-3.5 rounded-full mx-auto mb-2 bg-lime shadow-[0_0_12px_rgba(200,245,66,0.5)] animate-pulse"></div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">{activity.sport}</span>
          </div>
        </div>

        {/* Content Column (Right/Main) */}
        <div className="flex-1 p-6 md:p-8 flex flex-col relative min-w-0">
          
          {/* Header Row: Title */}
          <div className="flex items-center gap-4 mb-4 w-full pr-20 md:pr-24">
            <h3 className="text-2xl font-black tracking-tighter leading-tight group-hover:text-lime transition-colors truncate flex-1 min-w-0">
              {activity.title}
            </h3>
          </div>

          <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
            <span className="w-5 h-px bg-white/10"></span> {activity.creator?.name || 'MeetSport'}
          </p>

          <p className="text-sm text-white/50 line-clamp-1 mb-8 flex-1 italic font-medium">
            "{activity.description || 'Sense detalls.'}"
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-auto">
            <div className="flex items-center gap-3 text-white/60">
              <Users size={18} className="text-lime" />
              <span className="text-xs font-black">{activity.participants?.length || 0}/{activity.maxParticipants}</span>
            </div>
            
            <div className="flex items-center gap-3 text-white/60">
              <MapPin size={18} className="text-lime" />
              <span className="text-xs font-bold truncate max-w-[140px]">{activity.location?.address || 'Barcelona'}</span>
            </div>

            {/* MAPS BUTTON IN CARD */}
            <button 
              onClick={handleOpenMaps}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-lime hover:text-dark rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border border-white/10 hover:border-lime group/btn shadow-xl"
            >
              <ExternalLink size={14} className="group-hover/btn:scale-110 transition-transform" />
              Ver Maps
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-custom {
          0% { transform: scale(0.9); opacity: 0.8; box-shadow: 0 0 0 0 rgba(200, 245, 66, 0.4); }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 25px rgba(200, 245, 66, 0.6); }
          100% { transform: scale(0.9); opacity: 0.8; box-shadow: 0 0 0 0 rgba(200, 245, 66, 0.4); }
        }
        .activity-card-horizontal {
          position: relative;
          background: #111116;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 32px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          overflow: hidden;
          height: 100%;
          min-height: 230px;
        }

        .activity-card-horizontal:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: rgba(200, 245, 66, 0.3);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(200, 245, 66, 0.04);
        }
      `}</style>
    </div>
  );
};

export default ActivityCard;
