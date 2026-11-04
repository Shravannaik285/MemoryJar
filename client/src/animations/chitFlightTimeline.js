import gsap from 'gsap';

/**
 * Creates a physically modeled 3D ballistic arc flight timeline.
 * Animates the folded chit travelling from its screen position into the jar opening,
 * coordinating lid opening and handoff into the 3D scene.
 *
 * @param {Object} options
 * @param {HTMLElement} options.chitElement - The folded DOM element
 * @param {Object} options.targetCoords - Screen coordinates { x, y } of jar mouth
 * @param {boolean} options.reducedMotion - Whether user prefers reduced motion
 * @param {Function} options.onOpenLid - Trigger to open the 3D cork lid
 * @param {Function} options.onEnterMouth - Handoff callback when chit enters jar mouth
 * @param {Function} options.onComplete - Callback when flight timeline completes
 * @returns {gsap.core.Timeline}
 */
export function createChitFlightTimeline({
  chitElement,
  targetCoords,
  reducedMotion = false,
  onOpenLid,
  onEnterMouth,
  onComplete,
}) {
  if (!chitElement || !targetCoords) {
    if (onEnterMouth) onEnterMouth();
    if (onComplete) onComplete();
    return null;
  }

  const startRect = chitElement.getBoundingClientRect();
  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;

  const dx = targetCoords.x - startX;
  const dy = targetCoords.y - startY;

  // Parabolic apex peak calculation
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const arcLift = isMobile ? 80 : 130;
  const apexY = Math.min(startY, targetCoords.y) - arcLift;

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });

  let lidTriggered = false;
  let handoffTriggered = false;

  // Reduced motion alternative: direct, gentle fade & slide
  if (reducedMotion) {
    tl.to(chitElement, {
      x: dx,
      y: dy,
      scale: 0.25,
      opacity: 0,
      duration: 0.6,
      ease: 'power1.inOut',
      onUpdate: function () {
        if (this.progress() > 0.4 && !lidTriggered) {
          lidTriggered = true;
          if (onOpenLid) onOpenLid();
        }
      },
      onComplete: () => {
        if (onEnterMouth) onEnterMouth();
      },
    });
    return tl;
  }

  // Ensure 3D perspective for flight
  gsap.set(chitElement, {
    transformPerspective: 1600,
    transformStyle: 'preserve-3d',
  });

  // Stage 1: Anticipation lift into air
  tl.to(chitElement, {
    scale: 0.22,
    rotateZ: 20,
    rotateX: 35,
    duration: 0.22,
    ease: 'power2.out',
  });

  // Proxy object to interpolate along parabolic arc
  const flightProgress = { p: 0 };

  tl.to(
    flightProgress,
    {
      p: 1,
      duration: 0.85,
      ease: 'power1.inOut',
      onUpdate: () => {
        const p = flightProgress.p;

        // Parabolic trajectory: P0 = (0,0), P1 = (dx/2, apexY - startY), P2 = (dx, dy)
        const currentX = p * dx;
        const currentY =
          2 * (1 - p) * p * (apexY - startY) +
          p * p * dy;

        // Tumbling rotations with air resistance
        const rotZ = 20 + p * 540;
        const rotY = p * 360;
        const rotX = 35 + p * 160;

        // Scale shrinks smoothly to match 3D mouth aperture
        const scale = THREE_lerp(0.22, 0.08, p);

        // Apply physical transform via GSAP set (hardware accelerated)
        gsap.set(chitElement, {
          x: currentX,
          y: currentY,
          scale: scale,
          rotateZ: rotZ,
          rotateY: rotY,
          rotateX: rotX,
          force3D: true,
        });

        // Open lid as chit approaches (at ~38% along trajectory)
        if (p > 0.38 && !lidTriggered) {
          lidTriggered = true;
          if (onOpenLid) onOpenLid();
        }

        // Near the mouth (p > 0.92): align vertically for diving entry
        if (p > 0.92 && !handoffTriggered) {
          handoffTriggered = true;
        }
      },
    },
    '-=0.08'
  );

  // Stage 3: Clean mouth penetration & handoff into 3D
  tl.to(
    chitElement,
    {
      opacity: 0,
      scale: 0.04,
      duration: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        if (onEnterMouth) onEnterMouth();
      },
    },
    '-=0.05'
  );

  return tl;
}

function THREE_lerp(a, b, t) {
  return a + (b - a) * t;
}
