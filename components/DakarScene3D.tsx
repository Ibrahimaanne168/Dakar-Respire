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
// 1. Contour géographique authentique et précis de la presqu'île du Cap-Vert
// Coordonnées calibrées : Almadies (Ouest), Yoff (Nord), Plateau/Cap Manuel (Sud),
// Baie de Hann (Est intérieur), Rufisque (Est continental).
// ==============================================================================
function createCapVertShape(): THREE.Shape {
  const shape = new THREE.Shape();

  // Départ : côte continentale Nord-Est (vers Rufisque / Bargny)
  shape.moveTo(4.5, 0.4);

  // Côte Nord (Malika, Cambérène, Guédiawaye)
  shape.bezierCurveTo(3.2, 0.7, 2.0, 1.1, 0.8, 1.4);
  shape.bezierCurveTo(0.2, 1.5, -0.6, 1.8, -1.2, 1.7); // Yoff Plage

  // Pointe de Ngor & Almadies (Pointe la plus occidentale d'Afrique)
  shape.bezierCurveTo(-1.8, 1.8, -2.6, 1.6, -3.2, 1.3);
  shape.lineTo(-3.6, 0.9); // Pointe des Almadies
  shape.bezierCurveTo(-3.8, 0.6, -3.7, 0.2, -3.4, -0.1); // Virage Sud Almadies

  // Côte Ouest (Mamelles, Ouakam, Fann)
  shape.bezierCurveTo(-3.1, -0.4, -2.8, -0.8, -2.6, -1.2);
  shape.bezierCurveTo(-2.4, -1.5, -2.3, -1.9, -2.1, -2.4); // Pointe de Fann

  // Sud : Cap Manuel et Dakar Plateau
  shape.bezierCurveTo(-2.0, -2.8, -1.8, -3.2, -1.5, -3.3); // Cap Manuel
  shape.bezierCurveTo(-1.2, -3.3, -1.0, -3.0, -0.9, -2.6); // Pointe Sud Plateau
  shape.bezierCurveTo(-0.8, -2.2, -0.7, -1.8, -0.6, -1.4); // Port de Dakar

  // Baie de Hann (courbure intérieure protégée)
  shape.bezierCurveTo(-0.4, -0.9, 0.1, -0.5, 0.8, -0.4);
  shape.bezierCurveTo(1.6, -0.3, 2.5, -0.2, 3.4, -0.1);
  shape.bezierCurveTo(3.8, -0.1, 4.2, -0.1, 4.5, -0.2); // Rufisque Sud

  // Fermeture continentale Est
  shape.lineTo(4.5, 0.4);

  return shape;
}

// ==============================================================================
// 2. Modèle 3D de la presqu'île du Cap-Vert avec relief, récifs et phare
// ==============================================================================
function CapVertTerrain({ pm25, hour = 14 }: { pm25: number; hour?: number }) {
  const shape = useMemo(() => createCapVertShape(), []);
  const isNight = hour >= 20 || hour < 6;

  // Extrusion douce pour le relief côtier
  const extrudeSettings = useMemo(
    () => ({
      steps: 1,
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
    }),
    []
  );

  // Contour pour l'estran (eaux côtières peu profondes / turquoise)
  const reefExtrudeSettings = useMemo(
    () => ({
      steps: 1,
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.15,
      bevelSegments: 2,
    }),
    []
  );

  const beaconRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (beaconRef.current) {
      beaconRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* 1. Estran / Récif côtier turquoise peu profond */}
      <mesh position={[0, 0, -0.05]}>
        <extrudeGeometry args={[shape, reefExtrudeSettings]} />
        <meshStandardMaterial
          color="#3A8E88"
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* 2. Terre ferme du Cap-Vert (sable chaud doré + texture urbaine sobre) */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color={isNight ? "#8B7E68" : "#E2D7C2"}
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      {/* 3. Collines des Mamelles (relief volcanique emblématique de Dakar) */}
      {/* Mamelle Occidentale (avec phare) */}
      <mesh position={[-2.85, 0.45, 0.22]} castShadow>
        <coneGeometry args={[0.38, 0.32, 16]} />
        <meshStandardMaterial color={isNight ? "#6E624E" : "#C4B294"} roughness={0.9} />
      </mesh>

      {/* Mamelle Orientale */}
      <mesh position={[-2.55, 0.32, 0.2]} castShadow>
        <coneGeometry args={[0.34, 0.26, 16]} />
        <meshStandardMaterial color={isNight ? "#6E624E" : "#C7B79B"} roughness={0.9} />
      </mesh>

      {/* Phare des Mamelles (tour blanche + coupole + faisceau) */}
      <group position={[-2.85, 0.45, 0.38]} ref={beaconRef}>
        {/* Fût du phare */}
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.05, 0.16, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Lanterne */}
        <mesh position={[0, 0, 0.17]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color="#FFF4D0"
            emissive="#FFD875"
            emissiveIntensity={isNight ? 2.5 : 0.6}
          />
        </mesh>
        {/* Faisceau lumineux du phare la nuit */}
        {isNight && (
          <mesh position={[0.7, 0, 0.17]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.25, 1.4, 12, 1, true]} />
            <meshBasicMaterial
              color="#FFE89E"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* 4. Îlot de Ngor (au Nord des Almadies) */}
      <mesh position={[-2.8, 1.85, 0.08]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.1, 10]} />
        <meshStandardMaterial color={isNight ? "#726550" : "#D4C4A8"} roughness={0.9} />
      </mesh>

      {/* 5. Île de Gorée (au large de Dakar Plateau) */}
      <group position={[-0.2, -2.6, 0.08]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.12, 12]} />
          <meshStandardMaterial color={isNight ? "#726550" : "#D9B48F"} roughness={0.9} />
        </mesh>
        {/* Fort d'Estrées miniature */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.12, 0.12, 0.06]} />
          <meshStandardMaterial color="#A85738" roughness={0.8} />
        </mesh>
      </group>

      {/* 6. Îles de la Madeleine (au large de Fann) */}
      <mesh position={[-3.1, -2.3, 0.06]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.08, 8]} />
        <meshStandardMaterial color={isNight ? "#655945" : "#BCAE94"} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ==============================================================================
// 3. Balises 3D interactives pour les stations au sol
// Limamoulaye, Tivaoune Diacksao et Ambassade USA
// ==============================================================================
function StationPin({
  position,
  name,
  pm25,
  isReference = false,
}: {
  position: [number, number, number];
  name: string;
  pm25: number;
  isReference?: boolean;
}) {
  const alert = getAlertLevel(pm25);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.25;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group position={position}>
      {/* Tige de la balise */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.36, 8]} />
        <meshStandardMaterial color="#1B1F23" metalness={0.4} />
      </mesh>

      {/* Sphère sommitale colorée selon PM2.5 */}
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          color={alert.color}
          emissive={alert.color}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Anneau pulsant au sol */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[0.1, 0.16, 16]} />
        <meshBasicMaterial
          color={alert.color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ==============================================================================
// 4. Océan Atlantique avec reflets et nuances de profondeur
// ==============================================================================
function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.02;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.06, 0]}
      receiveShadow
    >
      <planeGeometry args={[40, 40, 32, 32]} />
      <meshStandardMaterial
        color="#1E474D"
        roughness={0.25}
        metalness={0.2}
        envMapIntensity={0.8}
      />
    </mesh>
  );
}

// ==============================================================================
// 5. Panache atmosphérique volumétrique & Particules portées par le vent
// ==============================================================================
const MAX_PARTICLES = 1200;

function AtmosphericFlow({
  pm25,
  windSpeed = 4.2,
  windDeg = 45,
}: {
  pm25: number;
  windSpeed?: number;
  windDeg?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const activeCount = Math.min(Math.max(Math.round(pm25 * 15), 180), 950);

  // Couleur de la brume selon la teneur en poussière
  const dustColor = useMemo(() => {
    if (pm25 <= 15) return new THREE.Color("#4A7C59"); // Air pur
    if (pm25 <= 35) return new THREE.Color("#D8AC6B"); // Ocre saharien doré
    if (pm25 <= 55) return new THREE.Color("#C86F3A"); // Harmattan dense
    return new THREE.Color("#A8402F"); // Brume rouge brique intense
  }, [pm25]);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const spd = new Float32Array(MAX_PARTICLES);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 2.4 + 0.12; // Au-dessus du sol
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      spd[i] = 0.5 + Math.random() * 0.8;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useEffect(() => {
    if (pointsRef.current?.geometry) {
      pointsRef.current.geometry.setDrawRange(0, activeCount);
    }
  }, [activeCount]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    // Dérive selon l'angle du vent
    const rad = ((windDeg - 180) * Math.PI) / 180;
    const vx = Math.sin(rad) * windSpeed * 0.003;
    const vz = Math.cos(rad) * windSpeed * 0.003;

    for (let i = 0; i < activeCount; i++) {
      const factor = speeds[i];
      arr[i * 3] += vx * factor;
      arr[i * 3 + 2] += vz * factor;

      // Bouclage
      if (arr[i * 3] < -7) arr[i * 3] = 7;
      if (arr[i * 3] > 7) arr[i * 3] = -7;
      if (arr[i * 3 + 2] < -7) arr[i * 3 + 2] = 7;
      if (arr[i * 3 + 2] > 7) arr[i * 3 + 2] = -7;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. Nappe volumétrique de brume sèche au-dessus de Dakar */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[5.2, 5.8, 0.6, 24]} />
        <meshStandardMaterial
          color={dustColor}
          transparent
          opacity={Math.min(0.08 + pm25 / 450, 0.28)}
          depthWrite={false}
          roughness={1}
        />
      </mesh>

      {/* 2. Essaim de particules de poussière en dérive */}
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
          size={0.065}
          color={dustColor}
          transparent
          opacity={Math.min(0.3 + pm25 / 160, 0.75)}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ==============================================================================
// 6. Éclairage solaire et dôme céleste selon l'heure
// ==============================================================================
function SkyLighting({ hour = 14 }: { hour?: number }) {
  const isNight = hour >= 20 || hour < 6;
  const isDuskOrDawn = (hour >= 6 && hour <= 8) || (hour >= 18 && hour < 20);

  let sunColor = "#FFF8EE";
  let sunIntensity = 1.25;
  let ambientColor = "#F5EDE0";
  let ambientIntensity = 0.85;

  if (isNight) {
    sunColor = "#6A829D";
    sunIntensity = 0.25;
    ambientColor = "#1B2A36";
    ambientIntensity = 0.45;
  } else if (isDuskOrDawn) {
    sunColor = "#F4A261";
    sunIntensity = 1.0;
    ambientColor = "#E7C5A0";
    ambientIntensity = 0.75;
  }

  // Position du soleil sur son arc diurne
  const sunAngle = ((hour - 6) / 12) * Math.PI;
  const sunX = Math.cos(sunAngle) * 9;
  const sunY = Math.max(Math.sin(sunAngle) * 8, 1.5);
  const sunZ = 5;

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Lumière d'appoint océanique */}
      <hemisphereLight
        args={[ambientColor, isNight ? "#0D1821" : "#1A4B54", 0.4]}
      />
    </>
  );
}

// ==============================================================================
// 7. Scène 3D Principale Exportée
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
      <div className="w-full h-full min-h-[360px] bg-sand-surface rounded-[16px] flex flex-col items-center justify-center text-xs text-ink-muted">
        <span>Génération de la presqu'île 3D de Dakar…</span>
      </div>
    );
  }

  if (!hasWebGL) {
    const alert = getAlertLevel(pm25);
    return (
      <div className="w-full h-full min-h-[360px] bg-sand-surface p-6 flex flex-col items-center justify-center text-center rounded-[16px] border border-sand-line">
        <span className="font-serif text-4xl text-ink mb-1">{pm25.toFixed(1).replace(".", ",")}</span>
        <span className="text-xs text-ink-muted">µg/m³ PM2.5 · {alert.label}</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[360px] relative rounded-[16px] overflow-hidden bg-gradient-to-b from-[#1C3E44] to-[#122A2E]">
      <Canvas shadows dpr={[1, 1.5]}>
        {/* Caméra aérienne isométrique plongeante */}
        <PerspectiveCamera
          makeDefault
          position={[0, 7.8, 8.2]}
          fov={38}
        />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.3}
          minPolarAngle={Math.PI / 5.5}
          minDistance={6}
          maxDistance={15}
          autoRotate={false}
          target={[0, 0.2, 0]}
        />

        <SkyLighting hour={hour} />
        <Ocean />
        <CapVertTerrain pm25={pm25} hour={hour} />

        {/* Balises 3D des stations réelles */}
        {/* 1. Complexe Limamoulaye (Grand Dakar) */}
        <StationPin
          position={[-0.8, 0.2, -0.4]}
          name="Limamoulaye"
          pm25={pm25}
        />

        {/* 2. Mairie Tivaoune Diacksao (Tiaroye / Pikine) */}
        <StationPin
          position={[1.5, 0.2, 0.1]}
          name="Tivaoune Diacksao"
          pm25={pm25 * 0.95}
        />

        {/* 3. Ambassade des USA (Almadies) */}
        <StationPin
          position={[-3.3, 0.22, 0.6]}
          name="Ambassade USA"
          pm25={pm25 * 1.05}
          isReference={true}
        />

        {/* Panache de poussière & écoulement éolien */}
        <AtmosphericFlow pm25={pm25} windSpeed={windSpeed} windDeg={windDeg} />
      </Canvas>

      {/* Légende discrète superposée */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none text-[11px] text-white/90 bg-ink/65 backdrop-blur-md px-3 py-1.5 rounded-pill border border-white/15">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E2D7C2]" />
          <span>Presqu'île du Cap-Vert</span>
        </span>
        <span>·</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FFF4D0] animate-pulse" />
          <span>Phare des Mamelles</span>
        </span>
        <span>·</span>
        <span className="text-white/70">
          Vent : {windSpeed} m/s ({isHarmattan ? "Harmattan Nord-Est" : "Alizé"})
        </span>
      </div>

      <div className="absolute top-3 right-3 text-[10px] text-white/80 bg-ink/50 backdrop-blur px-2 py-0.5 rounded border border-white/10 pointer-events-none">
        Cliquez et glissez pour orienter la vue 3D
      </div>
    </div>
  );
};

export default DakarScene3D;
