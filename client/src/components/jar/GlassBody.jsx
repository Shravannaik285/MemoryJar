import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function GlassBody() {
  // Clean, continuous single-surface outer glass lathe geometry
  // with smooth normals for pristine optical transmission and specular sheen
  const geometry = useMemo(() => {
    const points = [];

    // Flat bottom base with slight concave kickup (like real jars)
    points.push(new THREE.Vector2(0.0, -1.45));
    points.push(new THREE.Vector2(0.85, -1.45));
    points.push(new THREE.Vector2(1.10, -1.42));
    points.push(new THREE.Vector2(1.24, -1.32));
    points.push(new THREE.Vector2(1.28, -1.18));

    // Cylindrical Body Wall (with subtle organic barrel taper)
    points.push(new THREE.Vector2(1.30, -0.6));
    points.push(new THREE.Vector2(1.32, 0.0));
    points.push(new THREE.Vector2(1.30, 0.5));

    // Curved Shoulders
    points.push(new THREE.Vector2(1.24, 0.85));
    points.push(new THREE.Vector2(1.12, 1.10));
    points.push(new THREE.Vector2(0.96, 1.25));

    // Neck Inset & Thread Collar
    points.push(new THREE.Vector2(0.88, 1.32));
    points.push(new THREE.Vector2(0.94, 1.38));
    points.push(new THREE.Vector2(0.94, 1.44));

    // Top Rim Lip (Smooth Curved Lip)
    points.push(new THREE.Vector2(0.88, 1.48));
    points.push(new THREE.Vector2(0.82, 1.48));
    points.push(new THREE.Vector2(0.80, 1.42));

    const lathe = new THREE.LatheGeometry(points, 64);
    lathe.computeVertexNormals();
    return lathe;
  }, []);

  return (
    <mesh
      geometry={geometry}
      castShadow
      receiveShadow
      renderOrder={10}
      name="jar-glass-body"
    >
      <meshPhysicalMaterial
        color="#F8FAFC"
        transmission={0.98}
        opacity={1}
        transparent={true}
        roughness={0.03}
        metalness={0.0}
        ior={1.48}
        thickness={0.7}
        specularIntensity={1.0}
        specularColor="#FFFFFF"
        clearcoat={1.0}
        clearcoatRoughness={0.03}
        envMapIntensity={1.0}
        attenuationColor="#FFFFFF"
        attenuationDistance={6.0}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}
