import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Custom hook to control realistic 3D memory jar idle floating,
 * pointer-following tilt, hover scale, cheerful click shake, and
 * physical compression reaction when a memory chit drops into it.
 */
export function useJarAnimation({ onJarClick } = {}) {
  const jarGroupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const clickTimeoutRef = useRef(null);

  // Motion state vectors for smooth damping
  const targetRotation = useRef({ x: 0, y: 0, z: 0 });
  const currentRotation = useRef({ x: 0, y: 0, z: 0 });
  const shakeOffset = useRef({ x: 0, y: 0 });
  const shakeTimer = useRef(0);

  // Physical impact compression when a new chit drops in
  const impactTimer = useRef(0);
  const impactOffset = useRef({ y: 0, rotX: 0 });

  // Trigger gentle playful shake when jar is clicked
  const triggerClickAnimation = useCallback(() => {
    setIsClicked(true);
    shakeTimer.current = 1.0;

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setIsClicked(false);
    }, 650);

    if (onJarClick) onJarClick();
  }, [onJarClick]);

  // Trigger charming physical reaction when a new memory chit lands
  const triggerLandedReaction = useCallback(() => {
    impactTimer.current = 1.0;
  }, []);

  useFrame((state, delta) => {
    if (!jarGroupRef.current) return;

    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    // 1. Idle Gentle Floating & Subtle Swaying
    const floatY = Math.sin(time * 1.4) * 0.05;
    const idleRotY = Math.sin(time * 0.8) * 0.04;
    const idleRotZ = Math.cos(time * 1.1) * 0.02;

    // 2. Interactive Pointer Following Tilt (subtle & elegant)
    targetRotation.current.x = -pointer.y * 0.22;
    targetRotation.current.y = pointer.x * 0.28 + idleRotY;
    targetRotation.current.z = pointer.x * -0.06 + idleRotZ;

    // 3. Click Shake Effect decay
    if (shakeTimer.current > 0) {
      shakeTimer.current -= delta * 3.5;
      const decay = Math.max(0, shakeTimer.current);
      shakeOffset.current.x = Math.sin(time * 40) * 0.05 * decay;
      shakeOffset.current.y = Math.cos(time * 35) * 0.04 * decay;
    } else {
      shakeOffset.current.x = 0;
      shakeOffset.current.y = 0;
    }

    // 4. Physical Landed Reaction: coaster compression and gentle damped bounce
    if (impactTimer.current > 0) {
      impactTimer.current -= delta * 2.8;
      const decay = Math.max(0, impactTimer.current);
      // Compresses downward and bounces back up smoothly
      impactOffset.current.y = -Math.sin(decay * Math.PI * 2.2) * 0.045 * decay;
      impactOffset.current.rotX = Math.sin(decay * Math.PI * 3.0) * 0.02 * decay;
    } else {
      impactOffset.current.y = 0;
      impactOffset.current.rotX = 0;
    }

    // 5. Smooth Damping / Slerp
    currentRotation.current.x = THREE.MathUtils.damp(
      currentRotation.current.x,
      targetRotation.current.x,
      7,
      delta
    );
    currentRotation.current.y = THREE.MathUtils.damp(
      currentRotation.current.y,
      targetRotation.current.y,
      7,
      delta
    );
    currentRotation.current.z = THREE.MathUtils.damp(
      currentRotation.current.z,
      targetRotation.current.z,
      7,
      delta
    );

    // Apply rotations
    jarGroupRef.current.rotation.x =
      currentRotation.current.x + shakeOffset.current.y + impactOffset.current.rotX;
    jarGroupRef.current.rotation.y =
      currentRotation.current.y + shakeOffset.current.x;
    jarGroupRef.current.rotation.z = currentRotation.current.z;

    // Apply float & physical impact compression
    jarGroupRef.current.position.y =
      floatY + shakeOffset.current.y * 0.5 + impactOffset.current.y;

    // 6. Hover Scale Transition
    const targetScale = isHovered ? 1.03 : 1.0;
    jarGroupRef.current.scale.x = THREE.MathUtils.damp(
      jarGroupRef.current.scale.x,
      targetScale,
      8,
      delta
    );
    jarGroupRef.current.scale.y = THREE.MathUtils.damp(
      jarGroupRef.current.scale.y,
      targetScale,
      8,
      delta
    );
    jarGroupRef.current.scale.z = THREE.MathUtils.damp(
      jarGroupRef.current.scale.z,
      targetScale,
      8,
      delta
    );
  });

  return {
    jarGroupRef,
    isHovered,
    setIsHovered,
    isClicked,
    triggerClickAnimation,
    triggerLandedReaction,
    currentRotation: currentRotation,
  };
}
