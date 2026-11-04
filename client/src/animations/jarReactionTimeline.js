import confetti from 'canvas-confetti';

/**
 * Coordinates charming physical feedback from the jar when a chit lands.
 * Combines coaster compression, lid snap settling, paper settling, and confetti.
 *
 * @param {Object} options
 * @param {Function} options.triggerJarWiggle - Triggers physical compression in useJarAnimation
 * @param {Function} options.triggerPaperSettle - Triggers micro-settling of resting chits in PaperChits3D
 * @param {boolean} options.reducedMotion - Whether user prefers reduced motion
 * @param {Function} options.onComplete - Callback when feedback settles
 */
export function triggerJarLandedReaction({
  triggerJarWiggle,
  triggerPaperSettle,
  reducedMotion = false,
  onComplete,
}) {
  // 1. Trigger the 3D jar physical compression & wobble
  if (triggerJarWiggle) {
    triggerJarWiggle();
  }

  // 2. Trigger micro-settle on the resting pile chits
  if (triggerPaperSettle) {
    triggerPaperSettle();
  }

  // 3. Pastel celebration sparkles
  if (!reducedMotion) {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.44 },
      colors: ['#FFB3C6', '#FFE66D', '#A9DEF9', '#FFCAD4', '#D0BCFE', '#D8F3DC'],
      disableForReducedMotion: true,
    });
  }

  if (onComplete) {
    setTimeout(onComplete, 600);
  }
}

