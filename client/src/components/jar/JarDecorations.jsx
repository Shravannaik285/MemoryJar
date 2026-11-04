import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Create a heart shape in 2D to extrude on the tag
function createHeartShape(size = 0.10) {
  const shape = new THREE.Shape();
  const x = 0;
  const y = 0;
  shape.moveTo(x, y + size * 0.3);
  shape.bezierCurveTo(x, y + size * 0.6, x - size * 0.5, y + size * 0.9, x - size, y + size * 0.9);
  shape.bezierCurveTo(x - size * 1.5, y + size * 0.9, x - size * 1.5, y + size * 0.3, x - size * 1.5, y + size * 0.3);
  shape.bezierCurveTo(x - size * 1.5, y, x - size * 1.1, y - size * 0.6, x, y - size * 1.2);
  shape.bezierCurveTo(x + size * 1.1, y - size * 0.6, x + size * 1.5, y, x + size * 1.5, y + size * 0.3);
  shape.bezierCurveTo(x + size * 1.5, y + size * 0.3, x + size * 1.5, y + size * 0.9, x + size, y + size * 0.9);
  shape.bezierCurveTo(x + size * 0.5, y + size * 0.9, x, y + size * 0.6, x, y + size * 0.3);
  return shape;
}

// Luggage tag shape with angled top corners
function createTagShape(width = 0.40, height = 0.54) {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;
  const chamfer = 0.08;

  shape.moveTo(-w, -h);
  shape.lineTo(w, -h);
  shape.lineTo(w, h - chamfer);
  shape.lineTo(w - chamfer, h);
  shape.lineTo(-w + chamfer, h);
  shape.lineTo(-w, h - chamfer);
  shape.closePath();

  return shape;
}

let cachedCoasterTexture = null;

function getCoasterTexture() {
  if (cachedCoasterTexture) return cachedCoasterTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  let seed = 12345;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Warm radial wood slice tone
  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
  grad.addColorStop(0, '#E8C59E');
  grad.addColorStop(0.65, '#CDA074');
  grad.addColorStop(0.88, '#9C6E44');
  grad.addColorStop(1.0, '#5A381A'); // Tree bark perimeter
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Tree rings
  ctx.strokeStyle = 'rgba(85, 45, 18, 0.14)';
  ctx.lineWidth = 2.2;
  for (let r = 24; r < 240; r += 12 + lcg() * 8) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  cachedCoasterTexture = tex;
  return tex;
}

export default function JarDecorations({ parentRotation = { x: 0, y: 0 } }) {
  const tagGroupRef = useRef();

  // Procedural wood coaster texture
  const coasterTexture = useMemo(() => getCoasterTexture(), []);

  const tagGeometry = useMemo(() => {
    const shape = createTagShape(0.40, 0.54);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.015,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
  }, []);

  const heartGeometry = useMemo(() => {
    const shape = createHeartShape(0.10);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.012,
      bevelEnabled: false,
    });
  }, []);

  // Tag gentle physics sway
  useFrame((state, delta) => {
    if (!tagGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    const rot = parentRotation?.current || parentRotation || { x: 0, y: 0 };
    const targetZ = Math.sin(time * 2.0) * 0.06 + rot.y * 0.15;
    const targetX = Math.cos(time * 1.5) * 0.04 - rot.x * 0.12;

    tagGroupRef.current.rotation.z = THREE.MathUtils.damp(tagGroupRef.current.rotation.z, targetZ, 8, delta);
    tagGroupRef.current.rotation.x = THREE.MathUtils.damp(tagGroupRef.current.rotation.x, targetX, 8, delta);
  });

  return (
    <group name="jar-decorations-group">
      {/* Rustic Coiled Twine wrapped horizontally around the neck */}
      <group position={[0, 1.36, 0]}>
        {/* Coil 1 */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.92, 0.026, 16, 64]} />
          <meshStandardMaterial color="#A67C52" roughness={0.88} />
        </mesh>
        {/* Coil 2 */}
        <mesh position={[0, -0.035, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.92, 0.026, 16, 64]} />
          <meshStandardMaterial color="#8E653C" roughness={0.88} />
        </mesh>
        {/* Coil 3 */}
        <mesh position={[0, -0.07, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.92, 0.026, 16, 64]} />
          <meshStandardMaterial color="#A67C52" roughness={0.88} />
        </mesh>

        {/* Twine Knot on Right Front Shoulder */}
        <mesh position={[0.72, -0.035, 0.58]} castShadow>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial color="#7D5832" roughness={0.9} />
        </mesh>

        {/* Hanging String down to tag */}
        <mesh position={[0.74, -0.16, 0.61]} rotation={[0.08, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#8E653C" roughness={0.9} />
        </mesh>
      </group>

      {/* Hanging Kraft Heart Tag */}
      <group
        ref={tagGroupRef}
        position={[0.82, 1.05, 0.66]}
        rotation={[0.12, 0.4, -0.08]}
      >
        {/* Tag Body (Kraft Paper) */}
        <mesh geometry={tagGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#E4C6A2"
            roughness={0.75}
            metalness={0.02}
          />
        </mesh>

        {/* Embossed Heart on Tag */}
        <mesh
          geometry={heartGeometry}
          position={[0, -0.04, 0.015]}
        >
          <meshStandardMaterial
            color="#A85744"
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>

        {/* Small Hole at top of tag */}
        <mesh position={[0, 0.20, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
          <meshBasicMaterial color="#5C3B24" />
        </mesh>
      </group>

      {/* Natural Wooden Slice Coaster Platform under Jar */}
      <group position={[0, -1.53, 0]} name="wooden-coaster">
        {/* Main wood disc with beveled bark edge */}
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[1.58, 1.64, 0.15, 48]} />
          <meshStandardMaterial
            map={coasterTexture}
            color="#E2B78C"
            roughness={0.68}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
}
