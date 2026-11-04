import React, { useEffect } from 'react';
import './BirthdayReveal.css';

export default function JarOpeningSequence({ onSequenceComplete }) {
  useEffect(() => {
    // Sequence duration matches lid lift and glow expansion
    const timer = setTimeout(() => {
      if (onSequenceComplete) onSequenceComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onSequenceComplete]);

  return (
    <div className="jar-opening-view" role="status" aria-live="polite">
      {/* Warm Golden Glow radiating from jar neck */}
      <div className="magical-jar-glow" aria-hidden="true" />

      <p className="opening-status-text">
        Unsealing your beautiful year... ✨
      </p>
    </div>
  );
}

