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
