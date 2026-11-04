import { createPaperFoldTimeline } from './paperFoldTimeline';

/**
 * Enhanced paper fold animation with multi-stage progressive folding.
 */
export function animatePaperFold(options) {
  return createPaperFoldTimeline(options);
}

export { createPaperFoldTimeline };
