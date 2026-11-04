import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to coordinate animations, prevent race conditions,
 * manage GSAP timeline lifecycles, and handle reduced-motion settings.
 */
export function useAnimationController() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle' | 'folding' | 'flying' | 'dropping' | 'settling'
  const activeTimelinesRef = useRef(new Set());
  const safetyTimeoutRef = useRef(null);

  // Check user preference for reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setPrefersReducedMotion(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Register a GSAP timeline for automatic tracking & cleanup without overwriting existing onComplete
  const registerTimeline = useCallback((tl) => {
    if (!tl) return null;
    activeTimelinesRef.current.add(tl);
    const prevComplete = tl.eventCallback('onComplete');
    tl.eventCallback('onComplete', (...args) => {
      activeTimelinesRef.current.delete(tl);
      if (typeof prevComplete === 'function') {
        prevComplete(...args);
      }
    });
    return tl;
  }, []);

  // Clean up all active animations
  const killAllAnimations = useCallback(() => {
    activeTimelinesRef.current.forEach((tl) => {
      if (tl && tl.kill) tl.kill();
    });
    activeTimelinesRef.current.clear();
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    setIsAnimating(false);
    setAnimationPhase('idle');
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      killAllAnimations();
    };
  }, [killAllAnimations]);

  // Execute an animation sequence safely with fallback timeout protection
  const runGuardedSequence = useCallback(
    ({ sequenceName, timeoutMs = 8000, execute, onFinished, onFailed }) => {
      if (isAnimating) {
        console.warn(`[AnimationController] Cannot start "${sequenceName}" — another animation is in progress.`);
        return false;
      }

      setIsAnimating(true);
      setAnimationPhase(sequenceName || 'busy');

      let completed = false;

      const finishOnce = () => {
        if (completed) return;
        completed = true;
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
        setIsAnimating(false);
        setAnimationPhase('idle');
        if (onFinished) onFinished();
      };

      // Safety timer: guarantees recovery if browser tab is backgrounded
      safetyTimeoutRef.current = setTimeout(() => {
        if (!completed) {
          console.warn(`[AnimationController] "${sequenceName}" exceeded safety timeout of ${timeoutMs}ms. Recovering state.`);
          killAllAnimations();
          finishOnce();
          if (onFailed) onFailed();
        }
      }, timeoutMs);

      try {
        execute(finishOnce);
        return true;
      } catch (err) {
        console.error(`[AnimationController] Error during sequence "${sequenceName}":`, err);
        killAllAnimations();
        finishOnce();
        if (onFailed) onFailed(err);
        return false;
      }
    },
    [isAnimating, killAllAnimations]
  );

  return {
    isAnimating,
    animationPhase,
    setAnimationPhase,
    prefersReducedMotion,
    registerTimeline,
    killAllAnimations,
    runGuardedSequence,
  };
}
