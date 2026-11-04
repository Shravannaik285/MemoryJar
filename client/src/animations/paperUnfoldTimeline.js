import gsap from 'gsap';

/**
 * Creates a progressive unfolding timeline when reading a memory chit.
 * The folded note opens its flaps, expands into full paper stationery,
 * and reveals the handwriting text and photo with spring easing.
 *
 * @param {Object} options
 * @param {HTMLElement} options.paperElement - The modal paper card
 * @param {HTMLElement} options.textContentElement - The text body
 * @param {HTMLElement} options.photoElement - The optional photo preview
 * @param {boolean} options.reducedMotion - Whether user prefers reduced motion
 * @param {Function} options.onComplete - Callback when unfolding finishes
 * @returns {gsap.core.Timeline}
 */
export function createPaperUnfoldTimeline({
  paperElement,
  textContentElement,
  photoElement,
  reducedMotion = false,
  onComplete,
}) {
  if (!paperElement) {
    if (onComplete) onComplete();
    return null;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });

  if (reducedMotion) {
    gsap.set(paperElement, { opacity: 0, scale: 0.95 });
    tl.to(paperElement, { opacity: 1, scale: 1, duration: 0.25, ease: 'power1.out' });
    return tl;
  }

  // Set 3D perspective initial state (starting as folded compact chit)
  gsap.set(paperElement, {
    transformPerspective: 1400,
    transformStyle: 'preserve-3d',
    scaleX: 0.35,
    scaleY: 0.18,
    rotateX: -25,
    rotateZ: 4,
    opacity: 0,
    boxShadow: '0 8px 20px rgba(60, 35, 20, 0.2)',
  });

  if (textContentElement) {
    gsap.set(textContentElement, { opacity: 0, y: 12 });
  }

  if (photoElement) {
    gsap.set(photoElement, { opacity: 0, scale: 0.92, rotateZ: -3 });
  }

  // Stage 1: Initial lift & reveal folded chit
  tl.to(paperElement, {
    opacity: 1,
    scaleX: 0.5,
    scaleY: 0.35,
    rotateX: -12,
    rotateZ: -2,
    duration: 0.22,
    ease: 'power2.out',
  });

  // Stage 2: Flaps expand horizontally & vertically
  tl.to(paperElement, {
    scaleX: 1,
    scaleY: 1,
    rotateX: 0,
    rotateZ: 0,
    boxShadow: '0 25px 60px rgba(50, 25, 15, 0.45)',
    duration: 0.45,
    ease: 'back.out(1.25)',
  });

  // Stage 3: Reveal memory text smoothly
  if (textContentElement) {
    tl.to(
      textContentElement,
      {
        opacity: 1,
        y: 0,
        duration: 0.32,
        ease: 'power2.out',
      },
      '-=0.2'
    );
  }

  // Stage 4: Reveal attached photo smoothly
  if (photoElement) {
    tl.to(
      photoElement,
      {
        opacity: 1,
        scale: 1,
        rotateZ: -1,
        duration: 0.35,
        ease: 'back.out(1.3)',
      },
      '-=0.25'
    );
  }

  return tl;
}

/**
 * Creates a reverse folding timeline when closing the memory detail modal.
 * Folds the paper back into a compact note before dismissing.
 *
 * @param {Object} options
 * @param {HTMLElement} options.paperElement - The modal paper card
 * @param {boolean} options.reducedMotion - Whether user prefers reduced motion
 * @param {Function} options.onComplete - Callback when refolding finishes
 * @returns {gsap.core.Timeline}
 */
export function createPaperRefoldTimeline({
  paperElement,
  reducedMotion = false,
  onComplete,
}) {
  if (!paperElement) {
    if (onComplete) onComplete();
    return null;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });

  if (reducedMotion) {
    tl.to(paperElement, { opacity: 0, scale: 0.95, duration: 0.2, ease: 'power1.in' });
    return tl;
  }

  // Stage 1: Tuck content away
  tl.to(paperElement, {
    scaleX: 0.4,
    scaleY: 0.22,
    rotateX: 20,
    rotateZ: -3,
    opacity: 0.5,
    duration: 0.3,
    ease: 'power2.in',
  });

  // Stage 2: Quick fold collapse into zero
  tl.to(paperElement, {
    scale: 0.1,
    opacity: 0,
    duration: 0.15,
    ease: 'power2.in',
  });

  return tl;
}

