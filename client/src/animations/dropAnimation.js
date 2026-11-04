import { createChitFlightTimeline } from './chitFlightTimeline';

/**
 * Enhanced chit flight animation with 3D ballistic arc and lid synchronization.
 */
export function animateFlyToJar(options) {
  return createChitFlightTimeline(options);
}

export { createChitFlightTimeline };
