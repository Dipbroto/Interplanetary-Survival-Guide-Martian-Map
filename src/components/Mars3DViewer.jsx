import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line, useGLTF, Resize } from '@react-three/drei';
import * as THREE from 'three';
import useMapStore from '../store/useMapStore';
import { landingSites } from '../data/landingSites';
import { geologicalFeatures } from '../data/geologicalFeatures';
import { playUiClick, playUiHover, playUiSwoosh } from '../utils/audioSynthesizer';
import { 
  Play, Pause, RotateCw, Sun, Satellite, Navigation, 
  MapPin, Sparkles, Layers, Eye, Mountain, Compass, Shield,
  AlertTriangle, Droplets, Activity, Zap, Radio, Rocket
} from 'lucide-react';

// Convert lat/lon (degrees) to 3D sphere coordinate
const latLonToVector3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

// Generate 3D circle points around a center (lat, lon) on sphere
const createContourCircle = (centerLat, centerLon, radiusDegrees, sphereRadius, numPoints = 64) => {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const lat = centerLat + Math.sin(angle) * radiusDegrees;
    const lon = centerLon + (Math.cos(angle) * radiusDegrees) / Math.cos((centerLat * Math.PI) / 180);
    points.push(latLonToVector3(lat, lon, sphereRadius));
  }
  return points;
};

// Martian Hazards (Radiation Spikes & Active Dust Storms)
const hazardMarkers = [
  { id: 'rad-1', name: 'Radiation Spike Alpha', lat: 18.2, lon: -112.5, type: 'radiation', level: '14.2 mSv/h', icon: '☢️', color: '#f43f5e', desc: 'Solar proton storm surge peak' },
  { id: 'rad-2', name: 'Gale Rim GCR Exposure', lat: -4.6, lon: 137.4, type: 'radiation', level: '9.8 mSv/h', icon: '☢️', color: '#f43f5e', desc: 'Unshielded cosmic ray elevation' },
  { id: 'rad-3', name: 'Noachis Magnetic Anomaly', lat: -32.0, lon: 45.0, type: 'radiation', level: '11.5 mSv/h', icon: '☢️', color: '#f43f5e', desc: 'Crustal remnant magnetic cusp' },
  { id: 'dust-1', name: 'Hellas Convective Squall', lat: -42.0, lon: 70.0, type: 'dust', level: 'τ 3.40 (Dense)', icon: '🌪️', color: '#FF4C29', desc: 'Active convective dust wall' },
  { id: 'dust-2', name: 'Valles Marineris Dust Inflow', lat: -14.0, lon: -58.0, type: 'dust', level: 'τ 2.15 (Advancing)', icon: '🌪️', color: '#FF4C29', desc: 'Chasma wind shear accumulation' },
  { id: 'dust-3', name: 'Acidalia Regional Dust Front', lat: 48.0, lon: -25.0, type: 'dust', level: 'τ 1.95 (Active)', icon: '🌪️', color: '#FF4C29', desc: 'Frontal squall line' }
];

// Martian Subsurface Ice Resources
const resourceMarkers = [
  { id: 'ice-1', name: 'Utopia Glacial Sheet', lat: 46.7, lon: 117.5, type: 'ice', depth: '1.2m depth', volume: '10,000 km³', icon: '🧊', color: '#00FFCC', desc: 'SHARAD radar-verified water ice sheet' },
  { id: 'ice-2', name: 'Korolev Crater Ice Dome', lat: 73.0, lon: 165.0, type: 'ice', depth: 'Surface dome', volume: '2,200 km³', icon: '🧊', color: '#00FFCC', desc: '1.8 km thick permanent glacial ice dome' },
  { id: 'ice-3', name: 'Arcadia Shallow Permafrost', lat: 39.3, lon: -171.0, type: 'ice', depth: '1.5m depth', volume: 'High Purity', icon: '🧊', color: '#00FFCC', desc: 'Ideal for human Marswalk ISRU harvesting' },
  { id: 'ice-4', name: 'Deuteronilus Glacial Apron', lat: 43.9, lon: 24.3, type: 'ice', depth: '0.8m depth', volume: 'Glacial Core', icon: '🧊', color: '#00FFCC', desc: 'Debris-covered glacial tongue' }
];

// Procedural High-Definition Mars Surface Texture (2048 x 1024)
function createProceduralMarsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base Martian ochre gradient with realistic latitudinal temperature banding
  const baseGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  baseGrad.addColorStop(0, '#f8fafc');    // North Polar Ice Cap (pure white/frost)
  baseGrad.addColorStop(0.04, '#e2e8f0');
  baseGrad.addColorStop(0.09, '#c2410c'); // North Subpolar dunes (Vastitas Borealis)
  baseGrad.addColorStop(0.25, '#d97706'); // Northern plains (Acidalia / Utopia)
  baseGrad.addColorStop(0.48, '#9a3412'); // Equatorial highlands
  baseGrad.addColorStop(0.52, '#7c2d12'); // Deep rust
  baseGrad.addColorStop(0.72, '#b45309'); // Southern cratered highlands
  baseGrad.addColorStop(0.92, '#ea580c'); // South subpolar
  baseGrad.addColorStop(0.96, '#e2e8f0');
  baseGrad.addColorStop(1, '#ffffff');    // South Polar Ice Cap
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Micro-noise stippling for terrain granular texture
  ctx.fillStyle = 'rgba(67, 20, 7, 0.08)';
  for (let i = 0; i < 8000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = 80 + Math.random() * (canvas.height - 160);
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  // Major Dark Albedo Lowlands & Basaltic Provinces
  ctx.fillStyle = 'rgba(56, 15, 6, 0.65)';
  ctx.beginPath();
  ctx.ellipse(1460, 470, 190, 130, Math.PI / 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(820, 310, 240, 150, -Math.PI / 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(1120, 520, 340, 75, -Math.PI / 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(1680, 620, 280, 110, Math.PI / 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(640, 640, 90, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(1780, 300, 210, 120, 0, 0, Math.PI * 2);
  ctx.fill();

  // Valles Marineris Canyon System
  ctx.strokeStyle = 'rgba(30, 8, 3, 0.85)';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(560, 530);
  ctx.bezierCurveTo(720, 560, 840, 545, 960, 575);
  ctx.stroke();

  // Canyon tributaries
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(680, 510);
  ctx.lineTo(760, 535);
  ctx.moveTo(790, 545);
  ctx.lineTo(840, 600);
  ctx.stroke();

  // Tharsis Volcanic Shield Plateaus
  ctx.fillStyle = 'rgba(234, 88, 12, 0.4)';
  ctx.beginPath();
  ctx.ellipse(440, 500, 260, 240, 0, 0, Math.PI * 2);
  ctx.fill();

  // Olympus Mons Caldera & Outer Aureole Scarp
  const oGrad = ctx.createRadialGradient(420, 410, 8, 420, 410, 68);
  oGrad.addColorStop(0, '#f97316');
  oGrad.addColorStop(0.3, '#ea580c');
  oGrad.addColorStop(0.85, '#9a3412');
  oGrad.addColorStop(1, 'rgba(40, 10, 4, 0.7)');
  ctx.fillStyle = oGrad;
  ctx.beginPath();
  ctx.arc(420, 410, 65, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30, 8, 3, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(420, 410, 12, 0, Math.PI * 2);
  ctx.stroke();

  // Tharsis Montes Trio
  const tharsisPeaks = [
    { x: 520, y: 440, r: 24, name: 'Ascraeus' },
    { x: 490, y: 510, r: 22, name: 'Pavonis' },
    { x: 460, y: 580, r: 26, name: 'Arsia' }
  ];
  tharsisPeaks.forEach(peak => {
    ctx.fillStyle = 'rgba(194, 65, 12, 0.7)';
    ctx.beginPath();
    ctx.arc(peak.x, peak.y, peak.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40, 10, 4, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Elysium Mons
  ctx.fillStyle = 'rgba(194, 65, 12, 0.6)';
  ctx.beginPath();
  ctx.arc(1720, 390, 35, 0, Math.PI * 2);
  ctx.fill();

  // Hellas Planitia Basin
  const hellasGrad = ctx.createRadialGradient(1380, 720, 10, 1380, 720, 140);
  hellasGrad.addColorStop(0, 'rgba(234, 179, 8, 0.45)');
  hellasGrad.addColorStop(0.8, 'rgba(154, 52, 18, 0.4)');
  hellasGrad.addColorStop(1, 'rgba(67, 20, 7, 0.2)');
  ctx.fillStyle = hellasGrad;
  ctx.beginPath();
  ctx.arc(1380, 720, 135, 0, Math.PI * 2);
  ctx.fill();

  // Impact craters
  for (let i = 0; i < 450; i++) {
    const cx = Math.random() * canvas.width;
    const cy = 110 + Math.random() * (canvas.height - 220);
    const cr = 2 + Math.random() * 9;
    ctx.fillStyle = 'rgba(45, 12, 5, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, Math.PI * 0.8, Math.PI * 1.8);
    ctx.stroke();
  }

  // Polar Ice Caps
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 0, 150, 0, Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height, 110, Math.PI, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural Grayscale Mars Bump / Elevation Map (1024 x 512)
function createProceduralMarsBumpMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Olympus Mons (+21 km summit)
  const oGrad = ctx.createRadialGradient(210, 205, 2, 210, 205, 36);
  oGrad.addColorStop(0, '#ffffff');
  oGrad.addColorStop(0.4, '#dcdcdc');
  oGrad.addColorStop(0.85, '#a0a0a0');
  oGrad.addColorStop(0.9, '#404040');
  oGrad.addColorStop(1, '#808080');
  ctx.fillStyle = oGrad;
  ctx.beginPath();
  ctx.arc(210, 205, 36, 0, Math.PI * 2);
  ctx.fill();

  // Tharsis Montes Trio
  [
    { x: 260, y: 220, r: 14 },
    { x: 245, y: 255, r: 13 },
    { x: 230, y: 290, r: 15 }
  ].forEach(p => {
    const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.r);
    grad.addColorStop(0, '#f5f5f5');
    grad.addColorStop(0.7, '#b0b0b0');
    grad.addColorStop(1, '#808080');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Vertical Holographic Laser Light Pillar Beacon
const HoloBeacon = ({ position, color = '#00FFCC', height = 0.35, label, sublabel, icon = '📍', onClick }) => {
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const orientation = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal]);

  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const s = 1 + (Math.sin(clock.getElapsedTime() * 3.5) + 1) * 0.22;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position} quaternion={orientation}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.018, 0.045, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.75} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      <mesh position={[0, 0.015, 0]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2.0} 
        />
      </mesh>

      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.003, 0.01, height, 16, 1, true]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.65} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      <mesh position={[0, height, 0]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <Html
        position={[0, height + 0.06, 0]}
        center
        distanceFactor={6}
        className="pointer-events-none select-none z-10"
      >
        <div 
          onClick={onClick}
          className="pointer-events-auto cursor-pointer flex flex-col items-center group transition-transform duration-200 hover:scale-110"
        >
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-xl border shadow-lg font-mono text-[10px]"
            style={{ 
              backgroundColor: 'rgba(11, 12, 16, 0.94)', 
              borderColor: `${color}88`,
              boxShadow: `0 0 16px ${color}66`
            }}
          >
            <span className="text-xs">{icon}</span>
            <span className="font-bold text-white tracking-wide whitespace-nowrap">{label}</span>
          </div>
          {sublabel && (
            <div className="text-[9px] font-mono text-space-300 bg-space-950/85 px-1.5 py-0.5 rounded mt-0.5 border border-white/5 whitespace-nowrap">
              {sublabel}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// Pulsing Hazard & Resource Beacon (Expanding Warning Rings)
const PulsingBeacon = ({ position, color = '#FF4C29', label, sublabel, icon = '⚠️', type = 'hazard' }) => {
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const orientation = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal]);

  const ring1 = useRef();
  const ring2 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3;
    if (ring1.current) {
      const s1 = 1 + (t % 2) * 1.2;
      ring1.current.scale.set(s1, s1, s1);
      ring1.current.material.opacity = Math.max(0, 1 - (t % 2) / 2);
    }
    if (ring2.current) {
      const s2 = 1 + ((t + 1) % 2) * 1.2;
      ring2.current.scale.set(s2, s2, s2);
      ring2.current.material.opacity = Math.max(0, 1 - ((t + 1) % 2) / 2);
    }
  });

  return (
    <group position={position} quaternion={orientation}>
      <mesh ref={ring1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.02, 0.055, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.02, 0.055, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
      </mesh>

      <Html position={[0, 0.08, 0]} center distanceFactor={6} className="pointer-events-none select-none z-10">
        <div className="flex flex-col items-center">
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg backdrop-blur-xl border font-mono text-[9px] shadow-lg"
            style={{ 
              backgroundColor: 'rgba(11, 12, 16, 0.95)', 
              borderColor: `${color}88`,
              boxShadow: `0 0 14px ${color}66`
            }}
          >
            <span className="text-xs">{icon}</span>
            <span className="font-bold text-white tracking-wide whitespace-nowrap">{label}</span>
          </div>
          <div className="text-[8px] font-mono text-space-300 bg-space-950/90 px-1 py-0.2 rounded mt-0.5 whitespace-nowrap">
            {sublabel}
          </div>
        </div>
      </Html>
    </group>
  );
};

// MRO Reconnaissance Satellite with Scanning Radar Fan Cone
const MROSatellite = ({ radius = 2.0, showScanner = true }) => {
  const satelliteRef = useRef();
  const orbitRadius = radius * 1.34;
  const orbitSpeed = 0.28;

  useFrame(({ clock }) => {
    if (satelliteRef.current) {
      const t = clock.getElapsedTime() * orbitSpeed;
      const x = Math.cos(t) * orbitRadius;
      const z = Math.sin(t) * orbitRadius;
      const y = Math.sin(t * 1.5) * 0.45;
      satelliteRef.current.position.set(x, y, z);
      satelliteRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={satelliteRef}>
      <mesh>
        <boxGeometry args={[0.045, 0.03, 0.03]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.065, 0, 0]}>
        <boxGeometry args={[0.075, 0.024, 0.003]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.065, 0, 0]}>
        <boxGeometry args={[0.075, 0.024, 0.003]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      {showScanner && (
        <mesh position={[0, 0, -orbitRadius * 0.17]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.35, orbitRadius * 0.34, 32, 1, true]} />
          <meshBasicMaterial 
            color="#00FFCC" 
            transparent 
            opacity={0.18} 
            blending={THREE.AdditiveBlending} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}
    </group>
  );
};

// Smooth Camera Controller
// 3D Animated Martian Dust Storm Particle Vortex (Swirling Convective Funnel)
const DustStormParticleVortex = ({ centerLat = -42.4, centerLon = 70.5, radius = 2.0, color = '#FF4C29' }) => {
  const pointsRef = useRef();
  const normal = useMemo(() => latLonToVector3(centerLat, centerLon, radius).normalize(), [centerLat, centerLon, radius]);
  const surfacePos = useMemo(() => latLonToVector3(centerLat, centerLon, radius + 0.006), [centerLat, centerLon, radius]);
  
  const orientation = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal]);

  const { positions, randomFactors } = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const height = Math.random() * 0.18;
      const spread = (height * 1.6 + 0.035);
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * spread;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      rnd[i * 3] = Math.random();
      rnd[i * 3 + 1] = r;
      rnd[i * 3 + 2] = angle;
    }
    return { positions: pos, randomFactors: rnd };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime() * 2.2;
      const posAttr = pointsRef.current.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const speed = 1.0 + randomFactors[i * 3] * 1.5;
        const currentAngle = randomFactors[i * 3 + 2] + t * speed;
        const h = posAttr.getY(i);
        const r = (h * 1.5 + 0.03);
        posAttr.setX(i, Math.cos(currentAngle) * r);
        posAttr.setZ(i, Math.sin(currentAngle) * r);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={surfacePos} quaternion={orientation}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color={color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// 3D Entry, Descent & Landing (EDL) Trajectory Arc ("7 Minutes of Terror")
const EDLTrajectory = ({ radius = 2.0, targetLat = 18.4447, targetLon = 77.4508, show = true }) => {
  const { points, chutePoint, entryPoint } = useMemo(() => {
    const pts = [];
    const numSteps = 40;
    const startLat = targetLat + 10;
    const startLon = targetLon - 45;
    const startAlt = radius * 1.32;
    const entryPt = latLonToVector3(startLat, startLon, startAlt);
    const chutePt = latLonToVector3(targetLat + 2, targetLon - 8, radius * 1.08);

    for (let i = 0; i <= numSteps; i++) {
      const frac = i / numSteps;
      const lat = startLat + (targetLat - startLat) * Math.pow(frac, 0.75);
      const lon = startLon + (targetLon - startLon) * Math.pow(frac, 0.75);
      const currentRadius = radius + (startAlt - radius) * Math.pow(1 - frac, 1.7);
      pts.push(latLonToVector3(lat, lon, currentRadius));
    }

    return { points: pts, chutePoint: chutePt, entryPoint: entryPt };
  }, [radius, targetLat, targetLon]);

  if (!show) return null;

  return (
    <group>
      <Line
        points={points}
        color="#F5A623"
        lineWidth={2.2}
        transparent
        opacity={0.88}
      />
      <mesh position={entryPoint}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color="#FF4C29" />
      </mesh>
      <mesh position={chutePoint}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshBasicMaterial color="#00FFCC" />
      </mesh>
    </group>
  );
};

// ESA Mars Express Orbiter (Elliptical Polar Orbit)
const MarsExpressSatellite = ({ radius = 2.0 }) => {
  const satRef = useRef();
  useFrame(({ clock }) => {
    if (satRef.current) {
      const t = clock.getElapsedTime() * 0.20 + 2.0;
      const x = Math.sin(t) * 0.4;
      const y = Math.cos(t) * radius * 1.40;
      const z = Math.sin(t) * radius * 1.40;
      satRef.current.position.set(x, y, z);
      satRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={satRef}>
      <mesh>
        <boxGeometry args={[0.038, 0.024, 0.024]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.052, 0, 0]}>
        <boxGeometry args={[0.06, 0.018, 0.002]} />
        <meshStandardMaterial color="#0369a1" emissive="#0369a1" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.052, 0, 0]}>
        <boxGeometry args={[0.06, 0.018, 0.002]} />
        <meshStandardMaterial color="#0369a1" emissive="#0369a1" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

const CameraDirector = ({ targetPos }) => {
  const { camera } = useThree();
  const lastTarget = useRef(targetPos);
  const flyActive = useRef(true);
  const lastDist = useRef(9999);

  useEffect(() => {
    if (targetPos && targetPos !== lastTarget.current) {
      lastTarget.current = targetPos;
      flyActive.current = true;
      lastDist.current = 9999;
    }
  }, [targetPos]);

  useFrame(() => {
    if (flyActive.current && lastTarget.current) {
      const dist = camera.position.distanceTo(lastTarget.current);
      
      // Abort fly-to if user manually zooms out or drags
      if (dist > lastDist.current + 0.05) {
        flyActive.current = false;
        return;
      }
      lastDist.current = dist;

      camera.position.lerp(lastTarget.current, 0.025);
      camera.lookAt(0, 0, 0);
      
      // Stop animating when close enough
      if (dist < 0.8) {
        flyActive.current = false;
      }
    }
  });
  return null;
};

// Mars Globe Core with glowing contours, hazards, and resources
const MarsGlobe = ({ 
  waypoints = [], 
  showHoloBeacons = true, 
  showHazards = true,
  showResources = true,
  showContours = true,
  showMROScanner = true,
  showEDL = true,
  showDustVortex = true,
  autoRotate = true, 
  sunMotion = false 
}) => {
  const globeRef = useRef();
  const radius = 2.0;
  const setSelectedPOI = useMapStore(s => s.setSelectedPOI);

  const { scene: marsNasaModel } = useGLTF('/mars_nasa.glb');

  // Compute 3D positions for Waypoints
  const waypointPositions = useMemo(() => {
    return waypoints.map(wp => {
      const lon = wp.lon !== undefined ? wp.lon : (wp.lng !== undefined ? wp.lng : 0);
      return {
        ...wp,
        pos: latLonToVector3(wp.lat, lon, radius + 0.008)
      };
    });
  }, [waypoints, radius]);

  // Compute 3D positions for Landing Sites
  const landingPins = useMemo(() => {
    return landingSites.slice(0, 6).map(site => ({
      ...site,
      pos: latLonToVector3(site.lat, site.lon, radius + 0.006)
    }));
  }, [radius]);

  // Compute 3D positions for Hazards
  const hazardPins = useMemo(() => {
    return hazardMarkers.map(h => ({
      ...h,
      pos: latLonToVector3(h.lat, h.lon, radius + 0.006)
    }));
  }, [radius]);

  // Compute 3D positions for Subsurface Ice Resources
  const resourcePins = useMemo(() => {
    return resourceMarkers.map(r => ({
      ...r,
      pos: latLonToVector3(r.lat, r.lon, radius + 0.006)
    }));
  }, [radius]);

  // Topological Contour Lines (Olympus Mons, Tharsis, Hellas Basin, Equator)
  const contourLines = useMemo(() => {
    const lines = [];
    const r = radius + 0.004;
    // Olympus Mons +18km summit ring
    lines.push({ points: createContourCircle(18.65, -133.8, 2.2, r), color: '#00FFCC' });
    // Olympus Mons +12km middle scarp ring
    lines.push({ points: createContourCircle(18.65, -133.8, 4.5, r), color: '#00FFCC' });
    // Olympus Mons base scarp ring
    lines.push({ points: createContourCircle(18.65, -133.8, 7.8, r), color: '#38bdf8' });

    // Hellas Planitia -6km depth contour ring
    lines.push({ points: createContourCircle(-42.4, 70.5, 12.0, r), color: '#FF4C29' });
    lines.push({ points: createContourCircle(-42.4, 70.5, 18.0, r), color: '#F5A623' });

    // Tharsis Montes Trio Contours
    lines.push({ points: createContourCircle(11.8, -104.5, 3.2, r), color: '#00FFCC' }); // Ascraeus
    lines.push({ points: createContourCircle(0.8, -112.9, 3.0, r), color: '#00FFCC' });  // Pavonis
    lines.push({ points: createContourCircle(-9.0, -120.9, 3.5, r), color: '#00FFCC' }); // Arsia

    // Equatorial 0m Datum Line
    const eqPoints = [];
    for (let lon = -180; lon <= 180; lon += 5) {
      eqPoints.push(latLonToVector3(0, lon, r));
    }
    lines.push({ points: eqPoints, color: 'rgba(226, 123, 88, 0.4)' });

    return lines;
  }, [radius]);

  // Slow planetary diurnal rotation
  useFrame((_, delta) => {
    if (autoRotate && globeRef.current) {
      globeRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Photorealistic Mars Sphere with Color Map & 3D Bump Relief */}
      {/* Photorealistic NASA GLTF Mars Model */}
      <Resize scale={radius * 2}>
        <primitive object={marsNasaModel} />
      </Resize>
      {/* Atmospheric Inner Dust Haze Shell (Warm terracotta glow) */}
      <mesh>
        <sphereGeometry args={[radius * 1.018, 64, 64]} />
        <meshBasicMaterial 
          color="#FF4C29" 
          transparent 
          opacity={0.16} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* Atmospheric Outer Exosphere Halo (Ethereal cyan limb scattering) */}
      <mesh>
        <sphereGeometry args={[radius * 1.045, 64, 64]} />
        <meshBasicMaterial 
          color="#00FFCC" 
          transparent 
          opacity={0.22} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* Orbiting Reconnaissance Satellite */}
      <MROSatellite radius={radius} showScanner={showMROScanner} />
      <MarsExpressSatellite radius={radius} />

      {/* Entry, Descent & Landing (EDL) Trajectory Arc */}
      <EDLTrajectory radius={radius} show={showEDL} />

      {/* Dynamic 3D Swirling Dust Storm Particle Vortices */}
      {showDustVortex && (
        <>
          <DustStormParticleVortex centerLat={-42.4} centerLon={70.5} radius={radius} color="#FF4C29" />
          <DustStormParticleVortex centerLat={-14.0} centerLon={-58.0} radius={radius} color="#F5A623" />
        </>
      )}

      {/* Glowing Topological Contour Lines */}
      {showContours && contourLines.map((line, idx) => (
        <Line
          key={`contour-${idx}`}
          points={line.points}
          color={line.color}
          lineWidth={1.5}
          transparent
          opacity={0.7}
        />
      ))}

      {/* Landing Sites Holographic Beacons */}
      {showHoloBeacons && landingPins.map((site) => (
        <HoloBeacon
          key={`pin-${site.id}`}
          position={site.pos}
          color={site.color || '#00FFCC'}
          height={0.28}
          label={site.name}
          sublabel={`Elev: ${site.elevation ? site.elevation.toLocaleString() : '0'} m`}
          icon="🚀"
          onClick={() => setSelectedPOI({ ...site, poiType: 'landingSite' })}
        />
      ))}

      {/* Pulsing Hazard Markers (Radiation Spikes & Dust Storms) */}
      {showHazards && hazardPins.map((hazard) => (
        <PulsingBeacon
          key={`hazard-${hazard.id}`}
          position={hazard.pos}
          color={hazard.color}
          label={hazard.name}
          sublabel={hazard.level}
          icon={hazard.icon}
          type="hazard"
        />
      ))}

      {/* Pulsing Resource Markers (Subsurface Glacial Ice Deposits) */}
      {showResources && resourcePins.map((res) => (
        <PulsingBeacon
          key={`res-${res.id}`}
          position={res.pos}
          color={res.color}
          label={res.name}
          sublabel={res.depth}
          icon={res.icon}
          type="resource"
        />
      ))}

      {/* Route Waypoints Holographic Beacons */}
      {showHoloBeacons && waypointPositions.map((wp, idx) => (
        <HoloBeacon
          key={`wp-${wp.id || idx}`}
          position={wp.pos}
          color="#00FFCC"
          height={0.34}
          label={`WP ${idx + 1}: ${wp.name || 'Station'}`}
          sublabel={wp.elevation !== undefined ? `Elev: ${Math.round(wp.elevation)} m` : null}
          icon="📍"
          onClick={() => {}}
        />
      ))}

      {/* Route Polyline connecting waypoints */}
      {waypointPositions.length > 1 && (
        <Line
          points={waypointPositions.map(w => w.pos)}
          color="#00FFCC"
          lineWidth={2.8}
          dashed={false}
        />
      )}
    </group>
  );
};

// Main 3D Planetary Cartography Viewer
export default function Mars3DViewer() {
  const { waypoints } = useMapStore();
  const [hasWebGL, setHasWebGL] = useState(true);
  
  // Interactive 3D Control States
  const [autoRotate, setAutoRotate] = useState(true);
  const [showHoloBeacons, setShowHoloBeacons] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [showMROScanner, setShowMROScanner] = useState(true);
  const [showEDL, setShowEDL] = useState(true);
  const [showDustVortex, setShowDustVortex] = useState(true);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [activePreset, setActivePreset] = useState('global');

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  // Famous Landmark Camera Presets
  const landmarkPresets = [
    { id: 'global', name: 'Global Mars', icon: '🌍', pos: new THREE.Vector3(0, 0, 4.8), desc: 'Full Planetary View' },
    { id: 'olympus', name: 'Olympus Mons', icon: '🌋', pos: new THREE.Vector3(-3.2, 1.2, -1.8), desc: 'Peak: +21,287 m' },
    { id: 'valles', name: 'Valles Marineris', icon: '🏜️', pos: new THREE.Vector3(1.8, -1.1, 3.4), desc: 'Depth: -7,000 m' },
    { id: 'jezero', name: 'Jezero Crater', icon: '🎯', pos: new THREE.Vector3(1.1, 1.2, 3.6), desc: 'Perseverance Rover' },
    { id: 'gale', name: 'Gale Crater', icon: '🔬', pos: new THREE.Vector3(-3.4, -0.4, 2.0), desc: 'Curiosity Rover' },
    { id: 'north_pole', name: 'North Pole', icon: '❄️', pos: new THREE.Vector3(0, 4.4, 0.8), desc: 'Ice Cap (Planum Boreum)' }
  ];

  const handleSelectPreset = (preset) => {
    playUiSwoosh();
    setActivePreset(preset.id);
    setCameraTarget(preset.pos);
  };

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-space-900 text-space-300">
        <div className="text-center p-6 glass-panel-solid rounded-2xl max-w-md border border-mars-400/40 shadow-neon-mars">
          <h3 className="text-mars-400 font-display text-xl mb-2">WebGL Acceleration Required</h3>
          <p className="text-xs text-space-300">Your graphics accelerator does not support WebGL for the 3D globe view. Please switch to the 2D map view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0B0C10] relative overflow-hidden select-none">
      {/* Three.js Fiber Viewport */}
      <Canvas camera={{ position: [12, 6, 15], fov: 45 }}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[6, 2, 4]} intensity={2.5} color="#fff1e6" castShadow />
        <directionalLight position={[-6, -2, -4]} intensity={0.16} color="#0B0C10" />
        
        {/* Deep Field Star Sphere */}
        <Stars radius={140} depth={60} count={8000} factor={4.5} saturation={0} fade speed={0.6} />
        
        <CameraDirector targetPos={cameraTarget} />

        <Suspense fallback={<Html center><div className="text-mars-400 font-mono font-bold animate-pulse text-xs tracking-widest whitespace-nowrap bg-black/80 px-4 py-2 rounded-lg border border-mars-500/30 shadow-neon-mars backdrop-blur-md">LOADING HIGH-RES TEXTURES...</div></Html>}>
          <MarsGlobe 
          waypoints={waypoints || []} 
          showHoloBeacons={showHoloBeacons}
          showHazards={showHazards}
          showResources={showResources}
          showContours={showContours}
          showMROScanner={showMROScanner}
          showEDL={showEDL}
          showDustVortex={showDustVortex}
          autoRotate={autoRotate}
        />
          </Suspense>
        
        <OrbitControls 
          enablePan={false} 
          minDistance={2.3} 
          maxDistance={9.5} 
          zoomSpeed={0.8}
          rotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Top Telemetry Deck (Bento Glass Strip - Horizontally Scrollable) */}
      <div 
        onWheel={(e) => {
          e.stopPropagation();
          if (e.deltaY !== 0 && e.deltaX === 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
        className="absolute top-3 left-4 animate-[fadeIn_2s_ease-out_1.5s_forwards] opacity-0 right-4 flex items-center pointer-events-auto z-10 gap-3 max-w-[calc(100%-2rem)] overflow-x-auto overflow-y-hidden custom-scrollbar-x py-2 px-1"
      >
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0C10]/90 border border-cyber-cyan/30 shadow-neon-cyan backdrop-blur-xl shrink-0">
          <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-cyber-cyan whitespace-nowrap">
            3D MARS TOPOLOGY • MOLA RELIEF ACTIVE
          </span>
          <span className="text-[10px] font-mono text-space-400 border-l border-white/10 pl-2 whitespace-nowrap">
            IAU-2000
          </span>
        </div>

        {/* Tactical Viewport Quick Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0B0C10]/90 p-1 rounded-xl border border-white/[0.08] backdrop-blur-xl shadow-bento shrink-0 overflow-x-auto custom-scrollbar-x">
          {/* Hazards Toggle */}
          <button
            onClick={() => {
              playUiClick();
              setShowHazards(!showHazards);
            }}
            title="Toggle Radiation Spikes & Dust Storms"
            className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 font-mono shrink-0 whitespace-nowrap ${
              showHazards ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'text-space-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">HAZARDS</span>
          </button>

          {/* Subsurface Ice Resources Toggle */}
          <button
            onClick={() => {
              playUiClick();
              setShowResources(!showResources);
            }}
            title="Toggle Subsurface Glacial Ice Deposits"
            className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 font-mono shrink-0 whitespace-nowrap ${
              showResources ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-neon-cyan' : 'text-space-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">ICE (ISRU)</span>
          </button>

          {/* Glowing Contours Toggle */}
          <button
            onClick={() => {
              playUiClick();
              setShowContours(!showContours);
            }}
            title="Toggle Elevation Topological Contours"
            className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 font-mono shrink-0 whitespace-nowrap ${
              showContours ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40 shadow-neon-amber' : 'text-space-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">CONTOURS</span>
          </button>

          {/* EDL Descent Path Toggle */}
          <button
            onClick={() => {
              playUiClick();
              setShowEDL(!showEDL);
            }}
            title="Toggle Perseverance Entry, Descent & Landing (EDL) Trajectory"
            className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 font-mono shrink-0 whitespace-nowrap ${
              showEDL ? 'bg-mars-500/20 text-mars-300 border border-mars-500/40 shadow-neon-mars' : 'text-space-400 hover:text-white'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">EDL PATH</span>
          </button>

          {/* 3D Dust Storm Particle Vortex Toggle */}
          <button
            onClick={() => {
              playUiClick();
              setShowDustVortex(!showDustVortex);
            }}
            title="Toggle Dynamic 3D Swirling Dust Storm Particles"
            className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 font-mono shrink-0 whitespace-nowrap ${
              showDustVortex ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'text-space-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px] font-semibold">DUST VORTEX</span>
          </button>

          {/* Auto-Rotate Play/Pause */}
          <button
            onClick={() => {
              playUiClick();
              setAutoRotate(!autoRotate);
            }}
            title={autoRotate ? 'Pause Rotation' : 'Resume Rotation'}
            className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 font-mono shrink-0 whitespace-nowrap ${
              autoRotate ? 'bg-white/10 text-white border border-white/20' : 'text-space-400 hover:text-white'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Cinematic Landmark Fly-To Bar (Horizontal Scrollable Menu Bar) */}
      <div 
        onWheel={(e) => {
          e.stopPropagation();
          if (e.deltaY !== 0 && e.deltaX === 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
        className="absolute bottom-6 left-4 right-4 animate-[fadeIn_2s_ease-out_2s_forwards] opacity-0 z-10 flex items-center gap-2 bg-[#0B0C10]/90 p-2 rounded-2xl border border-white/[0.08] shadow-hud-glass backdrop-blur-2xl overflow-x-auto overflow-y-hidden custom-scrollbar-x pointer-events-auto"
      >
        <span className="text-[10px] font-mono text-cyber-cyan font-bold px-2 uppercase tracking-wider flex items-center gap-1 shrink-0 whitespace-nowrap">
          <Compass className="w-3.5 h-3.5 text-cyber-cyan animate-spin-slow" />
          FLY TO:
        </span>
        {landmarkPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            onMouseEnter={() => playUiHover()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono transition-all shrink-0 whitespace-nowrap ${
              activePreset === preset.id
                ? 'bg-gradient-to-r from-mars-400 to-mars-500 text-white border border-white/20 shadow-neon-mars font-bold scale-105'
                : 'text-space-300 hover:text-white hover:bg-space-800/60 border border-transparent'
            }`}
          >
            <span>{preset.icon}</span>
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Tactical HUD Corner Marks */}
      <div className="absolute top-12 left-4 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan/40 pointer-events-none" />
      <div className="absolute top-12 right-4 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan/40 pointer-events-none" />
      <div className="absolute bottom-16 left-4 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan/40 pointer-events-none" />
      <div className="absolute bottom-16 right-4 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan/40 pointer-events-none" />
    </div>
  );
}
useGLTF.preload('/mars_nasa.glb');
