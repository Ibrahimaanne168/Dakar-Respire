"use client";

import React from "react";
import dynamic from "next/dynamic";
import { getAlertLevel, ALIOUNE_FACTS } from "@/lib/config";
import AnimatedNumber from "@/components/AnimatedNumber";
import CircularGauge from "@/components/CircularGauge";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import { Wind, Clock, Flame, ShieldAlert, Sparkles, Navigation } from "lucide-react";

// Chargement léger de la carte interactive
const DakarScene3D = dynamic(() => import("@/components/DakarScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-sand-surface rounded-[16px] flex flex-col items-center justify-center text-xs text-ink-muted">
      <span>Chargement de la carte de Dakar…</span>
      <span className="text-[11px] text-ink-subtle mt-0.5">Sénégal & Presqu'île</span>
    </div>
  ),
});

interface HeroSectionProps {
  selectedHour: number;
  onHourChange: (hour: number) => void;
  data: any;
  isSynthetic: boolean;
}

export default function HeroSection({
  selectedHour,
  onHourChange,
  data,
  isSynthetic,
}: HeroSectionProps) {
  const hourlyList = data?.hourly || [];
  const currentItem =
    hourlyList.find((h: any) => h.hour === selectedHour) ||
    hourlyList[0] || {
      hour: selectedHour,
      pm25: 28.5,
      wind_speed: 4.2,
      wind_deg: 45,
      is_harmattan: true,
      humidity: 68,
    };

  const currentPm25Now = data?.current_pm25 ?? 28.5;
  const peakPm25 = data?.peak_pm25 ?? 34.0;

  const peakItem = hourlyList.reduce(
    (best: any, h: any) => (h.pm25 > (best?.pm25 ?? -1) ? h : best),
    null
  );
  const bestItem = hourlyList.reduce(
    (best: any, h: any) => (h.pm25 < (best?.pm25 ?? Infinity) ? h : best),
    null
  );

  const levelAtHour = getAlertLevel(currentItem.pm25);
  const ratioWho24h = (currentItem.pm25 / ALIOUNE_FACTS.who24hThreshold).toFixed(1).replace(".", ",");
  const isHarmattan =
    currentItem.is_harmattan ||
    (currentItem.wind_deg >= 20 && currentItem.wind_deg <= 80);

  const humidityValue = currentItem.humidity ?? 64;

  return (
    <section id="aujourdhui" className="space-y-4 pt-1">
      {/* ── 1. En-tête minimal mobile-first (sans navbar encombrante) ── */}
      <div className="flex items-center justify-between pb-2 border-b border-sand-line/70">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
          <h1 className="font-serif text-lg sm:text-xl font-normal text-ink tracking-tight">
            Dakar Respire
          </h1>
          <span className="text-sand-line">·</span>
          <span className="text-xs text-ink-muted">Qualité de l'air</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block shrink-0"
            style={{ backgroundColor: levelAtHour.color }}
          />
          <StatusBadge status={isSynthetic ? "Simulé" : "Mesuré"} size="sm" />
        </div>
      </div>

      {/* ── 2. Hero Mobile-First : Grand Chiffre + Carte Interactive Dakar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Volet Informations / Grand Chiffre (Premier rendu immédiat) */}
        <div className="dash-card p-4 sm:p-6 lg:col-span-5 flex flex-col justify-between bg-white border border-sand-line/70">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-subtle">
              <span className="uppercase tracking-wider font-medium text-ink-muted">Région de Dakar · Sénégal</span>
              <span className="font-mono text-terracotta font-medium">{selectedHour}:00 UTC</span>
            </div>

            {/* Très grand chiffre (72 à 88 px sur mobile) */}
            <div className="pt-1">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-7xl sm:text-8xl font-normal text-ink tabular-nums leading-none tracking-tight">
                  <AnimatedNumber value={currentItem.pm25} decimals={1} duration={700} />
                </span>
                <span className="text-base sm:text-lg text-ink-muted font-sans">µg/m³</span>
              </div>
              <p className="text-[11px] text-ink-subtle font-mono mt-0.5">Particules fines PM2.5</p>
            </div>

            {/* Niveau en mots et couleur */}
            <div className="flex items-center gap-2.5 pt-1">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: levelAtHour.color }}
              />
              <span
                className="font-serif text-xl sm:text-2xl font-normal"
                style={{ color: levelAtHour.color }}
              >
                {levelAtHour.label}
              </span>
              <span className="text-xs text-ink-subtle">
                ({levelAtHour.min}–{levelAtHour.max === 1000 ? "+55" : levelAtHour.max} µg/m³)
              </span>
            </div>

            {/* Phrase d'alerte claire */}
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pt-1">
              {peakItem && (
                <>
                  Pic attendu à <strong className="text-ink font-medium">{peakItem.hour} h</strong> :{" "}
                  <strong className="text-ink font-medium tabular-nums">{peakItem.pm25.toFixed(1)} µg/m³</strong>.
                </>
              )}{" "}
              {isHarmattan ? (
                <span className="text-terracotta">
                  Vents de nord-est (Harmattan) transportant la poussière saharienne.
                </span>
              ) : (
                <span>Alizés maritimes tempérant l'accumulation.</span>
              )}
            </p>

            {/* Encadré explicite : Conseil santé pratique immédiat */}
            <div className="mt-2 p-2.5 rounded-[10px] bg-sand-surface border border-sand-line/70 flex items-start gap-2 text-xs">
              <span className="text-sm shrink-0">💡</span>
              <div className="leading-tight">
                <strong className="text-ink font-medium">Conseil santé à cette heure : </strong>
                <span className="text-ink-muted">
                  {currentItem.pm25 < 15
                    ? "Air pur. Idéal pour faire du sport dehors et aérer votre logement."
                    : currentItem.pm25 < 35
                    ? "Air moyen. Les personnes très sensibles (asthmatiques, jeunes enfants) doivent rester attentives."
                    : currentItem.pm25 < 55
                    ? "Air dégradé. Évitez les efforts physiques prolongés en plein air et les grands axes."
                    : "Alerte pollution. Port du masque conseillé à l'extérieur. Fermez les fenêtres aux heures de pointe."}
                </span>
              </div>
            </div>
          </div>

          <DataMetadata
            unit="µg/m³"
            source="Capteurs au sol & Météo"
            period="Horizon 24 h"
            status={isSynthetic ? "Calculé" : "Mesuré"}
            className="pt-2 mt-3"
          />
        </div>

        {/* Volet Carte Interactive : Sénégal Macro & Zoom Dakar */}
        <div className="dash-card p-0 overflow-hidden lg:col-span-7 h-[360px] sm:h-[420px] lg:h-auto min-h-[340px] bg-[#F7F9FC] border border-sand-line/70">
          <DakarScene3D
            pm25={currentItem.pm25}
            hour={selectedHour}
            windSpeed={currentItem.wind_speed}
            windDeg={currentItem.wind_deg}
            isHarmattan={isHarmattan}
          />
        </div>
      </div>

      {/* ── 3. Curseur d'heure tactile (0 à 24 h) avec repères toutes les 6 h ── */}
      <div className="dash-card p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-ink flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-terracotta" />
            Curseur horaire : <strong className="tabular-nums text-terracotta font-serif text-sm">{selectedHour} h 00</strong>
          </span>
          <span className="text-ink-subtle text-[11px]">Pilote toute la page</span>
        </div>

        {/* Input slider avec grosse poignée tactile 44px */}
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={24}
            step={1}
            value={selectedHour}
            onChange={(e) => onHourChange(parseInt(e.target.value) % 24)}
            className="w-full cursor-pointer touch-action-pan-y"
            aria-label="Sélectionner l'heure de prévision"
          />
        </div>

        {/* Repères fixes toutes les 6 heures (0h, 6h, 12h, 18h, 24h) */}
        <div className="flex justify-between text-[11px] text-ink-subtle px-1 tabular-nums font-medium">
          <button onClick={() => onHourChange(0)} className="touch-target p-1 hover:text-ink">0 h</button>
          <button onClick={() => onHourChange(6)} className="touch-target p-1 hover:text-ink">6 h</button>
          <button onClick={() => onHourChange(12)} className="touch-target p-1 hover:text-ink">12 h</button>
          <button onClick={() => onHourChange(18)} className="touch-target p-1 hover:text-ink">18 h</button>
          <button onClick={() => onHourChange(23)} className="touch-target p-1 hover:text-ink">24 h</button>
        </div>
      </div>

      {/* ── 4. Cartes de chiffres clés en Carrousel Horizontal avec aimantation (scroll-snap) ── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-ink-subtle px-1">
          <span>Indicateurs clés du jour</span>
          <span className="text-[11px] text-terracotta font-medium">Glisser au pouce 👉</span>
        </div>

        {/* Carrousel avec snap-x et dépassement visible de la carte suivante */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5">
          {/* Carte 1 : Maintenant */}
          <div className="dash-card w-[78vw] sm:w-auto shrink-0 snap-start flex flex-col justify-between p-4 mb-0">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Maintenant</span>
              <div className="w-7 h-7 rounded-full bg-sand-surface flex items-center justify-center text-terracotta">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <span className="font-serif text-3xl font-normal text-ink tabular-nums">
                {currentPm25Now.toFixed(1).replace(".", ",")}
              </span>
              <span className="text-xs text-ink-subtle ml-1">µg/m³</span>
            </div>
            <DataMetadata source="Capteurs de Dakar" status={isSynthetic ? "Calculé" : "Mesuré"} className="pt-1 mt-1" />
          </div>

          {/* Carte 2 : Pic prévu */}
          <div className="dash-card w-[78vw] sm:w-auto shrink-0 snap-start flex flex-col justify-between p-4 mb-0">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Pic prévu</span>
              <div className="w-7 h-7 rounded-full bg-sand-surface flex items-center justify-center text-level-mauvais">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <span className="font-serif text-3xl font-normal text-ink tabular-nums">
                {peakPm25.toFixed(1).replace(".", ",")}
              </span>
              <span className="text-xs text-ink-subtle ml-1">
                µg/m³ {peakItem ? `à ${peakItem.hour}h` : ""}
              </span>
            </div>
            <DataMetadata source="Prévision" status="Calculé" className="pt-1 mt-1" />
          </div>

          {/* Carte 3 : Meilleur créneau */}
          <div className="dash-card w-[78vw] sm:w-auto shrink-0 snap-start flex flex-col justify-between p-4 mb-0">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Meilleur créneau</span>
              <div className="w-7 h-7 rounded-full bg-sand-surface flex items-center justify-center text-level-bon">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <span className="font-serif text-3xl font-normal text-ink tabular-nums">
                {bestItem ? `${bestItem.hour} h` : "04 h"}
              </span>
              <span className="text-xs text-ink-subtle ml-1">
                ({bestItem ? bestItem.pm25.toFixed(1) : "14,5"} µg)
              </span>
            </div>
            <DataMetadata source="Air le plus pur" status="Recommandé" className="pt-1 mt-1" />
          </div>

          {/* Carte 4 : Seuil OMS */}
          <div className="dash-card w-[78vw] sm:w-auto shrink-0 snap-start flex flex-col justify-between p-4 mb-0">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Seuil de santé OMS</span>
              <div className="w-7 h-7 rounded-full bg-sand-surface flex items-center justify-center text-ochre">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <span className="font-serif text-3xl font-normal text-ink tabular-nums">
                {ratioWho24h}×
              </span>
              <span className="text-xs text-ink-subtle ml-1">recommandé par l'OMS</span>
            </div>
            <DataMetadata source="Repère santé" status="Protection" className="pt-1 mt-1" />
          </div>

          {/* Carte 5 : Vent & Harmattan */}
          <div className="dash-card w-[78vw] sm:w-auto shrink-0 snap-start flex flex-col justify-between p-4 mb-0">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Vent dominant</span>
              <div className="w-7 h-7 rounded-full bg-sand-surface flex items-center justify-center text-teal">
                <Navigation className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <span className="font-serif text-3xl font-normal text-ink tabular-nums">
                {currentItem.wind_speed?.toFixed(1) ?? "4,2"}
              </span>
              <span className="text-xs text-ink-subtle ml-1">m/s · {isHarmattan ? "Harmattan (NE)" : "Brise de mer (Ouest)"}</span>
            </div>
            <DataMetadata source="Météo" status={isHarmattan ? "Harmattan" : "Brise marine"} className="pt-1 mt-1" />
          </div>
        </div>
      </div>

      {/* ── 5. Trois jauges sur une même ligne (PM2.5, humidité, vent) ── */}
      <div className="dash-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <h2 className="font-serif text-sm font-normal text-ink">
            Indicateurs instantanés ({selectedHour} h)
          </h2>
          <span className="text-[11px] text-ink-subtle">PM2.5 · Humidité · Vent</span>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1 items-center">
          {/* Jauge 1 : PM2.5 */}
          <div className="flex flex-col items-center">
            <CircularGauge
              value={currentItem.pm25}
              max={65}
              label="PM2.5"
              unit="µg/m³"
              size={95}
              color={levelAtHour.color}
              thresholds={[
                { value: 0, color: "#3F7D58" },
                { value: 15, color: "#C99A1E" },
                { value: 35, color: "#D2691E" },
                { value: 55, color: "#A8372C" },
              ]}
              subtext={levelAtHour.label}
            />
          </div>

          {/* Jauge 2 : Humidité */}
          <div className="flex flex-col items-center border-x border-sand-line/60 px-1">
            <CircularGauge
              value={humidityValue}
              max={100}
              label="Humidité"
              unit="%"
              size={95}
              color="#1F5C5E"
              thresholds={[
                { value: 0, color: "#1F5C5E" },
                { value: 80, color: "#D2691E" },
              ]}
              subtext={humidityValue >= 80 ? "Air très humide" : "Humidité normale"}
            />
          </div>

          {/* Jauge 3 : Vent */}
          <div className="flex flex-col items-center">
            <CircularGauge
              value={currentItem.wind_speed ?? 4.2}
              max={15}
              label="Vent"
              unit="m/s"
              size={95}
              color="#E9A15B"
              thresholds={[
                { value: 0, color: "#A8372C" },
                { value: 2.5, color: "#C99A1E" },
                { value: 5, color: "#3F7D58" },
              ]}
              subtext={isHarmattan ? "Harmattan" : "Brise de mer"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
