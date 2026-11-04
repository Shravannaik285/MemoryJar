import React from 'react';
import MemoryJar3D from './jar/MemoryJar3D';
import './JarStage.css';

export default function JarStage({
  chits = [],
  chitCount = 24,
  onJarClick,
  isLidOpen = false,
  droppingChit = null,
  onChitLanded,
}) {
  return (
    <div className="jar-stage-container">
      {/* Background Cozy Window Props */}
      <div className="cozy-room-backdrop" aria-hidden="true">
        {/* Cute Smiling Night Lamp on Left */}
        <div className="desk-prop prop-lamp">
          <div className="lamp-glow"></div>
          <div className="lamp-face">
            <span className="lamp-eye">^</span>
            <span className="lamp-mouth">‿</span>
            <span className="lamp-eye">^</span>
          </div>
          <div className="lamp-stand"></div>
        </div>

        {/* Hanging Polaroids on Wall */}
        <div className="desk-prop prop-polaroids">
          <div className="polaroid polaroid-1">
            <div className="polaroid-photo sunrise"></div>
          </div>
          <div className="polaroid polaroid-2">
            <div className="polaroid-photo sunset"></div>
          </div>
        </div>

        {/* Ceramic Pencil Cup on Right */}
        <div className="desk-prop prop-cup">
          <div className="cup-pencils">
            <span className="pencil p-yellow"></span>
            <span className="pencil p-pink"></span>
            <span className="pencil p-blue"></span>
          </div>
          <div className="cup-body">
            <span className="cup-heart">♡</span>
          </div>
        </div>
      </div>

      {/* Floating Sparkles around the 3D Jar */}
      <div className="jar-sparkles-layer" aria-hidden="true">
        <span className="sparkle s-1">✨</span>
        <span className="sparkle s-2">✦</span>
        <span className="sparkle s-3">✨</span>
        <span className="sparkle s-4">✦</span>
        <span className="sparkle s-5">★</span>
      </div>

      {/* Target anchor reference for 2D-to-3D handoff */}
      <div className="jar-mouth-target-marker" aria-hidden="true"></div>

      {/* Actual Realistic Interactive 3D Three.js Glass Jar */}
      <MemoryJar3D
        chits={chits}
        chitCount={chitCount}
        onJarClick={onJarClick}
        isLidOpen={isLidOpen}
        droppingChit={droppingChit}
        onChitLanded={onChitLanded}
      />
    </div>
  );
}
