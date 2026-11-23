"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { getAlertLevel } from "@/lib/config";

interface DakarSceneProps {
  pm25: number;
  hour?: number;
  windSpeed?: number;
  windDeg?: number;
  isHarmattan?: boolean;
}

// ==============================================================================
// 1. Système de Particules Aérosols (PM2.5 & Harmattan)
// ==============================================================================
const MAX_PARTICLES = 2500;

function ParticleField({
  pm25,
  windSpeed = 4.5,
  windDeg = 45,
}: {
  pm25: number;
  windSpeed?: number;
  windDeg?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const alert = getAlertLevel(pm25);
  const activeCount = Math.min(Math.max(Math.round(pm25 * 30), 200), MAX_PARTICLES);

  // Allouer un buffer fixe une seule fois au montage pour éviter toute tentative de redimensionnement de buffer WebGL
  const { positions, randomOffsets } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const rand = new Float32Array(MAX_PARTICLES * 2);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 4.5 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;

      rand[i * 2] = 0.6 + Math.random() * 0.8; // facteur de vitesse individuel
      rand[i * 2 + 1] = (Math.random() - 0.5) * 0.005; // oscillation verticale
    }
    return { positions: pos, randomOffsets: rand };
  }, []);

  // Ajuster le drawRange sans jamais changer la taille physique du buffer
  useEffect(() => {
    if (pointsRef.current && pointsRef.current.geometry) {
      pointsRef.current.geometry.setDrawRange(0, activeCount);
    }
  }, [activeCount]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    // Calcul du vecteur vent (NE -> SW par défaut pour l'Harmattan)
    const rad = (windDeg * Math.PI) / 180;
    const baseVx = -Math.sin(rad) * (windSpeed * 0.008);
    const baseVz = -Math.cos(rad) * (windSpeed * 0.008);

    for (let i = 0; i < activeCount; i++) {
      const speedFactor = randomOffsets[i * 2];
      const yOsc = randomOffsets[i * 2 + 1];

      posArray[i * 3] += baseVx * speedFactor;
      posArray[i * 3 + 1] += yOsc;
      posArray[i * 3 + 2] += baseVz * speedFactor;

      // Réinitialiser les particules sorties du champ (bouclage torique)
      if (posArray[i * 3] < -8.5) posArray[i * 3] = 8.5;
      if (posArray[i * 3] > 8.5) posArray[i * 3] = -8.5;
      if (posArray[i * 3 + 2] < -8.5) posArray[i * 3 + 2] = 8.5;
      if (posArray[i * 3 + 2] > 8.5) posArray[i * 3 + 2] = -8.5;
      if (posArray[i * 3 + 1] < 0.2) posArray[i * 3 + 1] = 4.5;
      if (posArray[i * 3 + 1] > 4.5) posArray[i * 3 + 1] = 0.2;
    }
    posAttr.needsUpdate = true;
  });

  return (
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
        size={pm25 > 50 ? 0.085 : 0.055}
        color={alert.color}
        transparent
        opacity={Math.min(0.3 + pm25 / 150, 0.85)}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ==============================================================================
// 2. Géométrie Stylisée de la Presqu'île de Dakar (Cap-Vert)
// ==============================================================================
function DakarPeninsula({ pm25 }: { pm25: number }) {
  // Forme de la presqu'île du Cap-Vert (Dakar pointe vers l'Ouest dans l'Atlantique)
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // Départ continent (Rufisque / Est)
    s.moveTo(4, 2);
    // Côte Nord (Yoff, Ngor)
    s.lineTo(1, 1.8);
    s.lineTo(-1.5, 1.2);
    s.lineTo(-3.8, 0.6); // Pointe des Almadies
    // Pointe Sud (Plateau, Cap Manuel)
    s.lineTo(-3.2, -0.6);
    s.lineTo(-1.8, -1.2);
    s.lineTo(0.5, -1.0);
    // Retour continent Sud (Baie de Hann, Mbao)
    s.lineTo(4, -1.5);
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = {
    steps: 1,
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 3,
  };

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* Terre ferme du Cap-Vert */}
      <mesh receiveShadow castShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Île de Gorée stylisée */}
      <mesh position={[-1.2, -2.2, 0.15]}>
        <cylinderGeometry args={[0.2, 0.25, 0.2, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Marqueurs urbains avec étiquettes */}
      <Marker3D pos={[-3.6, 0.5, 0.45]} label="Almadies" color="#38bdf8" />
      <Marker3D pos={[-2.4, -0.8, 0.45]} label="Plateau / CGQA" color="#10b981" />
      <Marker3D pos={[0.5, 0.3, 0.45]} label="Pikine" color="#fbbf24" />
      <Marker3D pos={[-1.2, -2.2, 0.45]} label="Île de Gorée" color="#a78bfa" />
    </group>
  );
}

function Marker3D({ pos, label, color }: { pos: [number, number, number]; label: string; color: string }) {
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Html distanceFactor={12} position={[0, 0, 0.25]} center>
        <div className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700/80 text-[10px] text-slate-200 whitespace-nowrap shadow-md pointer-events-none">
          {label}
        </div>
      </Html>
    </group>
  );
}

// ==============================================================================
// 3. Océan Atlantique & Ambiance
// ==============================================================================
function OceanPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#081e3a"
        roughness={0.15}
        metalness={0.7}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

// ==============================================================================
// 4. Éclairage Dynamique selon l'Heure (Cycle Jour/Nuit & Brume Saharienne)
// ==============================================================================
function DynamicAtmosphere({ hour = 12, pm25 }: { hour?: number; pm25: number }) {
  const isDay = hour >= 6 && hour < 19;
  const sunAngle = ((hour - 6) / 13) * Math.PI;

  // Si fort pic PM2.5 (Harmattan), teinte sablonneuse / ambrée
  const isDusty = pm25 > 45;
  const sunColor = isDusty ? "#f59e0b" : isDay ? "#fef08a" : "#38bdf8";
  const ambientIntensity = isDay ? (isDusty ? 0.7 : 0.85) : 0.25;

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={isDusty ? "#fbbf24" : "#e2e8f0"} />
      <directionalLight
        position={[Math.cos(sunAngle) * 12, Math.sin(sunAngle) * 10 + 2, 6]}
        intensity={isDay ? 1.4 : 0.3}
        color={sunColor}
        castShadow
      />
      {/* Lumière d'appoint océan */}
      <directionalLight position={[-8, -4, -6]} intensity={0.25} color="#0284c7" />
    </>
  );
}

// ==============================================================================
// 5. Composant Principal Exporté
// ==============================================================================
export const DakarScene3D: React.FC<DakarSceneProps> = ({
  pm25,
  hour = 14,
  windSpeed = 4.8,
  windDeg = 45,
  isHarmattan = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Vérification du support WebGL
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[360px] bg-slate-950 flex items-center justify-center text-slate-500 text-sm">
        Chargement de l'environnement 3D Dakar...
      </div>
    );
  }

  // Fallback 2D si WebGL n'est pas supporté
  if (!hasWebGL) {
    const alert = getAlertLevel(pm25);
    return (
      <div className="w-full h-full min-h-[360px] bg-slate-950 p-6 flex flex-col items-center justify-center text-center border border-slate-800 rounded-2xl relative overflow-hidden">
        <div
          className="w-44 h-44 rounded-full border-4 border-dashed animate-spin-slow flex flex-col items-center justify-center mb-4"
          style={{ borderColor: alert.color }}
        >
          <span className="text-3xl font-extrabold text-white">{pm25}</span>
          <span className="text-xs text-slate-400">µg/m³ PM2.5</span>
        </div>
        <p className="text-sm font-semibold text-slate-200">Presqu'île du Cap-Vert (Mode 2D)</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Vent : {windSpeed} m/s ({windDeg}°) • {isHarmattan ? "Harmattan Saharien actif" : "Brise maritime"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[380px] relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, -9, 8]} fov={45} up={[0, 0, 1]} />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
          minDistance={5}
          maxDistance={18}
          autoRotate={false}
        />
        <DynamicAtmosphere hour={hour} pm25={pm25} />
        <OceanPlane />
        <DakarPeninsula pm25={pm25} />
        <ParticleField pm25={pm25} windSpeed={windSpeed} windDeg={windDeg} />
      </Canvas>

      {/* Télémétrie 3D Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs shadow-lg pointer-events-none">
        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
          Simulation Atmosphérique 3D
        </div>
        <div className="text-slate-300 font-semibold mt-0.5">
          {hour.toString().padStart(2, "0")}:00 UTC • Presqu'île du Cap-Vert
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
          <span>Vent: <strong className="text-slate-200">{windSpeed} m/s</strong></span>
          <span>Angle: <strong className="text-slate-200">{windDeg}° (NE)</strong></span>
          {isHarmattan && <span className="text-amber-400 font-medium">Harmattan</span>}
        </div>
      </div>

      {/* Guide navigation 3D */}
      <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-slate-900/60 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
        Clic gauche : rotation • Molette : zoom
      </div>
    </div>
  );
};
export default DakarScene3D;
