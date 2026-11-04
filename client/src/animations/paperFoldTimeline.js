import gsap from 'gsap';

/**
 * Creates a multi-stage, physically believable paper folding timeline.
 * Folds progressive flaps: top fold down, bottom fold up, and side wings inward,
 * transforming flat stationery into a compact, creased paper chit.
 *
 * @param {Object} options
 * @param {HTMLElement} options.paperElement - The main paper container
 * @param {HTMLElement} options.topFlapElement - Top flap
 * @param {HTMLElement} options.bottomFlapElement - Bottom flap
 * @param {HTMLElement} options.formControlsElement - Form buttons and headers to fade out
 * @param {HTMLElement} options.chitTokenElement - The compact folded chit element to reveal
 * @param {boolean} options.reducedMotion - Whether user prefers reduced motion
 * @param {Function} options.onComplete - Callback when folding finishes
 * @returns {gsap.core.Timeline}
 */
export function createPaperFoldTimeline({
  paperElement,
  topFlapElement,
  bottomFlapElement,
  formControlsElement,
  chitTokenElement,
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

  // Reduced motion alternative: gentle fade and scale without intense 3D rotations
  if (reducedMotion) {
    tl.to(formControlsElement || paperElement, {
      opacity: 0,
      duration: 0.25,
      ease: 'power1.out',
    })
      .to(paperElement, {
        scale: 0.2,
        borderRadius: '8px',
        duration: 0.35,
        ease: 'power2.inOut',
      });
    return tl;
  }

  // Ensure high-fidelity 3D perspective
  gsap.set(paperElement, {
    transformPerspective: 1400,
    transformStyle: 'preserve-3d',
    transformOrigin: 'center center',
  });

  if (topFlapElement) {
    gsap.set(topFlapElement, {
      transformPerspective: 1200,
      transformOrigin: 'top center',
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
    });
  }

  if (bottomFlapElement) {
    gsap.set(bottomFlapElement, {
      transformPerspective: 1200,
      transformOrigin: 'bottom center',
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
    });
  }

  // STAGE 1: Tuck UI controls away & initial paper lift (anticipation)
  if (formControlsElement) {
    tl.to(formControlsElement, {
      opacity: 0,
      duration: 0.18,
      ease: 'power1.out',
    });
  }

  tl.to(
    paperElement,
    {
      scale: 0.96,
      rotateX: 4,
      boxShadow: '0 30px 60px rgba(60, 35, 20, 0.32)',
      duration: 0.25,
      ease: 'power2.out',
    },
    0
  );

  // STAGE 2: Top flap folds down 180° along the upper crease
  if (topFlapElement) {
    tl.to(topFlapElement, {
      rotateX: -180,
      boxShadow: '0 8px 16px rgba(50, 25, 10, 0.25)',
      duration: 0.38,
      ease: 'power3.inOut',
    });
  }

  // STAGE 3: Bottom flap folds up 180° along the lower crease
  if (bottomFlapElement) {
    tl.to(
      bottomFlapElement,
      {
        rotateX: 180,
        boxShadow: '0 -8px 16px rgba(50, 25, 10, 0.25)',
        duration: 0.38,
        ease: 'power3.inOut',
      },
      '-=0.22'
    );
  }

  // STAGE 4: Side origami squeeze / fold into long letter strip
  tl.to(
    paperElement,
    {
      scaleY: 0.42,
      rotateZ: -2,
      duration: 0.32,
      ease: 'power2.inOut',
    },
    '-=0.15'
  );

  // STAGE 5: Horizontal folds inward into compact physical chit
  tl.to(paperElement, {
    scaleX: 0.18,
    scaleY: 0.12,
    rotateZ: 6,
    rotateX: 18,
    borderRadius: '10px',
    boxShadow: '0 12px 28px rgba(60, 35, 20, 0.38)',
    duration: 0.4,
    ease: 'back.in(1.3)',
  });

  // Reveal the compact physical folded chit token inside if present
  if (chitTokenElement) {
    tl.to(
      chitTokenElement,
      {
        opacity: 1,
        duration: 0.15,
      },
      '-=0.2'
    );
  }

  // STAGE 6: Final physical anticipation hover
  tl.to(paperElement, {
    y: '-=12',
    scale: 0.2,
    rotateZ: -4,
    boxShadow: '0 20px 40px rgba(60, 35, 20, 0.45)',
    duration: 0.22,
    ease: 'power2.out',
  });

  return tl;
}

