"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
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
// 1. Particules calmes et lentes (sans lueur, couleurs sourdes)
// ==============================================================================
const MAX_PARTICLES = 1200;

function ParticleField({
  pm25,
  windSpeed = 4.0,
  windDeg = 45,
}: {
  pm25: number;
  windSpeed?: number;
  windDeg?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const alert = getAlertLevel(pm25);
  // Densité sobre : 150 à 900 particules maximum
  const activeCount = Math.min(Math.max(Math.round(pm25 * 14), 150), 900);

  // Couleur sourde adaptée : brume ocre sable (#D9A066) ou teinte d'alerte atténuée
  const particleColor = useMemo(() => {
    if (pm25 <= 15) return new THREE.Color("#4A7C59"); // vert sourd
    if (pm25 <= 35) return new THREE.Color("#D9A066"); // brume ocre
    if (pm25 <= 55) return new THREE.Color("#C86D3B"); // terre d'orange
    return new THREE.Color("#9E382B"); // brique sourde
  }, [pm25]);

  const { positions, randomOffsets } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const rand = new Float32Array(MAX_PARTICLES * 2);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = Math.random() * 3.5 + 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;

      rand[i * 2] = 0.4 + Math.random() * 0.6; // vitesse très lente
      rand[i * 2 + 1] = (Math.random() - 0.5) * 0.0015; // micro-dérive verticale
    }
    return { positions: pos, randomOffsets: rand };
  }, []);

  useEffect(() => {
    if (pointsRef.current?.geometry) {
      pointsRef.current.geometry.setDrawRange(0, activeCount);
    }
  }, [activeCount]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    // Dérive douce dans l'axe du vent (ex. Harmattan NE)
    const rad = (windDeg * Math.PI) / 180;
    const baseVx = -Math.sin(rad) * (windSpeed * 0.0025);
    const baseVz = -Math.cos(rad) * (windSpeed * 0.0025);

    for (let i = 0; i < activeCount; i++) {
      const speed = randomOffsets[i * 2];
      posArray[i * 3] += baseVx * speed;
      posArray[i * 3 + 1] += randomOffsets[i * 2 + 1];
      posArray[i * 3 + 2] += baseVz * speed;

      // Bouclage torique
      if (posArray[i * 3] < -7.5) posArray[i * 3] = 7.5;
      if (posArray[i * 3] > 7.5) posArray[i * 3] = -7.5;
      if (posArray[i * 3 + 2] < -7.5) posArray[i * 3 + 2] = 7.5;
      if (posArray[i * 3 + 2] > 7.5) posArray[i * 3 + 2] = -7.5;
      if (posArray[i * 3 + 1] < 0.1) posArray[i * 3 + 1] = 3.5;
      if (posArray[i * 3 + 1] > 3.5) posArray[i * 3 + 1] = 0.1;
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
        size={0.06}
        color={particleColor}
        transparent
        opacity={Math.min(0.25 + pm25 / 180, 0.65)}
        depthWrite={false}
      />
    </points>
  );
}

// ==============================================================================
// 2. Presqu'île du Cap-Vert (sable chaud, sobre)
// ==============================================================================
function DakarPeninsula() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(4, 2);
    s.lineTo(1, 1.8);
    s.lineTo(-1.5, 1.2);
    s.lineTo(-3.8, 0.6); // Almadies
    s.lineTo(-3.2, -0.6);
    s.lineTo(-1.8, -1.2);
    s.lineTo(0.5, -1.0);
    s.lineTo(4, -1.5);
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = {
    steps: 1,
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  };

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* Terre ferme couleur sable ocre chaud */}
      <mesh receiveShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color="#DDD3C0" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Îlot de Gorée */}
      <mesh position={[-1.2, -2.1, 0.1]}>
        <cylinderGeometry args={[0.18, 0.22, 0.16, 8]} />
        <meshStandardMaterial color="#C8BDA8" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ==============================================================================
// 3. Mer (bleu-vert sourd #2F5D62)
// ==============================================================================
function OceanPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
      <planeGeometry args={[36, 36]} />
      <meshStandardMaterial color="#2F5D62" roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

// ==============================================================================
// 4. Lumière naturelle selon l'heure
// ==============================================================================
function NaturalAtmosphere({ hour = 12 }: { hour?: number }) {
  const isDay = hour >= 6 && hour < 19;
  const sunAngle = ((hour - 6) / 13) * Math.PI;

  const sunColor = isDay ? "#FFF8EE" : "#8A9BA8";
  const ambientColor = isDay ? "#F5EFE4" : "#24323D";
  const ambientIntensity = isDay ? 0.75 : 0.35;

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      <directionalLight
        position={[Math.cos(sunAngle) * 10, Math.sin(sunAngle) * 8 + 3, 6]}
        intensity={isDay ? 1.1 : 0.4}
        color={sunColor}
      />
    </>
  );
}

// ==============================================================================
// 5. Composant Exporté
// ==============================================================================
export const DakarScene3D: React.FC<DakarSceneProps> = ({
  pm25,
  hour = 14,
  windSpeed = 4.2,
  windDeg = 45,
  isHarmattan = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[320px] bg-sand-surface flex items-center justify-center text-xs text-ink-muted">
        Chargement de la vue de Dakar…
      </div>
    );
  }

  if (!hasWebGL) {
    const alert = getAlertLevel(pm25);
    return (
      <div className="w-full h-full min-h-[320px] bg-sand-surface p-6 flex flex-col items-center justify-center text-center hairline">
        <span className="font-serif text-3xl text-ink mb-1">{pm25.toFixed(1).replace(".", ",")}</span>
        <span className="text-xs text-ink-muted">µg/m³ PM2.5 · {alert.label}</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[340px] relative hairline bg-[#284E52] overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, -8.5, 7.5]} fov={42} up={[0, 0, 1]} />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 5}
          minDistance={6}
          maxDistance={14}
        />
        <NaturalAtmosphere hour={hour} />
        <OceanPlane />
        <DakarPeninsula />
        <ParticleField pm25={pm25} windSpeed={windSpeed} windDeg={windDeg} />
      </Canvas>
    </div>
  );
};
export default DakarScene3D;
