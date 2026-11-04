import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Calendar, Edit3, Trash2 } from 'lucide-react';
import { CHIT_PALETTE } from '../../hooks/useChits';
import { createPaperUnfoldTimeline, createPaperRefoldTimeline } from '../../animations/paperUnfoldTimeline';
import { useAnimationController } from '../../hooks/useAnimationController';

export default function ChitDetailModal({
  chit,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) {
  const paperSheetRef = useRef(null);
  const textRef = useRef(null);
  const photoRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  const { prefersReducedMotion, registerTimeline } = useAnimationController();

  const colorConfig = chit
    ? CHIT_PALETTE.find((c) => c.id === chit.colorId || c.bg === chit.color) ||
      CHIT_PALETTE[0]
    : CHIT_PALETTE[0];

  // Progressive Unfolding on Open
  useEffect(() => {
    if (isOpen && paperSheetRef.current && !isClosing) {
      const tl = createPaperUnfoldTimeline({
        paperElement: paperSheetRef.current,
        textContentElement: textRef.current,
        photoElement: photoRef.current,
        reducedMotion: prefersReducedMotion,
      });
      registerTimeline(tl);
    }
  }, [isOpen, chit, isClosing, prefersReducedMotion, registerTimeline]);

  // Request smooth reverse fold closing
  const handleRequestClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    const tl = createPaperRefoldTimeline({
      paperElement: paperSheetRef.current,
      reducedMotion: prefersReducedMotion,
      onComplete: () => {
        setIsClosing(false);
        onClose();
      },
    });
    registerTimeline(tl);
  }, [isClosing, prefersReducedMotion, onClose, registerTimeline]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleRequestClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleRequestClose]);

  if (!isOpen || !chit) return null;

  return (
    <div
      className="chit-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isClosing) {
          handleRequestClose();
        }
      }}
    >
      <div className="chit-detail-container">
        {/* Unfolded Paper Sheet */}
        <div
          className="detail-paper-sheet"
          ref={paperSheetRef}
          style={{
            '--detail-theme-bg': colorConfig.bg,
            '--detail-theme-light': colorConfig.light,
            '--detail-theme-border': colorConfig.border,
            '--detail-theme-text': colorConfig.text,
          }}
        >
          {/* Decorative Washi Tapes */}
          <div className="detail-washi-tape top-left"></div>
          <div className="detail-washi-tape top-right"></div>

          {/* Paper Header */}
          <div className="detail-header-bar">
            <span className="detail-date-badge">
              <Calendar size={15} />
              <span id="detail-modal-title">{chit.date}</span>
            </span>

            <button
              type="button"
              className="detail-close-btn"
              onClick={handleRequestClose}
              title="Fold & Close memory"
              aria-label="Close"
              disabled={isClosing}
            >
              <X size={18} />
            </button>
          </div>

          {/* Attached Photo (Large Polaroid Frame) */}
          {chit.photo && (
            <div className="detail-polaroid-frame" ref={photoRef}>
              <img
                src={chit.photo}
                alt="Memory attachment full view"
                className="detail-polaroid-img"
              />
              <span className="polaroid-caption-date">{chit.date}</span>
            </div>
          )}

          {/* Full Memory Handwriting Text */}
          <div className="detail-text-content" ref={textRef}>
            <p className="detail-memory-body">{chit.text}</p>
          </div>

          {/* Detail Footer Actions */}
          <div className="detail-footer-bar">
            <span className="detail-color-tag" style={{ backgroundColor: colorConfig.bg }}>
              {colorConfig.name} Paper
            </span>

            <div className="detail-actions-group">
              <button
                type="button"
                className="detail-action-btn edit"
                onClick={() => {
                  onClose();
                  onEdit(chit);
                }}
                title="Edit this memory"
                disabled={isClosing}
              >
                <Edit3 size={15} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                className="detail-action-btn delete"
                onClick={() => {
                  onClose();
                  onDelete(chit);
                }}
                title="Delete this memory"
                disabled={isClosing}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
