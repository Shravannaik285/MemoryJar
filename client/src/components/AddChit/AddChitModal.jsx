import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import ChitEditor from './ChitEditor';
import { createPaperFoldTimeline } from '../../animations/paperFoldTimeline';
import { createChitFlightTimeline } from '../../animations/chitFlightTimeline';
import { useAnimationController } from '../../hooks/useAnimationController';
import './AddChit.css';

export default function AddChitModal({
  isOpen,
  onClose,
  onSaveChit,
  onOpenJarLid,
  onChitEnterJar,
}) {
  const cardRef = useRef(null);
  const topFlapRef = useRef(null);
  const bottomFlapRef = useRef(null);
  const formControlsRef = useRef(null);
  const chitTokenRef = useRef(null);
  const modalOverlayRef = useRef(null);

  const {
    isAnimating,
    prefersReducedMotion,
    registerTimeline,
    runGuardedSequence,
    killAllAnimations,
  } = useAnimationController();

  // Close on Escape key if not mid-animation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isAnimating) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAnimating, onClose]);

  // Clean up timelines if modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      killAllAnimations();
    }
  }, [isOpen, killAllAnimations]);

  if (!isOpen) return null;

  // Locate the 3D Jar opening on the screen
  const getJarOpeningCoordinates = () => {
    // 1. Prefer dedicated target marker element
    const markerElement = document.querySelector('.jar-mouth-target-marker');
    if (markerElement) {
      const rect = markerElement.getBoundingClientRect();
      if (rect.width > 0 || rect.top > 0) {
        return {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.5,
        };
      }
    }

    // 2. Query 3D canvas
    const canvasElement = document.querySelector('.r3f-jar-canvas');
    if (canvasElement) {
      const rect = canvasElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.30,
      };
    }

    // 3. Fallback to viewport top center
    return {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.35,
    };
  };

  const handleEditorSubmit = (chitData) => {
    runGuardedSequence({
      sequenceName: 'add-chit-sequence',
      timeoutMs: 6500,
      execute: (finish) => {
        // STAGE 1: Physically fold flat paper into compact chit
        const foldTl = createPaperFoldTimeline({
          paperElement: cardRef.current,
          topFlapElement: topFlapRef.current,
          bottomFlapElement: bottomFlapRef.current,
          formControlsElement: formControlsRef.current,
          chitTokenElement: chitTokenRef.current,
          reducedMotion: prefersReducedMotion,
          onComplete: () => {
            // Fade out modal backdrop to reveal 3D jar in background
            if (modalOverlayRef.current) {
              modalOverlayRef.current.style.transition = 'background-color 0.4s ease';
              modalOverlayRef.current.style.backgroundColor = 'transparent';
              modalOverlayRef.current.style.backdropFilter = 'none';
              modalOverlayRef.current.style.pointerEvents = 'none';
            }

            // STAGE 2: 3D Ballistic Flight Arc to Jar Opening
            const targetCoords = getJarOpeningCoordinates();

            const flightTl = createChitFlightTimeline({
              chitElement: cardRef.current,
              targetCoords,
              reducedMotion: prefersReducedMotion,
              onOpenLid: () => {
                if (onOpenJarLid) onOpenJarLid();
              },
              onEnterMouth: () => {
                // Seamless handoff to 3D scene
                if (onChitEnterJar) onChitEnterJar(chitData);
                if (onSaveChit) onSaveChit(chitData);
              },
              onComplete: () => {
                finish();
                onClose();
              },
            });

            registerTimeline(flightTl);
          },
        });

        registerTimeline(foldTl);
      },
      onFailed: () => {
        // Safe recovery fallback: ensure memory is not lost even if animation fails
        if (onSaveChit) onSaveChit(chitData);
        onClose();
      },
    });
  };

  return (
    <div
      className={`add-chit-modal-overlay ${isAnimating ? 'animating-flight' : ''}`}
      ref={modalOverlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-chit-title"
    >
      <div className="add-chit-modal-container">
        {/* Modal Top Header with Close Button */}
        {!isAnimating && (
          <div className="modal-header-bar">
            <div className="modal-title-group">
              <span className="modal-sparkle-emoji">✨</span>
              <h2 id="modal-add-chit-title" className="modal-heading">
                Write a Memory
              </h2>
            </div>
            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Close editor"
              aria-label="Close modal"
              disabled={isAnimating}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Paper Editor Form */}
        <ChitEditor
          onSubmit={handleEditorSubmit}
          onCancel={onClose}
          isSubmitting={isAnimating}
          cardRef={cardRef}
          topFlapRef={topFlapRef}
          bottomFlapRef={bottomFlapRef}
          formControlsRef={formControlsRef}
          chitTokenRef={chitTokenRef}
        />
      </div>
    </div>
  );
}
