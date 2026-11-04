import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

let cachedWoodTexture = null;

function getWoodTexture() {
  if (cachedWoodTexture) return cachedWoodTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  let seed = 42;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Base cork/wood tone
  ctx.fillStyle = '#C29162';
  ctx.fillRect(0, 0, 512, 512);

  // Fine grain fibers
  for (let i = 0; i < 3500; i++) {
    const x = lcg() * 512;
    const y = lcg() * 512;
    const length = 4 + lcg() * 14;
    ctx.fillStyle = lcg() > 0.5 ? 'rgba(90, 55, 25, 0.16)' : 'rgba(255, 235, 195, 0.2)';
    ctx.fillRect(x, y, length, 1.5);
  }

  // Concentric growth rings on top
  ctx.strokeStyle = 'rgba(90, 55, 25, 0.14)';
  ctx.lineWidth = 2;
  for (let r = 20; r < 240; r += 14 + lcg() * 6) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  cachedWoodTexture = tex;
  return tex;
}

export default function JarLid({ isClicked = false, isOpen = false }) {
  const lidGroupRef = useRef();
  const currentY = useRef(1.48);
  const currentWobble = useRef(0);
  const currentRotZ = useRef(0);
  const currentRotX = useRef(0);
  const wasOpenRef = useRef(false);
  const snapBounceTimer = useRef(0);

  // Procedural cork / warm wood grain texture
  const woodTexture = useMemo(() => getWoodTexture(), []);

  // Smooth pop, lift & wobble animation when clicked or opened
  useFrame((_, delta) => {
    if (!lidGroupRef.current) return;

    let targetY = 1.48;
    let targetWobble = 0;
    let targetRotZ = 0;
    let targetRotX = 0;

    if (isOpen) {
      wasOpenRef.current = true;
      targetY = 2.22;
      targetRotZ = 0.34;
      targetRotX = 0.20;
    } else {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        snapBounceTimer.current = 1.0;
      }

      if (isClicked) {
        targetY = 1.76;
        targetWobble = 0.09;
      }
    }

    // Micro-bounce snap settling on rim when lid closes
    let snapOffset = 0;
    if (snapBounceTimer.current > 0) {
      snapBounceTimer.current -= delta * 4.5;
      const decay = Math.max(0, snapBounceTimer.current);
      snapOffset = Math.sin(decay * Math.PI * 3.5) * 0.025 * decay;
    }

    // Smooth spring lerp
    currentY.current = THREE.MathUtils.damp(currentY.current, targetY, isOpen ? 9 : 14, delta);
    currentWobble.current = THREE.MathUtils.damp(currentWobble.current, targetWobble, 10, delta);
    currentRotZ.current = THREE.MathUtils.damp(currentRotZ.current, targetRotZ, 8, delta);
    currentRotX.current = THREE.MathUtils.damp(currentRotX.current, targetRotX, 8, delta);

    lidGroupRef.current.position.y = currentY.current + snapOffset;
    lidGroupRef.current.rotation.z =
      currentRotZ.current + Math.sin(Date.now() * 0.015) * currentWobble.current;
    lidGroupRef.current.rotation.x =
      currentRotX.current + Math.cos(Date.now() * 0.012) * (currentWobble.current * 0.6);
  });

  return (
    <group ref={lidGroupRef} position={[0, 1.48, 0]} name="jar-lid-group">
      {/* Wooden Main Top Cap */}
      <mesh position={[0, 0.10, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.00, 0.96, 0.18, 48]} />
        <meshStandardMaterial
          map={woodTexture}
          color="#D4A373"
          roughness={0.65}
          metalness={0.04}
        />
      </mesh>

      {/* Rounded Chamfer Top Edge of Cap */}
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.94, 1.00, 0.04, 48]} />
        <meshStandardMaterial
          map={woodTexture}
          color="#DCAC7C"
          roughness={0.6}
          metalness={0.04}
        />
      </mesh>

      {/* Cork Stopper Plug that fits inside the neck */}
      <mesh position={[0, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.78, 0.76, 0.16, 32]} />
        <meshStandardMaterial
          map={woodTexture}
          color="#B88656"
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}
