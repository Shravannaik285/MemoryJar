import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Pastel palette fallback
const CHIT_COLORS = [
  '#FFB3C6', // Pastel Pink
  '#FFE66D', // Sunny Pastel Yellow
  '#A9DEF9', // Baby Blue
  '#FFCAD4', // Soft Peach
  '#D0BCFE', // Soft Lavender
  '#D8F3DC', // Mint Green
  '#FFCCD5', // Rose Pink
  '#FFF099', // Creamy Yellow
  '#C5BAFF', // Lilac
];

// Deterministic PRNG seeded by index so existing chits never reshuffle
function seeded(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

// Procedural folded paper chit geometry generator
function createFoldedPaperGeometry(type = 0) {
  const geom = new THREE.BufferGeometry();

  if (type === 0) {
    // V-Folded Note with central crease and angled wings
    const w = 0.25;
    const h = 0.18;
    const foldHeight = 0.055;

    const vertices = new Float32Array([
      // Left wing
      -w, 0, -h / 2,
      0, foldHeight, -h / 2,
      -w, 0, h / 2,

      0, foldHeight, -h / 2,
      0, foldHeight, h / 2,
      -w, 0, h / 2,

      // Right wing
      0, foldHeight, -h / 2,
      w, 0, -h / 2,
      0, foldHeight, h / 2,

      w, 0, -h / 2,
      w, 0, h / 2,
      0, foldHeight, h / 2,
    ]);

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  } else {
    // Envelope / Triangular folded origami chit
    const size = 0.23;
    const peak = 0.065;

    const vertices = new Float32Array([
      // Front top flap
      -size, 0, -size * 0.7,
      size, 0, -size * 0.7,
      0, peak, 0,

      // Right flap
      size, 0, -size * 0.7,
      size * 0.8, 0, size * 0.7,
      0, peak, 0,

      // Bottom flap
      size * 0.8, 0, size * 0.7,
      -size * 0.8, 0, size * 0.7,
      0, peak, 0,

      // Left flap
      -size * 0.8, 0, size * 0.7,
      -size, 0, -size * 0.7,
      0, peak, 0,

      // Base
      -size, 0, -size * 0.7,
      size * 0.8, 0, size * 0.7,
      size, 0, -size * 0.7,

      -size, 0, -size * 0.7,
      -size * 0.8, 0, size * 0.7,
      size * 0.8, 0, size * 0.7,
    ]);

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  }

  geom.computeVertexNormals();
  return geom;
}

// Falling 3D Chit with physical air drag, flutter, and soft landing bounce
function FallingChitMesh({ chit, geometry, targetPos, onLanded }) {
  const meshRef = useRef();
  const progressRef = useRef(0);
  const landedRef = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current || landedRef.current) return;

    progressRef.current += delta * 1.35; // ~0.75s graceful descent
    const t = Math.min(1, progressRef.current);

    const startY = 1.48;

    // Aerodynamic freefall curve
    let currentY;
    let bounceY = 0;

    if (t < 0.85) {
      // Freefall under gravity
      const fallT = t / 0.85;
      currentY = THREE.MathUtils.lerp(startY, targetPos[1], fallT * fallT);
    } else {
      // Touchdown compression & micro bounce
      const bounceT = (t - 0.85) / 0.15;
      currentY = targetPos[1];
      bounceY = Math.sin(bounceT * Math.PI) * 0.045 * (1 - bounceT);
    }

    // Organic lateral air flutter
    const flutterX = Math.sin(t * Math.PI * 4.5) * 0.08 * (1 - t);
    const flutterZ = Math.cos(t * Math.PI * 3.8) * 0.08 * (1 - t);

    const currentX = THREE.MathUtils.lerp(0, targetPos[0], Math.min(1, t * 1.1)) + flutterX;
    const currentZ = THREE.MathUtils.lerp(0, targetPos[2], Math.min(1, t * 1.1)) + flutterZ;

    meshRef.current.position.set(currentX, currentY + bounceY, currentZ);

    // Tumbling rotations slowing down as chit nears the resting pile
    const rotSpeed = Math.max(0.2, 1 - t * 0.8);
    meshRef.current.rotation.x += delta * 13 * rotSpeed;
    meshRef.current.rotation.y += delta * 9 * rotSpeed;
    meshRef.current.rotation.z += delta * 7 * rotSpeed;

    if (t >= 1 && !landedRef.current) {
      landedRef.current = true;
      if (onLanded) onLanded(chit);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 1.48, 0]}
      scale={[1.32, 1.32, 1.32]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={chit.color || '#FFB3C6'}
        roughness={0.7}
        metalness={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function PaperChits3D({
  chits = [],
  count,
  droppingChit = null,
  onChitLanded,
}) {
  const groupRef = useRef();
  const settlePulseTimer = useRef(0);

  const geometries = useMemo(
    () => [createFoldedPaperGeometry(0), createFoldedPaperGeometry(1)],
    []
  );

  // Total items to render in the resting pile from IndexedDB
  const totalItems = Array.isArray(chits) ? chits.length : (typeof count === 'number' ? count : 0);

  // Golden angle (approx 137.5°) for natural organic phyllotaxis distribution
  const GOLDEN_ANGLE = 2.399963;

  // Build deterministic resting positions for all chits
  const restingChits = useMemo(() => {
    const items = [];

    for (let i = 0; i < totalItems; i++) {
      const s1 = seeded(i * 7 + 1);
      const s2 = seeded(i * 7 + 2);
      const s3 = seeded(i * 7 + 3);
      const s4 = seeded(i * 7 + 4);
      const s5 = seeded(i * 7 + 5);

      // Height accumulates upwards from concave base -1.36 up to max 0.85
      const progress = i / Math.max(24, totalItems);
      const y = Math.min(0.85, -1.36 + progress * 1.55 + (s1 - 0.5) * 0.08);

      // Radius matching inner jar taper (narrower towards shoulder)
      const maxR = progress > 0.72 ? 0.68 : 0.90;
      const angle = i * GOLDEN_ANGLE + (s2 - 0.5) * 0.35;
      const r = (0.18 + 0.78 * Math.sqrt(s3)) * maxR;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // Realistic 3D rotation angles: bottom chits flatter, upper chits lean naturally
      const tiltFactor = Math.min(1, 0.35 + progress * 0.65);
      const rotX = (s4 - 0.5) * (1.1 * tiltFactor);
      const rotY = s5 * Math.PI * 2;
      const rotZ = (s1 - 0.5) * (0.9 * tiltFactor);

      // Color from chit object if available, otherwise fallback
      const color =
        chits && (chits[i]?.chitColor || chits[i]?.color)
          ? (chits[i].chitColor || chits[i].color)
          : CHIT_COLORS[i % CHIT_COLORS.length];

      const geomType = i % 2;
      const scale = 1.18 + (s2 - 0.5) * 0.22;

      items.push({
        id: chits && chits[i]?.id ? chits[i].id : `c-${i}`,
        pos: [x, y, z],
        rot: [rotX, rotY, rotZ],
        color,
        geomType,
        scale: [scale, scale, scale],
      });
    }

    return items;
  }, [totalItems, chits]);

  // Target landing position for the currently dropping chit (lands on top of the pile)
  const droppingTargetPos = useMemo(() => {
    const nextIndex = totalItems;
    const s3 = seeded(nextIndex * 7 + 3);

    const progress = nextIndex / Math.max(24, totalItems + 1);
    const y = Math.min(0.9, -1.36 + progress * 1.55);
    const maxR = 0.72;
    const angle = nextIndex * GOLDEN_ANGLE;
    const r = (0.2 + 0.65 * Math.sqrt(s3)) * maxR;

    return [Math.cos(angle) * r, y, Math.sin(angle) * r];
  }, [totalItems]);

  // Trigger pile micro-settle when a chit lands
  const handleInternalChitLanded = (chit) => {
    settlePulseTimer.current = 1.0;
    if (onChitLanded) onChitLanded(chit);
  };

  // Micro-motion & settling wave on top resting chits
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Decay the settling pulse
    if (settlePulseTimer.current > 0) {
      settlePulseTimer.current -= delta * 2.5;
    }
    const settleIntensity = Math.max(0, settlePulseTimer.current);

    const children = groupRef.current.children;
    if (children.length > 5) {
      const topCount = Math.min(6, children.length);
      for (let i = children.length - topCount; i < children.length; i++) {
        const chit = children[i];
        if (chit) {
          // Idle breathing
          const idleY = Math.sin(time * 1.2 + i) * 0.0003;
          const idleRotY = Math.sin(time * 0.8 + i) * 0.0005;

          // Impact settling compaction wave
          const settleOffset = Math.sin(time * 24 + i) * 0.006 * settleIntensity;

          chit.position.y += idleY - settleOffset * 0.2;
          chit.rotation.y += idleRotY;
        }
      }
    }
  });

  return (
    <group ref={groupRef} name="paper-chits-group" renderOrder={1}>
      {/* 1. Resting Pile with Organic Distribution */}
      {restingChits.map((item) => (
        <mesh
          key={item.id}
          geometry={geometries[item.geomType]}
          position={item.pos}
          rotation={item.rot}
          scale={item.scale}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={item.color}
            roughness={0.7}
            metalness={0.02}
            side={THREE.DoubleSide}
            flatShading={false}
          />
        </mesh>
      ))}

      {/* 2. Active Dropping Chit (Falling through the neck & landing) */}
      {droppingChit && (
        <FallingChitMesh
          chit={droppingChit}
          geometry={geometries[0]}
          targetPos={droppingTargetPos}
          onLanded={handleInternalChitLanded}
        />
      )}
    </group>
  );
}
