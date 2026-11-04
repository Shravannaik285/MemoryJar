import React from 'react';
import { Heart, Sparkles, PenTool } from 'lucide-react';
import './BirthdayReveal.css';

export default function BirthdayWelcome({
  totalMemories = 0,
  onOpenJar,
  onClose,
  onWriteMemory,
}) {
  // Empty State: if the user opens reveal mode with 0 memories
  if (totalMemories === 0) {
    return (
      <div className="birthday-welcome-card" role="dialog" aria-labelledby="welcome-title">
        <div className="welcome-cake-badge">🌸</div>

        <h2 id="welcome-title" className="welcome-title">
          A Fresh Jar for a Fresh Year
        </h2>

        <p className="welcome-subtitle">
          Your Memory Jar doesn't have any saved moments yet. Write your very first memory today and begin collecting memories to celebrate your next birthday!
        </p>

        <button
          type="button"
          className="welcome-open-btn"
          onClick={() => {
            onClose();
            if (onWriteMemory) onWriteMemory();
          }}
        >
          <PenTool size={18} />
          Write My First Memory
        </button>

        <button
          type="button"
          className="welcome-dismiss-link"
          onClick={onClose}
        >
          Return to home screen
        </button>
      </div>
    );
  }

  return (
    <div className="birthday-welcome-card" role="dialog" aria-labelledby="welcome-title">
      <div className="welcome-cake-badge" aria-hidden="true">🎂</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 id="welcome-title" className="welcome-title">
          HAPPY BIRTHDAY! 🎂
        </h2>

        <p className="welcome-subtitle">
          Another year of life. Another collection of beautiful moments.
        </p>
      </div>

      <div className="welcome-memory-pill">
        <Sparkles size={16} />
        <span>{totalMemories} cherished memories tucked inside</span>
      </div>

      <button
        type="button"
        className="welcome-open-btn"
        onClick={onOpenJar}
      >
        <Heart size={18} fill="#E11D48" color="#E11D48" />
        Open My Memory Jar ❤️
      </button>

      <button
        type="button"
        className="welcome-dismiss-link"
        onClick={onClose}
      >
        I'll open it later
      </button>
    </div>
  );
}
