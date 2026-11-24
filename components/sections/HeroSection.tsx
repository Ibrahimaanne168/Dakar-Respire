"use client";

import React from "react";
import dynamic from "next/dynamic";
import { getAlertLevel, ALIOUNE_FACTS } from "@/lib/config";
import AnimatedNumber from "@/components/AnimatedNumber";
import CircularGauge from "@/components/CircularGauge";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import { Wind, Clock, Flame, ShieldAlert, Sparkles, Navigation } from "lucide-react";

const DakarScene3D = dynamic(() => import("@/components/DakarScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[340px] bg-sand-surface rounded-[14px] flex flex-col items-center justify-center text-xs text-ink-muted">
      <span>Chargement de la presqu'île 3D…</span>
      <span className="text-[11px] text-ink-subtle mt-1">Trois dimensions · WebGL</span>
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

  // Calcul du pic et du meilleur créneau
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

  // Valeur d'humidité déduite ou simulée
  const humidityValue = currentItem.humidity ?? 64;

  return (
    <section id="aujourdhui" className="space-y-6 pt-2">
      {/* ── 1. Sélecteur d'heure partagé (Curseur 0 à 23h) ── */}
      <div className="dash-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sand-surface border border-sand-line flex items-center justify-center text-terracotta shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
                Heure sélectionnée (pilote la page)
              </span>
              <StatusBadge status={isSynthetic ? "Simulé" : "Mesuré"} size="sm" />
            </div>
            <p className="font-serif text-lg text-ink">
              <strong className="font-normal">{selectedHour}:00 UTC</strong> · Heure locale de Dakar
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-md w-full space-y-1">
          <div className="flex justify-between text-[11px] text-ink-muted tabular-nums">
            <span>00 h</span>
            <span className="font-medium text-terracotta">{selectedHour} h</span>
            <span>23 h</span>
          </div>
          <input
            type="range"
            min={0}
            max={23}
            value={selectedHour}
            onChange={(e) => onHourChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-sand-line rounded-lg cursor-pointer accent-terracotta"
          />
          <span className="block text-[10px] text-ink-subtle text-right">
            Glissez pour synchroniser la 3D, le grand chiffre, les jauges et le graphique
          </span>
        </div>
      </div>

      {/* ── 2. Carte Hero Principale (Scène 3D + Grand Chiffre) ── */}
      <div className="dash-card relative overflow-hidden p-0 sm:p-0 grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
        {/* Volet gauche : Grand Chiffre & Indicateurs */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-muted">
                Dakar · Presqu'île du Cap-Vert
              </span>
              <span className="text-sand-line">·</span>
              <span className="text-[11px] text-ink-subtle">{selectedHour}h00</span>
            </div>

            {/* Grand Chiffre PM2.5 (96 à 120 px) */}
            <div className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-7xl sm:text-8xl font-normal text-ink tabular-nums leading-none tracking-tight">
                  <AnimatedNumber value={currentItem.pm25} decimals={1} duration={700} />
                </span>
                <span className="text-lg sm:text-xl text-ink-muted font-sans">µg/m³</span>
              </div>
              <p className="text-xs text-ink-subtle mt-1 font-mono">Particules fines PM2.5</p>
            </div>

            {/* Niveau en couleur */}
            <div className="pt-2 flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: levelAtHour.color }}
              />
              <span
                className="font-serif text-2xl font-normal"
                style={{ color: levelAtHour.color }}
              >
                {levelAtHour.label}
              </span>
              <span className="text-xs text-ink-subtle">
                ({levelAtHour.min}–{levelAtHour.max === 1000 ? "+55" : levelAtHour.max} µg/m³)
              </span>
            </div>

            {/* Phrase d'alerte contextuelle */}
            <p className="text-sm text-ink-muted leading-relaxed pt-1">
              {peakItem && (
                <>
                  Pic attendu à <strong className="text-ink font-medium">{peakItem.hour} h</strong> :{" "}
                  <strong className="text-ink font-medium tabular-nums">{peakItem.pm25.toFixed(1)} µg/m³</strong>.
                </>
              )}{" "}
              {isHarmattan ? (
                <span className="text-terracotta">
                  Vents de nord-est (Harmattan) transportant une brume sèche saharienne.
                </span>
              ) : (
                <span>Alizés maritimes tempérant l'accumulation.</span>
              )}
            </p>
          </div>

          <DataMetadata
            unit="µg/m³"
            source="Modèle ML / OpenAQ Limamoulaye"
            period="Prévision 24 h"
            status={isSynthetic ? "Simulé" : "Modèle"}
          />
        </div>

        {/* Volet droit : Carte interactive Sénégal & Zoom Dakar (Style Earthly) */}
        <div className="lg:col-span-7 h-[420px] lg:h-auto min-h-[420px] bg-sand-surface relative">
          <DakarScene3D
            pm25={currentItem.pm25}
            hour={selectedHour}
            windSpeed={currentItem.wind_speed}
            windDeg={currentItem.wind_deg}
            isHarmattan={isHarmattan}
          />
        </div>
      </div>

      {/* ── 3. Rangée des 5 cartes de chiffres clés ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Carte 1 : PM2.5 Maintenant */}
        <div className="dash-card flex flex-col justify-between p-4 sm:p-5">
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
          <DataMetadata
            source="OpenAQ / Modèle"
            status={isSynthetic ? "Simulé" : "Mesuré"}
            className="pt-1.5 mt-1"
          />
        </div>

        {/* Carte 2 : Pic prévu */}
        <div className="dash-card flex flex-col justify-between p-4 sm:p-5">
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
          <DataMetadata
            source="Horizon 24 h"
            status={isSynthetic ? "Simulé" : "Modèle"}
            className="pt-1.5 mt-1"
          />
        </div>

        {/* Carte 3 : Meilleur créneau */}
        <div className="dash-card flex flex-col justify-between p-4 sm:p-5">
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
          <DataMetadata
            source="Profil diurne"
            status="Modèle"
            className="pt-1.5 mt-1"
          />
        </div>

        {/* Carte 4 : Rapport seuil OMS */}
        <div className="dash-card flex flex-col justify-between p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Seuil OMS 24 h</span>
            <div className="w-7 h-7 rounded-full bg-sand-surface flex items-center justify-center text-ochre">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-normal text-ink tabular-nums">
              {ratioWho24h}×
            </span>
            <span className="text-xs text-ink-subtle ml-1">le seuil 15 µg/m³</span>
          </div>
          <DataMetadata
            source="Norme OMS 2021"
            status="Modèle"
            className="pt-1.5 mt-1"
          />
        </div>

        {/* Carte 5 : Vent et Harmattan */}
        <div className="dash-card flex flex-col justify-between p-4 sm:p-5 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Vent & Harmattan</span>
            <div className="w-7 h-7 rounded-full bg-sand-surface flex items-center justify-center text-teal">
              <Navigation className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-normal text-ink tabular-nums">
              {currentItem.wind_speed?.toFixed(1) ?? "4,2"}
            </span>
            <span className="text-xs text-ink-subtle ml-1">m/s · {isHarmattan ? "Nord-Est" : "Ouest"}</span>
          </div>
          <DataMetadata
            source="NASA POWER / Réanalyse"
            status={isHarmattan ? "Harmattan actif" : "Alizé"}
            className="pt-1.5 mt-1"
          />
        </div>
      </div>

      {/* ── 4. Rangée de 3 jauges circulaires (Earthly dashboard style) ── */}
      <div className="dash-card">
        <div className="flex items-center justify-between pb-4 border-b border-sand-line/60">
          <div>
            <h3 className="font-serif text-base text-ink font-normal">
              Indicateurs physiques instantanés ({selectedHour} h)
            </h3>
            <p className="text-xs text-ink-subtle">
              Suivi en temps réel des trois grandeurs déterminant l'exposition aux particules
            </p>
          </div>
          <StatusBadge status={isSynthetic ? "Simulé" : "Modèle"} size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Jauge 1 : PM2.5 */}
          <div className="flex flex-col items-center p-3">
            <CircularGauge
              value={currentItem.pm25}
              max={65}
              label="Concentration PM2.5"
              unit="µg/m³"
              color={levelAtHour.color}
              thresholds={[
                { value: 0, color: "#3F7D58" },
                { value: 15, color: "#C99A1E" },
                { value: 35, color: "#D2691E" },
                { value: 55, color: "#A8372C" },
              ]}
              subtext={`Palier : ${levelAtHour.label}`}
            />
          </div>

          {/* Jauge 2 : Humidité relative */}
          <div className="flex flex-col items-center p-3 md:border-x md:border-sand-line/60">
            <CircularGauge
              value={humidityValue}
              max={100}
              label="Humidité relative"
              unit="%"
              color="#1F5C5E"
              thresholds={[
                { value: 0, color: "#1F5C5E" },
                { value: 80, color: "#D2691E" },
              ]}
              subtext={
                humidityValue >= 80
                  ? "Biais capteurs : gonflement hygroscopique possible (> 80%)"
                  : "Climat côtier régulier"
              }
            />
          </div>

          {/* Jauge 3 : Vitesse du vent */}
          <div className="flex flex-col items-center p-3">
            <CircularGauge
              value={currentItem.wind_speed ?? 4.2}
              max={15}
              label="Vitesse du vent"
              unit="m/s"
              color="#E9A15B"
              thresholds={[
                { value: 0, color: "#A8372C" }, // vent nul = stagnation
                { value: 2.5, color: "#C99A1E" },
                { value: 5, color: "#3F7D58" }, // bonne dispersion
              ]}
              subtext={
                (currentItem.wind_speed ?? 4.2) < 2.5
                  ? "Vent faible : stagnation et piégeage au sol"
                  : "Dispersion atmosphérique active"
              }
            />
          </div>
        </div>

        <DataMetadata
          unit="Multi-unités"
          source="Variables d'entrée du modèle horaire"
          period="Valeur instantanée à l'échéance sélectionnée"
          status="Modèle"
        />
      </div>
    </section>
  );
}
