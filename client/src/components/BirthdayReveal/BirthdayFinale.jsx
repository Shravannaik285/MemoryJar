import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, RotateCcw, BookOpen, Sparkles } from 'lucide-react';
import './BirthdayReveal.css';

export default function BirthdayFinale({
  totalMemories = 0,
  onReplay,
  onOpenScrapbook,
  onClose,
}) {
  // Fire celebratory birthday finale confetti burst
  useEffect(() => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.45 },
      colors: ['#FFB3C6', '#FFE66D', '#A9DEF9', '#FFCAD4', '#D0BCFE', '#D8F3DC'],
    });
  }, []);

  return (
    <div className="birthday-finale-card" role="dialog" aria-labelledby="finale-title">
      <div className="finale-heart-badge" aria-hidden="true">
        <Heart size={36} fill="#E11D48" color="#E11D48" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 id="finale-title" className="finale-title">
          LOOK HOW FAR YOU'VE COME. ❤️
        </h2>

        <p className="finale-subtitle">
          Every little moment helped make this year yours. Here's to another year of cherished memories.
        </p>
      </div>

      <div className="welcome-memory-pill">
        <Sparkles size={16} />
        <span>{totalMemories} beautiful moments celebrated today</span>
      </div>

      <div className="finale-quote-box">
        “Even when you forget how beautiful your year was, your Memory Jar remembers.” ♡
      </div>

      <div className="finale-actions-row">
        <button
          type="button"
          className="finale-return-btn"
          onClick={onClose}
        >
          Return to My Memory Jar 🫙
        </button>

        {onOpenScrapbook && (
          <button
            type="button"
            className="finale-secondary-btn"
            onClick={() => {
              onClose();
              onOpenScrapbook();
            }}
          >
            <BookOpen size={16} />
            Explore in Scrapbook
          </button>
        )}

        <button
          type="button"
          className="finale-secondary-btn"
          onClick={onReplay}
          title="Watch the reveal again"
        >
          <RotateCcw size={16} />
          Replay
        </button>
      </div>

      <span style={{ fontSize: '0.85rem', color: '#9E8576', fontFamily: 'Caveat, cursive' }}>
        A little jar of big memories. ♡
      </span>
    </div>
  );
}

