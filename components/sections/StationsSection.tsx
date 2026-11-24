"use client";

import React, { useState } from "react";
import { GROUND_STATIONS } from "@/lib/dashboardData";
import { getAlertLevel, MOUSLY_FINDINGS } from "@/lib/config";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import EmptyStateCard from "@/components/EmptyStateCard";
import BottomSheet from "@/components/BottomSheet";
import { MapPin, AlertCircle, Compass, Radio, ExternalLink } from "lucide-react";

export default function StationsSection() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [mapInteractiveActive, setMapInteractiveActive] = useState<boolean>(false);

  const activeStation = GROUND_STATIONS.find((s) => s.id === selectedStationId);

  return (
    <section id="mesures" className="space-y-4 pt-4">
      {/* ── 1. Carte à hauteur fixe avec gestes coopératifs ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex flex-col gap-1 pb-3 border-b border-sand-line/60">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
              Section ④ · Stations au sol
            </span>
            <StatusBadge status="Mesuré" size="sm" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal">
            Capteurs de surface et stations réelles
          </h2>
          <p className="text-xs text-ink-muted">
            Réseau documenté par Mously Sow (OpenAQ, AirNow, CGQA)
          </p>
        </div>

        {/* Carte stylisée légère SVG à hauteur fixe (~280 à 320 px) */}
        <div className="relative w-full h-[280px] sm:h-[320px] rounded-[16px] bg-[#EAF2F2] border border-teal/20 overflow-hidden shadow-inner flex items-center justify-center p-2">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full pointer-events-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Contour simplifié du Cap-Vert */}
            <path
              d="M15,36 C18,32 25,28 32,27 C42,26 55,20 68,22 C80,24 92,38 96,54 C98,64 90,70 80,68 C70,66 62,56 52,55 C46,54 44,68 46,78 C48,85 45,90 40,88 C36,86 38,72 36,65 C33,56 26,50 20,44 C14,40 12,38 15,36 Z"
              fill="#F5EDE0"
              stroke="#D6C8B2"
              strokeWidth="1.2"
            />

            {/* Repères cliquables de stations avec zone tactile élargie */}
            {GROUND_STATIONS.map((st) => {
              const hasValue = st.latestValue !== null;
              const alert = hasValue ? getAlertLevel(st.latestValue!) : null;
              const circleColor = alert ? alert.color : "#8E8B82";

              return (
                <g
                  key={st.id}
                  onClick={() => setSelectedStationId(st.id)}
                  className="cursor-pointer"
                >
                  {/* Zone tactile invisible élargie (44x44 équivalent) */}
                  <circle cx={st.x} cy={st.y} r="8" fill="transparent" />

                  {/* Cercle visuel */}
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={hasValue ? 4.5 : 3.5}
                    fill={circleColor}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                  <circle cx={st.x} cy={st.y} r="1.2" fill="#FFFFFF" />

                  {/* Étiquette */}
                  {(st.id === "limamoulaye" || st.id === "almadies") && (
                    <text
                      x={st.x}
                      y={st.y - 6}
                      fontSize="3.2"
                      textAnchor="middle"
                      fill="#1B1F23"
                      fontWeight="bold"
                    >
                      {st.name.split(" ")[0]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-2 left-2 text-[10px] text-ink-subtle bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-sand-line">
            Toucher une station pour afficher ses détails
          </div>
        </div>

        {/* ── 2. Le tableau devient une LISTE DE CARTES sur mobile ── */}
        <div className="space-y-2 pt-2 border-t border-sand-line/60">
          <span className="text-xs font-medium text-ink block">
            Stations répertoriées ({GROUND_STATIONS.length})
          </span>

          <div className="space-y-2">
            {GROUND_STATIONS.map((st) => {
              const alert = st.latestValue ? getAlertLevel(st.latestValue) : null;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStationId(st.id)}
                  className="p-3 bg-white hover:bg-sand-surface rounded-[14px] border border-sand-line cursor-pointer transition-colors space-y-1.5 active:bg-sand-surface"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-ink flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-terracotta" />
                      {st.name}
                    </span>
                    <StatusBadge status={st.statusType} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink-subtle">
                    <span>{st.location}</span>
                    <span className="font-mono">{st.instrument.split("(")[0]}</span>
                  </div>

                  <div className="pt-1 border-t border-sand-line/40 flex items-center justify-between text-xs">
                    <span className="text-ink-subtle text-[11px]">Dernière mesure :</span>
                    {st.latestValue !== null ? (
                      <span className="font-serif font-medium text-ink tabular-nums flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: alert?.color }} />
                        {st.latestValue.toFixed(1).replace(".", ",")} µg/m³
                      </span>
                    ) : (
                      <span className="text-ink-subtle text-[11px]">En attente de téléchargement</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DataMetadata
          unit="µg/m³"
          source="Mously Sow / OpenAQ"
          period="Archives sol 2025–2026"
          status="Mesuré"
        />
      </div>

      {/* ── 3. Bottom Sheet pour les détails de la station touchée ── */}
      <BottomSheet
        isOpen={Boolean(activeStation)}
        onClose={() => setSelectedStationId(null)}
        title={activeStation?.name || "Détails de la station"}
      >
        {activeStation && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-subtle">{activeStation.location}</span>
              <StatusBadge status={activeStation.statusType} size="sm" />
            </div>

            <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line space-y-1 text-xs">
              <div>Instrument : <strong>{activeStation.instrument}</strong></div>
              <div>Signalée depuis : <strong>{activeStation.reportedSince}</strong></div>
              <div>Licence : <strong>{activeStation.license}</strong></div>
            </div>

            <div className="p-3 bg-white rounded-[12px] border border-sand-line text-xs space-y-1">
              <span className="font-medium text-ink block">Comportement documenté par Mously :</span>
              <p className="text-ink-muted leading-relaxed">{activeStation.note}</p>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* ── 4. Comparaison du 21/11/2026 (3 lignes avec barres) ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Pourquoi les sources divergent (21/11/2026)
            </h3>
          </div>
          <StatusBadge status="Mesuré" size="sm" />
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          {/* Ligne 1 : IQAir */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-muted">IQAir (modèle global)</span>
              <span className="font-medium text-ink tabular-nums">~30 µg/m³</span>
            </div>
            <div className="w-full h-2 bg-sand-surface rounded-full overflow-hidden">
              <div className="h-full bg-ochre" style={{ width: "85%" }} />
            </div>
          </div>

          {/* Ligne 2 : World Air Map */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-muted">World Air Map (Aérosols Copernicus)</span>
              <span className="font-medium text-ink tabular-nums">29 µg/m³</span>
            </div>
            <div className="w-full h-2 bg-sand-surface rounded-full overflow-hidden">
              <div className="h-full bg-ochre" style={{ width: "82%" }} />
            </div>
          </div>

          {/* Ligne 3 : Limamoulaye Sol */}
          <div className="space-y-1">
            <div className="flex justify-between font-medium text-ink">
              <span>Capteur Limamoulaye (Au sol)</span>
              <span className="text-[#24613B] tabular-nums">~15 µg/m³</span>
            </div>
            <div className="w-full h-2 bg-sand-surface rounded-full overflow-hidden">
              <div className="h-full bg-[#3F7D58]" style={{ width: "42%" }} />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-ink-subtle pt-1 leading-relaxed">
          Le satellite intègre toute la colonne d'air en altitude, tandis que le capteur au sol mesure uniquement ce qui est inhalé dans la cour d'école.
        </p>

        {/* Profil horaire avec état vide explicite */}
        <div className="pt-2 border-t border-sand-line/60">
          <EmptyStateCard
            title="Courbe continue complète des capteurs"
            expectedFile="openaq_limamoulaye_hourly.csv"
            responsible="Mously Sow"
            description="Seuls les 2 repères (4 µg à 4h et 18 µg à 20h) sont documentés. Aucune courbe artificielle n'est tracée."
          />
        </div>
      </div>
    </section>
  );
}
