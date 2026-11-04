import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import GlassBody from './GlassBody';
import JarLid from './JarLid';
import PaperChits3D from './PaperChits3D';
import JarDecorations from './JarDecorations';
import JarLighting from './JarLighting';
import { useJarAnimation } from '../../hooks/useJarAnimation';
import './MemoryJar3D.css';

// Internal animated jar assembly
function JarScene({
  chits = [],
  chitCount = 24,
  onJarClick,
  isLidOpen = false,
  droppingChit = null,
  onChitLanded,
}) {
  const {
    jarGroupRef,
    setIsHovered,
    isClicked,
    triggerClickAnimation,
    triggerLandedReaction,
    currentRotation,
  } = useJarAnimation({ onJarClick });

  const handleChitLandedWithReaction = (chit) => {
    triggerLandedReaction();
    if (onChitLanded) onChitLanded(chit);
  };

  return (
    <group
      ref={jarGroupRef}
      scale={[0.78, 0.78, 0.78]}
      position={[0, -0.05, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        triggerClickAnimation();
      }}
    >
      {/* 1. Folded Paper Chits Inside the Jar (rendered inside before glass) */}
      <PaperChits3D
        chits={chits}
        count={chitCount}
        droppingChit={droppingChit}
        onChitLanded={handleChitLandedWithReaction}
      />

      {/* 2. Transparent Glass Body with Physical Refraction & Clearcoat */}
      <GlassBody />

      {/* 3. Wooden / Cork Lid with pop, lift & wobble animation */}
      <JarLid isClicked={isClicked} isOpen={isLidOpen} />

      {/* 4. Twine, Hanging Kraft Heart Tag, & Wood Platform Coaster */}
      <JarDecorations parentRotation={currentRotation} />
    </group>
  );
}

export default function MemoryJar3D({
  chits = [],
  chitCount = 24,
  onJarClick,
  isLidOpen = false,
  droppingChit = null,
  onChitLanded,
}) {
  const hasWebGL = React.useMemo(() => {
    if (typeof window === 'undefined') return true;
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div
        className="memory-jar-3d-canvas-wrapper"
        onClick={onJarClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title="Click to interact with your jar!"
      >
        <svg viewBox="0 0 100 120" width="140" height="170" fill="none">
          <rect x="30" y="8" width="40" height="10" rx="3" fill="#B48261" />
          <path
            d="M20 25C20 20 25 18 35 18H65C75 18 80 20 80 25V95C80 105 70 112 50 112C30 112 20 105 20 95V25Z"
            fill="rgba(240, 248, 255, 0.6)"
            stroke="#E28E9D"
            strokeWidth="3"
          />
          <path
            d="M50 75L45 70C38 63 35 58 35 53C35 48 39 44 44 44C47 44 49 46 50 48C51 46 53 44 56 44C61 44 65 48 65 53C65 58 62 63 55 70L50 75Z"
            fill="#F48B9F"
          />
        </svg>
        <span style={{ fontSize: '0.85rem', color: '#8C7A6B', marginTop: '0.5rem' }}>
          {chits.length} {chits.length === 1 ? 'memory' : 'memories'} inside
        </span>
      </div>
    );
  }

  return (
    <div className="memory-jar-3d-canvas-wrapper" title="Click jar to playfully shake it!">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.1, 6.2], fov: 38 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="r3f-jar-canvas"
      >
        <Suspense fallback={null}>
          <JarLighting />
          <JarScene
            chits={chits}
            chitCount={chitCount}
            onJarClick={onJarClick}
            isLidOpen={isLidOpen}
            droppingChit={droppingChit}
            onChitLanded={onChitLanded}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
