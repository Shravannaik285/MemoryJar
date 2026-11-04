import React, { useEffect } from 'react';
import { useBirthdayReveal } from '../../hooks/useBirthdayReveal';
import BirthdayWelcome from './BirthdayWelcome';
import JarOpeningSequence from './JarOpeningSequence';
import ChitEruption from './ChitEruption';
import MemorySlideshow from './MemorySlideshow';
import BirthdayFinale from './BirthdayFinale';
import './BirthdayReveal.css';

export default function BirthdayRevealOverlay({
  isOpen = false,
  onClose,
  chits = [],
  onSetLidOpen,
  onOpenScrapbook,
  onWriteMemory,
}) {
  const {
    currentStage,
    setCurrentStage,
    sortedMemories,
    currentIndex,
    currentMemory,
    totalMemories,
    isPlaying,
    progress,
    nextMemory,
    prevMemory,
    togglePlay,
    skipToFinale,
    replay,
    closeReveal,
  } = useBirthdayReveal({
    chits,
    isOpen,
    onClose,
  });

  // Keep 3D jar lid open during opening, erupting, and slideshow stages
  useEffect(() => {
    if (!isOpen) {
      if (onSetLidOpen) onSetLidOpen(false);
      return;
    }

    if (currentStage === 'opening' || currentStage === 'erupting' || currentStage === 'slideshow') {
      if (onSetLidOpen) onSetLidOpen(true);
    } else {
      if (onSetLidOpen) onSetLidOpen(false);
    }
  }, [isOpen, currentStage, onSetLidOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="birthday-reveal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-experience"
    >
      {/* Ambient Floating Sparkles Layer */}
      <div className="reveal-ambient-particles" aria-hidden="true">
        <span className="reveal-particle rp-1">✨</span>
        <span className="reveal-particle rp-2">✦</span>
        <span className="reveal-particle rp-3">🌸</span>
        <span className="reveal-particle rp-4">✨</span>
        <span className="reveal-particle rp-5">★</span>
        <span className="reveal-particle rp-6">✦</span>
      </div>

      <div className="reveal-stage-wrapper">
        {/* Stage 1: Welcome Greeting */}
        {currentStage === 'welcome' && (
          <BirthdayWelcome
            totalMemories={totalMemories}
            onOpenJar={() => setCurrentStage('opening')}
            onClose={closeReveal}
            onWriteMemory={onWriteMemory}
          />
        )}

        {/* Stage 2: 3D Jar Lid Opening & Glow */}
        {currentStage === 'opening' && (
          <JarOpeningSequence
            onSequenceComplete={() => setCurrentStage('erupting')}
          />
        )}

        {/* Stage 3: Chit Eruption Take-off */}
        {currentStage === 'erupting' && (
          <ChitEruption
            memories={sortedMemories}
            onEruptionComplete={() => setCurrentStage('slideshow')}
          />
        )}

        {/* Stage 4: Chronological Memory Unfolding Slideshow */}
        {currentStage === 'slideshow' && (
          <MemorySlideshow
            currentMemory={currentMemory}
            currentIndex={currentIndex}
            totalMemories={totalMemories}
            isPlaying={isPlaying}
            progress={progress}
            onNext={nextMemory}
            onPrev={prevMemory}
            onTogglePlay={togglePlay}
            onSkip={skipToFinale}
            onClose={closeReveal}
          />
        )}

        {/* Stage 5: Final Emotional Screen */}
        {currentStage === 'finale' && (
          <BirthdayFinale
            totalMemories={totalMemories}
            onReplay={replay}
            onOpenScrapbook={onOpenScrapbook}
            onClose={closeReveal}
          />
        )}
      </div>
    </div>
  );
}

