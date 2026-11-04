import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../../animations/birthdayRevealTimeline';
import './BirthdayReveal.css';

export default function ChitEruption({ memories = [], onEruptionComplete }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const reduced = prefersReducedMotion();

    if (reduced) {
      const timer = setTimeout(() => {
        if (onEruptionComplete) onEruptionComplete();
      }, 400);
      return () => clearTimeout(timer);
    }

    const chitElements = containerRef.current.querySelectorAll('.erupting-chit');
    if (!chitElements || chitElements.length === 0) {
      if (onEruptionComplete) onEruptionComplete();
      return;
    }

    // Limit active physics particles for performance on devices with many memories
    const maxParticles = Math.min(24, chitElements.length);
    const activeElements = Array.from(chitElements).slice(0, maxParticles);

    const tl = gsap.timeline({
      onComplete: () => {
        if (onEruptionComplete) onEruptionComplete();
      },
    });

    activeElements.forEach((el, i) => {
      // Deterministic spread angles
      const angle = (i / maxParticles) * Math.PI * 2;
      const spreadX = Math.cos(angle) * (100 + (i % 4) * 35);
      const spreadY = -140 - Math.abs(Math.sin(angle)) * (120 + (i % 3) * 30);
      const rot = (i * 37) % 70 - 35;

      tl.fromTo(
        el,
        {
          opacity: 0,
          scale: 0.25,
          x: 0,
          y: 60,
          rotation: 0,
        },
        {
          opacity: 1,
          scale: 1,
          x: spreadX,
          y: spreadY,
          rotation: rot,
          duration: 1.6,
          ease: 'power2.out',
        },
        i * 0.08 // Staggered arrival
      );
    });

    // Gentle floating settling before resolving to slideshow
    tl.to(activeElements, {
      y: '+=10',
      duration: 0.6,
      ease: 'sine.inOut',
    });

    return () => {
      tl.kill();
    };
  }, [memories, onEruptionComplete]);

  // Take up to 24 representative chits for the eruption burst
  const burstChits = memories.slice(0, 24);

  return (
    <div className="jar-opening-view" role="status" aria-live="polite">
      <div className="magical-jar-glow" aria-hidden="true" />
      <p className="opening-status-text">Your memories are taking flight! 🌸</p>

      <div ref={containerRef} className="chit-eruption-container" aria-hidden="true">
        {burstChits.map((chit, idx) => {
          const color = chit.chitColor || chit.color || '#FFB3C6';
          return (
            <div
              key={chit.id || idx}
              className="erupting-chit"
              style={{
                backgroundColor: color,
                color: '#4A3528',
              }}
            >
              ♡
            </div>
          );
        })}
      </div>
    </div>
  );
}

