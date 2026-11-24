"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { getAlertLevel } from "@/lib/config";
import { ZoomIn, ZoomOut, Wind, MapPin, Compass, Layers, Info } from "lucide-react";

interface DakarSceneProps {
  pm25: number;
  hour?: number;
  windSpeed?: number;
  windDeg?: number;
  isHarmattan?: boolean;
}

export const DakarScene3D: React.FC<DakarSceneProps> = ({
  pm25,
  hour = 14,
  windSpeed = 4.2,
  windDeg = 45,
  isHarmattan = true,
}) => {
  // Mode de zoom : "senegal" (vue nationale globale) ou "dakar" (zoom presqu'île détaillé)
  const [zoomLevel, setZoomLevel] = useState<"senegal" | "dakar">("senegal");
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const alert = getAlertLevel(pm25);

  // Stations réelles et points de mesure dans la région de Dakar (pour le zoom Dakar)
  const dakarStations = useMemo(
    () => [
      {
        id: "almadies",
        name: "Ambassade USA (BAM-1022)",
        commune: "Almadies / Ngor",
        x: 18,
        y: 52,
        val: parseFloat((pm25 * 1.04).toFixed(1)),
        isRef: true,
      },
      {
        id: "mamelles",
        name: "Phare des Mamelles",
        commune: "Ouakam",
        x: 23,
        y: 54,
        val: parseFloat((pm25 * 0.98).toFixed(1)),
      },
      {
        id: "limamoulaye",
        name: "Complexe Limamoulaye",
        commune: "Grand Dakar (OpenAQ)",
        x: 32,
        y: 56,
        val: parseFloat((pm25 * 1.0).toFixed(1)),
      },
      {
        id: "plateau",
        name: "Dakar Plateau / Port",
        commune: "Plateau & Cap Manuel",
        x: 35,
        y: 68,
        val: parseFloat((pm25 * 1.08).toFixed(1)),
      },
      {
        id: "goree",
        name: "Île de Gorée",
        commune: "Au large du port",
        x: 42,
        y: 66,
        val: parseFloat((pm25 * 0.88).toFixed(1)),
      },
      {
        id: "guediawaye",
        name: "Guédiawaye Plage",
        commune: "Littoral Nord",
        x: 45,
        y: 43,
        val: parseFloat((pm25 * 0.95).toFixed(1)),
      },
      {
        id: "tivaoune",
        name: "Mairie Tivaoune Diacksao",
        commune: "Tiaroye / Pikine (OpenAQ)",
        x: 52,
        y: 52,
        val: parseFloat((pm25 * 0.97).toFixed(1)),
      },
      {
        id: "rufisque",
        name: "Rufisque / Bargny",
        commune: "Entrée Harmattan",
        x: 74,
        y: 62,
        val: parseFloat((pm25 * 1.15).toFixed(1)),
      },
    ],
    [pm25]
  );

  // Repères pour la vue nationale Sénégal
  const senegalRegions = useMemo(
    () => [
      {
        name: "Dakar (Presqu'île du Cap-Vert)",
        role: "Zone d'étude principale",
        x: 14.5,
        y: 45,
        pm25Val: Math.round(pm25),
        isTarget: true,
      },
      {
        name: "Saint-Louis (Corridor Nord)",
        role: "Entrée poussière du Sahara",
        x: 26,
        y: 20,
        pm25Val: Math.round(pm25 * 1.35),
      },
      {
        name: "Matam / Vallée du Fleuve",
        role: "Brumes sahariennes denses",
        x: 62,
        y: 26,
        pm25Val: Math.round(pm25 * 1.5),
      },
      {
        name: "Thiès",
        role: "Zone intermédiaire",
        x: 22,
        y: 46,
        pm25Val: Math.round(pm25 * 1.1),
      },
      {
        name: "Ziguinchor (Casamance)",
        role: "Zone Sud protégée",
        x: 32,
        y: 84,
        pm25Val: Math.round(pm25 * 0.65),
      },
    ],
    [pm25]
  );

  // Animation des particules d'Harmattan en flux d'ouest/sud-ouest
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particules de vent fluides
    const count = zoomLevel === "senegal" ? 75 : 90;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 12 + Math.random() * 24,
      speed: 0.8 + Math.random() * 1.4,
      opacity: 0.15 + Math.random() * 0.35,
    }));

    // Vecteur éolien selon windDeg (Harmattan = ~45° venant du NE vers SO)
    const angleRad = ((windDeg - 180) * Math.PI) / 180;
    const vx = Math.sin(angleRad) * windSpeed * 0.45;
    const vy = Math.cos(angleRad) * windSpeed * 0.45;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1.2;
      ctx.strokeStyle =
        pm25 <= 15
          ? "rgba(31, 92, 94, 0.3)"
          : pm25 <= 35
          ? "rgba(201, 154, 30, 0.45)"
          : "rgba(181, 83, 42, 0.55)";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += vx * p.speed;
        p.y += vy * p.speed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - vx * p.len, p.y - vy * p.len);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [pm25, windSpeed, windDeg, zoomLevel]);

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[460px] rounded-[18px] overflow-hidden select-none bg-[#F7F9FC] border border-sand-line/70 flex flex-col justify-between">
      {/* ── 1. Barre supérieure de contrôle (Style Earthly / Capture 2) ── */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        {/* Toggle Vue Sénégal ↔ Zoom Dakar */}
        <div className="flex items-center p-1 bg-white/95 backdrop-blur-md rounded-pill shadow-card border border-sand-line pointer-events-auto">
          <button
            onClick={() => setZoomLevel("senegal")}
            className={`px-3 py-1 text-xs rounded-pill transition-all font-medium flex items-center gap-1.5 ${
              zoomLevel === "senegal"
                ? "bg-ink text-white shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-sand-surface"
            }`}
          >
            <span>🇸🇳 Tout le Sénégal</span>
          </button>
          <button
            onClick={() => setZoomLevel("dakar")}
            className={`px-3 py-1 text-xs rounded-pill transition-all font-medium flex items-center gap-1.5 ${
              zoomLevel === "dakar"
                ? "bg-ink text-white shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-sand-surface"
            }`}
          >
            <span>📍 Zoom Dakar (Presqu'île)</span>
          </button>
        </div>

        {/* Boutons Zoom + / - */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-pill shadow-card border border-sand-line pointer-events-auto">
          <button
            onClick={() => setZoomLevel("dakar")}
            title="Zoomer sur Dakar"
            className={`p-1.5 rounded-full hover:bg-sand-surface transition-colors ${
              zoomLevel === "dakar" ? "text-terracotta" : "text-ink-muted"
            }`}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel("senegal")}
            title="Dézoomer sur le Sénégal"
            className={`p-1.5 rounded-full hover:bg-sand-surface transition-colors ${
              zoomLevel === "senegal" ? "text-terracotta" : "text-ink-muted"
            }`}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Toile Canvas pour le flux de vent animé (Harmattan) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* ── 3. Conteneur cartographique interactif ── */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-4 pt-12 overflow-hidden">
        {/* ==================================================================== */}
        {/* CAS A : VUE 1 - TOUT LE SÉNÉGAL (Vue d'ensemble nationale) */}
        {/* ==================================================================== */}
        {zoomLevel === "senegal" && (
          <div className="relative w-full max-w-xl h-[330px] flex items-center justify-center animate-in fade-in duration-300">
            {/* Carte vectorielle épurée du Sénégal avec région de Dakar */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/images/senegal-dakar-map.jpg"
                alt="Carte du Sénégal avec Dakar à la pointe Ouest"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain filter contrast-105 opacity-90 p-2"
              />

              {/* Grand flux de l'Harmattan (flèche / cône venant du Nord-Est saharien) */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              >
                <defs>
                  <linearGradient id="harmattanFlow" x1="1" y1="0" x2="0" y2="0.6">
                    <stop offset="0%" stopColor="#B5532A" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#E9A15B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#B5532A" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Panache de poussière saharien descendant du Nord-Est vers Dakar */}
                <path
                  d="M90,5 C70,15 45,30 18,44 L16,47 C40,36 68,22 95,12 Z"
                  fill="url(#harmattanFlow)"
                />

                {/* Ligne pointillée du vecteur de vent */}
                <line
                  x1="82"
                  y1="12"
                  x2="20"
                  y2="44"
                  stroke="#B5532A"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                  opacity="0.7"
                />
              </svg>

              {/* Cercles d'intensité circulaires translucides (Exactement comme Capture Earthly) */}
              {/* 1. Grand cercle saharien Nord-Est (Matam / Saint-Louis) */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  left: "62%",
                  top: "26%",
                  width: "160px",
                  height: "160px",
                  background:
                    "radial-gradient(circle, rgba(168, 55, 44, 0.42) 0%, rgba(201, 154, 30, 0.15) 55%, transparent 75%)",
                  border: "1px dashed rgba(168, 55, 44, 0.35)",
                }}
              >
                {/* Pastille noire avec valeur (style Earthly) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink text-white text-[11px] font-mono px-2 py-0.5 rounded-full shadow-md">
                  {Math.round(pm25 * 1.5)} µg
                </div>
              </div>

              {/* 2. Cercle d'intensité sur Dakar (Pointe Ouest) */}
              <div
                onClick={() => setZoomLevel("dakar")}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-transform hover:scale-105 z-20 group"
                style={{
                  left: "14%",
                  top: "45%",
                  width: "110px",
                  height: "110px",
                  background: `radial-gradient(circle, ${alert.color}55 0%, ${alert.color}15 60%, transparent 75%)`,
                  border: `1.5px solid ${alert.color}80`,
                }}
              >
                {/* Pastille noire avec valeur centrale + clic pour zoomer */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink text-white text-xs font-serif px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 ring-2 ring-terracotta">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: alert.color }} />
                  <span>{pm25.toFixed(0)} µg/m³</span>
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 text-ink text-[10px] font-medium px-2 py-0.5 rounded shadow-sm border border-sand-line">
                  🔍 Cliquer pour zoomer sur Dakar
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* CAS B : VUE 2 - ZOOM DÉTAILLÉ SUR LA PRESQU'ÎLE DE DAKAR */}
        {/* ==================================================================== */}
        {zoomLevel === "dakar" && (
          <div className="relative w-full max-w-2xl h-[340px] flex items-center justify-center animate-in fade-in duration-300">
            {/* Relief 3D isométrique blanc officiel fourni par l'utilisateur */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/images/dakar-relief-white.webp"
                alt="Relief de la presqu'île de Dakar avec départements"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-contain filter contrast-110 drop-shadow-md"
              />

              {/* Cercles de chaleur d'aérosols (Style Earthly) sur les départements */}
              {/* Cercle 1 : Almadies / Mamelles (Ouest) */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  left: "22%",
                  top: "52%",
                  width: "115px",
                  height: "115px",
                  background:
                    pm25 <= 15
                      ? "radial-gradient(circle, rgba(63, 125, 88, 0.45) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(201, 154, 30, 0.4) 0%, transparent 70%)",
                }}
              />

              {/* Cercle 2 : Grand Dakar / Pikine / Guédiawaye (Centre) */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  left: "44%",
                  top: "50%",
                  width: "135px",
                  height: "135px",
                  background:
                    pm25 <= 35
                      ? "radial-gradient(circle, rgba(201, 154, 30, 0.45) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(210, 105, 30, 0.5) 0%, transparent 70%)",
                }}
              />

              {/* Cercle 3 : Rufisque / Bargny (Entrée continentale de poussière) */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  left: "76%",
                  top: "58%",
                  width: "140px",
                  height: "140px",
                  background:
                    pm25 <= 35
                      ? "radial-gradient(circle, rgba(210, 105, 30, 0.45) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(168, 55, 44, 0.55) 0%, transparent 70%)",
                }}
              />

              {/* Balises et stations au sol réelles (Limamoulaye, Tivaoune, USA) */}
              {dakarStations.map((st) => {
                const stAlert = getAlertLevel(st.val);
                const isSelected = selectedStation === st.id;

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStation(st.id)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-transform hover:scale-110"
                    style={{ left: `${st.x}%`, top: `${st.y}%` }}
                  >
                    {/* Disque de mesure noir avec chiffre blanc (style Earthly) */}
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.8 rounded-full shadow-card border transition-all ${
                        isSelected
                          ? "bg-white text-ink border-terracotta ring-2 ring-terracotta font-bold scale-105"
                          : "bg-ink text-white border-white/40"
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: stAlert.color }}
                      />
                      <span className="text-[11px] font-mono tabular-nums leading-none">
                        {st.val.toFixed(0)}
                      </span>
                    </div>

                    {/* Étiquette du lieu */}
                    <div
                      className={`text-[9px] whitespace-nowrap mt-0.5 text-center font-medium ${
                        isSelected ? "text-terracotta font-bold" : "text-ink-subtle"
                      }`}
                    >
                      {st.name.split(" ")[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Infobulle station sélectionnée (en bas de carte) ── */}
      {selectedStation && (
        <div className="absolute bottom-12 left-4 z-40 max-w-sm p-3 bg-white/95 backdrop-blur-md rounded-[12px] shadow-card border border-sand-line text-xs space-y-1 animate-in fade-in duration-150">
          {(() => {
            const st = dakarStations.find((s) => s.id === selectedStation);
            if (!st) return null;
            const stAlert = getAlertLevel(st.val);
            return (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-terracotta" />
                    {st.name}
                  </span>
                  <span
                    className="px-1.5 py-0.2 rounded text-[10px] font-medium text-white"
                    style={{ backgroundColor: stAlert.color }}
                  >
                    {stAlert.label}
                  </span>
                </div>
                <p className="text-[11px] text-ink-subtle">{st.commune}</p>
                <div className="pt-1.5 mt-1 border-t border-sand-line/60 flex items-baseline justify-between tabular-nums">
                  <span className="text-ink-muted">PM2.5 à {hour}h :</span>
                  <strong className="font-serif text-sm font-medium text-ink">
                    {st.val.toFixed(1).replace(".", ",")} µg/m³
                  </strong>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── 5. Bandeau informatif en bas (Vent, Harmattan, échelle) ── */}
      <div className="relative z-30 px-4 py-2.5 bg-white/90 backdrop-blur-md border-t border-sand-line/60 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-terracotta font-medium">
            <Wind className="w-3.5 h-3.5 animate-pulse" />
            <span>Harmattan {windSpeed} m/s</span>
          </span>
          <span className="text-sand-line">·</span>
          <span className="text-ink-subtle text-[11px]">
            Flux de poussière arrivant du Sahara (Nord-Est) vers la presqu'île
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-subtle">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3F7D58]" /> Bon
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C99A1E]" /> Moyen
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D2691E]" /> Mauvais
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#A8372C]" /> Très mauvais
          </span>
        </div>
      </div>
    </div>
  );
};

export default DakarScene3D;
