import gsap from 'gsap';

/**
 * Checks if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates the cinematic jar opening and magic glow timeline
 * @param {Object} options
 * @param {HTMLElement} options.jarStageEl
 * @param {HTMLElement} options.glowEl
 * @param {Function} options.onLidLift
 * @param {Function} options.onErupt
 * @param {Function} options.onComplete
 * @returns {gsap.core.Timeline}
 */
export function createJarOpeningTimeline({
  jarStageEl,
  glowEl,
  onLidLift,
  onErupt,
  onComplete,
}) {
  const reduced = prefersReducedMotion();
  const tl = gsap.timeline({
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });

  if (reduced) {
    if (onLidLift) onLidLift();
    if (onErupt) onErupt();
    tl.to({}, { duration: 0.5 });
    return tl;
  }

  // 1. Camera gently pans and moves closer to the jar
  if (jarStageEl) {
    tl.to(jarStageEl, {
      scale: 1.18,
      y: -20,
      duration: 1.4,
      ease: 'power2.inOut',
    });
  }

  // 2. Jar begins gentle anticipation shake & Lid lifts
  tl.call(() => {
    if (onLidLift) onLidLift();
  }, null, '>-0.6');

  // 3. Warm magical golden glow emerges from jar opening
  if (glowEl) {
    tl.fromTo(
      glowEl,
      { opacity: 0, scale: 0.4 },
      {
        opacity: 1,
        scale: 1.25,
        duration: 1.0,
        ease: 'power2.out',
      },
      '<'
    );
  }

  // 4. Chits begin rising and erupting from the jar neck
  tl.call(() => {
    if (onErupt) onErupt();
  }, null, '>-0.2');

  // Hold briefly to admire the floating chits
  tl.to({}, { duration: 1.8 });

  return tl;
}

/**
 * Animates an individual memory chit unfolding into view
 * @param {HTMLElement} element
 * @param {Function} onComplete
 * @returns {gsap.core.Timeline}
 */
export function animateMemoryUnfold(element, onComplete) {
  if (!element) return null;
  const reduced = prefersReducedMotion();

  if (reduced) {
    gsap.set(element, { opacity: 1, scale: 1, rotationX: 0 });
    if (onComplete) onComplete();
    return null;
  }

  return gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 0.82,
      rotationX: -24,
      y: 30,
      transformPerspective: 900,
    },
    {
      opacity: 1,
      scale: 1,
      rotationX: 0,
      y: 0,
      duration: 0.65,
      ease: 'back.out(1.4)',
      onComplete,
    }
  );
}

