import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import useMapStore from '../store/useMapStore';
import { landingSites } from '../data/landingSites';
import { geologicalFeatures } from '../data/geologicalFeatures';

// Convert lat/lon to 3D sphere coordinate
const latLonToVector3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

// Procedural Canvas-based High-Detail Mars Texture Generator
function createProceduralMarsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base Martian Ochre Background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#f1f5f9'); // North Polar Cap
  gradient.addColorStop(0.08, '#d97706');
  gradient.addColorStop(0.2, '#c2410c');
  gradient.addColorStop(0.5, '#9a3412'); // Equator
  gradient.addColorStop(0.8, '#c2410c');
  gradient.addColorStop(0.92, '#ea580c');
  gradient.addColorStop(1, '#f8fafc'); // South Polar Cap
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dark albedo regions (Syrtis Major, Acidalia Planitia, Sinus Sabaeus)
  ctx.fillStyle = 'rgba(67, 20, 7, 0.45)';
  // Syrtis Major
  ctx.beginPath();
  ctx.ellipse(1450, 480, 180, 140, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Acidalia Planitia
  ctx.beginPath();
  ctx.ellipse(800, 320, 240, 160, -Math.PI / 12, 0, Math.PI * 2);
  ctx.fill();

  // Sinus Sabaeus / Meridiani
  ctx.beginPath();
  ctx.ellipse(1100, 520, 320, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  // Valles Marineris canyon slash
  ctx.strokeStyle = 'rgba(40, 10, 4, 0.65)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(600, 540);
  ctx.bezierCurveTo(750, 560, 850, 550, 950, 580);
  ctx.stroke();

  // Tharsis Volcanic Province (Olympus Mons, Ascraeus, Pavonis, Arsia)
  ctx.fillStyle = 'rgba(217, 119, 6, 0.35)';
  ctx.beginPath();
  ctx.arc(420, 420, 55, 0, Math.PI * 2); // Olympus Mons
  ctx.fill();
  ctx.strokeStyle = 'rgba(80, 20, 5, 0.5)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Stippled crater details across the planet
  ctx.fillStyle = 'rgba(50, 15, 5, 0.2)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * canvas.width;
    const y = 150 + Math.random() * (canvas.height - 300);
    const r = 2 + Math.random() * 8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Brilliant Polar Ice Caps
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 0, 140, 0, Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height, 100, Math.PI, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Satellite orbiting Mars (MRO simulation)
const OrbitingSatellite = ({ radius }) => {
  const satRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.4;
    if (satRef.current) {
      satRef.current.position.x = Math.sin(t) * (radius + 0.6);
      satRef.current.position.z = Math.cos(t) * (radius + 0.6);
      satRef.current.position.y = Math.sin(t * 1.5) * 0.8;
    }
  });

  return (
    <group ref={satRef}>
      <mesh>
        <boxGeometry args={[0.04, 0.02, 0.06]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>
      {/* Solar Arrays */}
      <mesh position={[0.05, 0, 0]}>
        <boxGeometry args={[0.06, 0.005, 0.04]} />
        <meshStandardMaterial color="#0284c7" />
      </mesh>
      <mesh position={[-0.05, 0, 0]}>
        <boxGeometry args={[0.06, 0.005, 0.04]} />
        <meshStandardMaterial color="#0284c7" />
      </mesh>
      <Html distanceFactor={15}>
        <div className="bg-sky-950/80 text-sky-300 text-[9px] font-mono px-1 py-0.5 rounded border border-sky-400 whitespace-nowrap pointer-events-none">
          MRO Orbit
        </div>
      </Html>
    </group>
  );
};

const MarsGlobe = ({ waypoints }) => {
  const globeRef = useRef();
  const radius = 2;
  const { setSelectedPOI } = useMapStore();

  const marsTexture = useMemo(() => createProceduralMarsTexture(), []);

  // Waypoints 3D positions
  const waypointPositions = useMemo(() => {
    return waypoints.map(wp => {
      const lon = wp.lon !== undefined ? wp.lon : (wp.lng !== undefined ? wp.lng : 0);
      return latLonToVector3(wp.lat, lon, radius + 0.015);
    });
  }, [waypoints, radius]);

  // Key landing sites positions
  const landingPins = useMemo(() => {
    return landingSites.slice(0, 6).map(site => ({
      ...site,
      pos: latLonToVector3(site.lat, site.lon, radius + 0.02)
    }));
  }, [radius]);

  // Rotate slowly
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Main Planet Sphere with Texture */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial 
          map={marsTexture}
          roughness={0.85}
          metalness={0.08}
        />
      </mesh>

      {/* Atmospheric Scattering Glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.04, 48, 48]} />
        <meshBasicMaterial 
          color="#f47050" 
          transparent 
          opacity={0.16} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting Satellite */}
      <OrbitingSatellite radius={radius} />

      {/* Landing Sites Beacons */}
      {landingPins.map((site) => (
        <group key={`pin-${site.id}`} position={site.pos}>
          <mesh>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial color={site.color || '#38bdf8'} emissive={site.color || '#38bdf8'} emissiveIntensity={0.8} />
          </mesh>
          <Html distanceFactor={14} position={[0, 0.06, 0]} center>
            <button
              onClick={() => setSelectedPOI({ ...site, poiType: 'landingSite' })}
              className="bg-space-950/85 text-white hover:text-cyan-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/70 whitespace-nowrap shadow-md backdrop-blur-sm transition-transform hover:scale-105"
            >
              🚀 {site.name}
            </button>
          </Html>
        </group>
      ))}

      {/* Route Waypoints */}
      {waypointPositions.map((pos, idx) => (
        <mesh key={`wp-${idx}`} position={pos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.9} />
          <Html distanceFactor={12} position={[0, 0.05, 0]} center>
            <div className="bg-space-950/90 text-green-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-green-500/80 whitespace-nowrap backdrop-blur-sm pointer-events-none">
              WP {idx + 1}
            </div>
          </Html>
        </mesh>
      ))}

      {/* Route Polyline connecting waypoints */}
      {waypointPositions.length > 1 && (
        <Line
          points={waypointPositions}
          color="#22c55e"
          lineWidth={2.5}
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
          <p className="text-xs">Your browser or device does not support WebGL for the 3D globe view. Please switch to the 2D map view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-space-950 relative">
      <Canvas camera={{ position: [0, 0, 4.8], fov: 45 }}>
        <ambientLight intensity={0.25} />
        {/* Directional Sun simulating Day/Night Terminator */}
        <directionalLight position={[6, 2, 4]} intensity={2.2} color="#fff1e6" castShadow />
        <directionalLight position={[-6, -2, -4]} intensity={0.12} color="#1e293b" />
        
        <Stars radius={120} depth={60} count={6000} factor={4} saturation={0} fade speed={0.8} />
        
        <MarsGlobe waypoints={waypoints || []} />
        
        <OrbitControls 
          enablePan={false} 
          minDistance={2.4} 
          maxDistance={9} 
          zoomSpeed={0.8}
          rotateSpeed={0.5}
        />
      </Canvas>
      
      {/* 3D Viewport Controls & HUD Overlay */}
      <div className="absolute top-4 left-4 text-xs font-mono bg-space-950/80 px-3 py-1.5 rounded-lg border border-space-700/60 text-space-300 backdrop-blur-md flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>3D GLOBE • DAY/NIGHT TERMINATOR ACTIVE</span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-space-400 text-xs font-mono pointer-events-none bg-space-900/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-space-800">
        Drag to rotate • Scroll to zoom • Click pins to inspect
      </div>
    </div>
  );
}
