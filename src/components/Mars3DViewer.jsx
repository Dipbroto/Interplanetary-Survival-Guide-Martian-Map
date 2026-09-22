import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import useMapStore from '../store/useMapStore';

// Utility to convert lat/lon to 3D sphere coordinates
const latLonToVector3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

const MarsGlobe = ({ waypoints }) => {
  const globeRef = useRef();
  const radius = 2;

  // Slowly rotate the globe
  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.02;
    }
  });

  // Calculate waypoint 3D positions
  const waypointPositions = useMemo(() => {
    return waypoints.map(wp => latLonToVector3(wp.lat, wp.lng, radius + 0.01));
  }, [waypoints, radius]);

  return (
    <group ref={globeRef}>
      {/* Main Planet Sphere */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial 
          color="#c1440e" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.05, 32, 32]} />
        <meshBasicMaterial 
          color="#f47050" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Waypoints */}
      {waypointPositions.map((pos, idx) => (
        <mesh key={`wp-${idx}`} position={pos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#00ffcc" />
          <Html position={[0, 0.05, 0]} center>
            <div className="bg-space-900/80 text-white text-[10px] px-1.5 py-0.5 rounded border border-cyan-500 whitespace-nowrap backdrop-blur-sm pointer-events-none">
              WP {idx + 1}
            </div>
          </Html>
        </mesh>
      ))}

      {/* Route Line connecting waypoints */}
      {waypointPositions.length > 1 && (
        <Line
          points={waypointPositions}
          color="#00ffcc"
          lineWidth={2}
          dashed={false}
        />
      )}
    </group>
  );
};

export default function Mars3DViewer() {
  const { waypoints } = useMapStore();
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-space-950 text-secondary">
        <div className="text-center p-6 glass-panel-solid rounded-xl max-w-md">
          <h3 className="text-mars-400 font-display text-xl mb-2">WebGL Required</h3>
          <p>Your browser or device does not support WebGL, which is required for the 3D globe view. Please switch to 2D view or enable hardware acceleration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-space-950 relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffd5c0" />
        <directionalLight position={[-5, -3, -5]} intensity={0.1} color="#405070" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <MarsGlobe waypoints={waypoints || []} />
        
        <OrbitControls 
          enablePan={false} 
          minDistance={2.5} 
          maxDistance={10} 
          zoomSpeed={0.8}
          rotateSpeed={0.5}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-space-400 text-xs font-mono pointer-events-none bg-space-900/50 px-3 py-1 rounded-full backdrop-blur-sm">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
