import { createPaperUnfoldTimeline, createPaperRefoldTimeline } from './paperUnfoldTimeline';

/**
 * Enhanced paper unfolding with progressive flap opening and reverse refolding.
 */
export function animatePaperUnfold(element, onComplete, options = {}) {
  return createPaperUnfoldTimeline({
    paperElement: element,
    onComplete,
    ...options,
  });
}

export function animatePaperRefold(element, onComplete, options = {}) {
  return createPaperRefoldTimeline({
    paperElement: element,
    onComplete,
    ...options,
  });
}

export { createPaperUnfoldTimeline, createPaperRefoldTimeline };
