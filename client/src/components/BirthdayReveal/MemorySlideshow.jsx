import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, X, SkipForward, Calendar } from 'lucide-react';
import { animateMemoryUnfold } from '../../animations/birthdayRevealTimeline';
import { CHIT_PALETTE } from '../../hooks/useChits';
import './BirthdayReveal.css';

export default function MemorySlideshow({
  currentMemory,
  currentIndex,
  totalMemories,
  isPlaying,
  progress,
  onNext,
  onPrev,
  onTogglePlay,
  onSkip,
  onClose,
}) {
  const paperRef = useRef(null);

  // Format date nicely (e.g. "14 January, 2026")
  const formattedDate = currentMemory?.date
    ? new Date(currentMemory.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'A Cherished Moment';

  // Find color theme matching the chit's pastel color
  const chitColorHex = currentMemory?.chitColor || currentMemory?.color || '#FFB3C6';
  const paletteMatch = CHIT_PALETTE.find(
    (p) => p.bg.toLowerCase() === chitColorHex.toLowerCase()
  );

  const paperBg = paletteMatch ? paletteMatch.light : '#FFF0F3';
  const paperBorder = paletteMatch ? paletteMatch.border : '#FFA3B8';
  const paperText = paletteMatch ? paletteMatch.text : '#8B2C43';

  // Animate memory unfolding when current memory index changes
  useEffect(() => {
    if (paperRef.current) {
      animateMemoryUnfold(paperRef.current);
    }
  }, [currentIndex]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onTogglePlay, onClose]);

  if (!currentMemory) return null;

  return (
    <div
      className="memory-slideshow-card"
      role="region"
      aria-label="Birthday Memory Slideshow"
      style={{
        '--paper-bg': paperBg,
        '--paper-border': paperBorder,
        '--paper-text': paperText,
      }}
    >
      {/* Top Header: Step Badge & Auto-play Progress */}
      <div className="slideshow-header-row">
        <span className="slideshow-step-badge">
          Moment {currentIndex + 1} of {totalMemories}
        </span>

        <div className="slideshow-progress-bar-container" title="Auto-advance progress">
          <div
            className="slideshow-progress-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>

        <button
          type="button"
          className="slideshow-close-btn"
          onClick={onClose}
          title="Exit reveal"
          aria-label="Close memory reveal"
        >
          <X size={18} />
        </button>
      </div>

      {/* Unfolded Memory Paper Card */}
      <div ref={paperRef} className="unfolded-memory-paper">
        {/* Date Stamp */}
        <div className="memory-date-tag">
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>

        {/* Memory Description Text */}
        <p className="memory-text-content">
          {currentMemory.description || currentMemory.text}
        </p>

        {/* Optional Attached Photo */}
        {currentMemory.photo && (
          <div className="memory-polaroid-frame">
            <div className="polaroid-tape" />
            <img
              src={currentMemory.photo}
              alt="Memory photograph"
              className="memory-polaroid-img"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation & Controls */}
      <div className="slideshow-controls-row">
        <div className="slideshow-nav-group">
          {/* Previous Button */}
          <button
            type="button"
            className="slideshow-icon-btn"
            onClick={onPrev}
            disabled={currentIndex === 0}
            title="Previous memory"
            aria-label="Previous memory"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Auto-play / Pause Button */}
          <button
            type="button"
            className="slideshow-icon-btn slideshow-play-btn"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          {/* Next Button */}
          <button
            type="button"
            className="slideshow-icon-btn"
            onClick={onNext}
            title="Next memory"
            aria-label="Next memory"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Skip to Finale Action */}
        <button
          type="button"
          className="slideshow-skip-btn"
          onClick={onSkip}
        >
          Skip to end <SkipForward size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
        </button>
      </div>
    </div>
  );
}

