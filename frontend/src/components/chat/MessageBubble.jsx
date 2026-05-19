import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';

const MessageBubble = ({ msg }) => {
  const isMe = msg.isMe;
  const navigate = useNavigate();
  const formattedTime = new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Check if it's the activity finalization notification
  const ratingRegex = /sha tancat la activitat (.*), es el moment de fer una valoracio\s*\[([a-f\d]{24})\]/i;
  const match = msg.content?.match(ratingRegex);

  let displayContent = msg.content;
  let activityId = null;

  if (match) {
    const activityTitle = match[1];
    activityId = match[2];
    displayContent = `sha tancat la activitat "${activityTitle}", es el moment de fer una valoracio`;
  }

  return (
    <div className={`${styles.bubbleWrapper} ${isMe ? styles.bubbleMe : styles.bubbleOther} animate-fade-in`}>
      <div className={styles.bubble}>
        {msg.image && (
          <img 
            src={msg.image} 
            alt="Adjunt" 
            className={styles.bubbleImage}
            onClick={() => window.open(msg.image, '_blank')}
          />
        )}
        <div className="whitespace-pre-wrap text-[15px]">{displayContent}</div>
        
        {activityId && (
          <button 
            onClick={() => navigate(`/profile?rate=${activityId}`)}
            className="mt-3 px-4 py-2 bg-lime text-dark font-black text-xs tracking-wider uppercase rounded-xl hover:bg-lime/85 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none outline-none"
          >
            ⭐ Valorar activitat
          </button>
        )}
        
        <div className={styles.bubbleTime}>{formattedTime}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
