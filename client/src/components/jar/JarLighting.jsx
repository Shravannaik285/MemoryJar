import React from 'react';
import { Environment, ContactShadows } from '@react-three/drei';

export default function JarLighting() {
  return (
    <>
      {/* Warm Ambient Fill */}
      <ambientLight color="#FFF3E6" intensity={0.9} />

      {/* Main Warm Sunlight from Upper Left (Window) */}
      <directionalLight
        position={[-3.5, 4.5, 3.0]}
        intensity={1.8}
        color="#FFF4DC"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={3.0}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.0005}
      />

      {/* Soft Rim Light from Back Right to Catch Glass Silhouette */}
      <directionalLight
        position={[3.0, 3.0, -3.0]}
        intensity={1.1}
        color="#E8DEFF"
      />

      {/* Warm Point Light close to jar simulating nearby smiling desk lamp */}
      <pointLight
        position={[-2.4, -0.6, 1.2]}
        intensity={1.4}
        color="#FFDAA8"
        distance={6}
        decay={2}
      />

      {/* Soft Gentle Front Fill */}
      <directionalLight
        position={[0, 1.0, 4.0]}
        intensity={0.4}
        color="#FFFFFF"
      />

      {/* Environment Map for rich realistic glass reflections */}
      <Environment preset="sunset" environmentIntensity={0.85} />

      {/* Ground Contact Shadow beneath the wooden platform */}
      <ContactShadows
        position={[0, -1.65, 0]}
        opacity={0.45}
        scale={5.5}
        blur={2.4}
        far={4.0}
        color="#3E2412"
      />
    </>
  );
}
