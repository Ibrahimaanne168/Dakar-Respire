"use client";

import React, { useState } from "react";
import { GROUND_STATIONS } from "@/lib/dashboardData";
import { getAlertLevel, MOUSLY_FINDINGS } from "@/lib/config";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import EmptyStateCard from "@/components/EmptyStateCard";
import { MapPin, AlertCircle, Compass, Radio } from "lucide-react";

export default function StationsSection() {
  const [selectedStationId, setSelectedStationId] = useState<string>("limamoulaye");

  const activeStation =
    GROUND_STATIONS.find((s) => s.id === selectedStationId) || GROUND_STATIONS[0];

  return (
    <section id="mesures" className="space-y-6 pt-6">
      {/* ── 1. Carte de la Presqu'île de Dakar et Tableau des stations (Capture 1 style) ── */}
      <div className="dash-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sand-line/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
                Section ④ · Mesures réelles de surface (Mously Sow)
              </span>
              <StatusBadge status="Mesuré" size="sm" />
            </div>
            <h2 className="font-serif text-2xl text-ink font-normal mt-1">
              Stations de mesure et capteurs au sol
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Réseau de capteurs optiques ouverts et stations de référence documentées par Mously Sow
            </p>
          </div>

          <div className="text-xs text-ink-subtle flex items-center gap-1.5 bg-sand-surface px-3 py-1 rounded-pill border border-sand-line">
            <Compass className="w-3.5 h-3.5 text-terracotta" />
            <span>Positions cartographiques approximatives : à vérifier</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Carte stylisée SVG de la presqu'île du Cap-Vert (responsive & interactive) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="relative w-full aspect-[4/3] bg-[#EAF2F2] rounded-[16px] border border-teal/20 overflow-hidden shadow-inner flex items-center justify-center p-4">
              {/* Carte SVG stylisée du relief de Dakar */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Océan Atlantique de fond déjà dans le container */}

                {/* Tracé précis stylisé de la presqu'île du Cap-Vert */}
                {/* Pointe des Almadies (x:15, y:35) -> Yoff -> Guédiawaye -> Bargny (x:95, y:55) -> Hann -> Plateau -> Almadies */}
                <path
                  d="M15,36 C18,32 25,28 32,27 C42,26 55,20 68,22 C80,24 92,38 96,54 C98,64 90,70 80,68 C70,66 62,56 52,55 C46,54 44,68 46,78 C48,85 45,90 40,88 C36,86 38,72 36,65 C33,56 26,50 20,44 C14,40 12,38 15,36 Z"
                  fill="#F5EDE0"
                  stroke="#D6C8B2"
                  strokeWidth="1.2"
                />

                {/* Réticule d'orientation */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1F5C5E" strokeWidth="0.3" strokeDasharray="1 3" opacity="0.4" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="#1F5C5E" strokeWidth="0.3" opacity="0.3" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="#1F5C5E" strokeWidth="0.3" opacity="0.3" />

                {/* Légende boussole */}
                <text x="52" y="10" fontSize="3.5" fill="#173F42" fontWeight="600">N</text>
                <text x="88" y="52" fontSize="3.5" fill="#173F42" fontWeight="600">E</text>

                {/* Cercles de stations interactifs */}
                {GROUND_STATIONS.map((st) => {
                  const isSelected = st.id === selectedStationId;
                  const hasValue = st.latestValue !== null;
                  const alert = hasValue ? getAlertLevel(st.latestValue!) : null;
                  const circleColor = alert ? alert.color : "#8E8B82";
                  const radius = hasValue ? Math.max(3.5, Math.min(st.latestValue! * 0.28, 8)) : 3;

                  return (
                    <g
                      key={st.id}
                      onClick={() => setSelectedStationId(st.id)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      {/* Onde de sélection */}
                      {isSelected && (
                        <circle
                          cx={st.x}
                          cy={st.y}
                          r={radius + 3.5}
                          fill="none"
                          stroke="#B5532A"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Disque de mesure */}
                      <circle
                        cx={st.x}
                        cy={st.y}
                        r={radius}
                        fill={circleColor}
                        fillOpacity={hasValue ? 0.85 : 0.4}
                        stroke={isSelected ? "#1B1F23" : "#FFFFFF"}
                        strokeWidth={isSelected ? 1.5 : 0.8}
                      />

                      {/* Point central */}
                      <circle cx={st.x} cy={st.y} r="1" fill="#FFFFFF" />

                      {/* Étiquette pour la station active ou les 2 stations ouvertes */}
                      {(isSelected || st.id === "limamoulaye" || st.id === "tivaoune") && (
                        <text
                          x={st.x}
                          y={st.y - (radius + 2)}
                          fontSize="3"
                          textAnchor="middle"
                          fill="#1B1F23"
                          fontWeight={isSelected ? "bold" : "normal"}
                          className="select-none pointer-events-none"
                        >
                          {st.name.split(" ")[0]} {hasValue ? `${st.latestValue} µg` : ""}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="absolute top-3 left-3 text-[10px] text-ink-subtle bg-white/85 backdrop-blur px-2 py-1 rounded border border-sand-line">
                Cap-Vert · Cercles proportionnels aux PM2.5
              </div>
            </div>

            {/* Fiche station sélectionnée */}
            <div className="p-3 bg-sand-surface rounded-[14px] border border-sand-line text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-terracotta" />
                  {activeStation.name}
                </span>
                <StatusBadge status={activeStation.statusType} size="sm" />
              </div>
              <p className="text-ink-muted text-[11px]">{activeStation.location} · {activeStation.instrument}</p>
              <p className="text-ink-subtle text-[11px] pt-1 border-t border-sand-line/50">{activeStation.note}</p>
            </div>
          </div>

          {/* Tableau des stations (Capture 1 style avec colonne Statut) */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="border-b border-sand-line text-ink-subtle font-normal">
                  <th className="py-2.5 pr-3 font-normal">Station & Lieu</th>
                  <th className="py-2.5 pr-3 font-normal">Instrument</th>
                  <th className="py-2.5 pr-3 font-normal">Depuis le</th>
                  <th className="py-2.5 pr-3 font-normal">Dernière mesure</th>
                  <th className="py-2.5 font-normal">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-line/60">
                {GROUND_STATIONS.map((st) => {
                  const isSelected = st.id === selectedStationId;
                  const alert = st.latestValue ? getAlertLevel(st.latestValue) : null;

                  return (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStationId(st.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-sand-surface font-medium" : "hover:bg-sand-surface/60"
                      }`}
                    >
                      <td className="py-3 pr-3">
                        <div className="font-medium text-ink">{st.name}</div>
                        <div className="text-[11px] text-ink-subtle">{st.location}</div>
                      </td>
                      <td className="py-3 pr-3 text-ink-muted text-[11px]">{st.instrument}</td>
                      <td className="py-3 pr-3 text-ink-subtle text-[11px]">{st.reportedSince}</td>
                      <td className="py-3 pr-3">
                        {st.latestValue !== null ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: alert?.color }}
                            />
                            <span className="font-serif text-sm font-medium">
                              {st.latestValue.toFixed(1).replace(".", ",")} µg/m³
                            </span>
                          </div>
                        ) : (
                          <span className="text-ink-subtle text-[11px]">En attente</span>
                        )}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={st.statusType} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DataMetadata
          unit="µg/m³"
          source="Mously Sow (Recherche mesures réelles sol / OpenAQ)"
          period="Archives 2025–2026"
          status="Mesuré"
        />
      </div>

      {/* ── 2. « Pourquoi les sources ne s'accordent pas » & Profil horaire ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Comparaison du 21/11/2026 */}
        <div className="dash-card lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-terracotta" />
              <h3 className="font-serif text-base text-ink font-normal">
                Pourquoi les sources ne s'accordent pas ?
              </h3>
            </div>
            <StatusBadge status="Mesuré" size="sm" />
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Mously Sow a relevé un écart notable lors de la soirée du <strong>{MOUSLY_FINDINGS.discrepancyExample2026.date}</strong> sur Dakar :
          </p>

          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-[12px] bg-sand-surface border border-sand-line/70 flex items-center justify-between">
              <div>
                <span className="font-medium text-ink text-xs block">IQAir (Modèle global interpolé)</span>
                <span className="text-[11px] text-ink-subtle">Satellite + réanalyse</span>
              </div>
              <span className="font-serif text-base font-normal text-ink tabular-nums">
                {MOUSLY_FINDINGS.discrepancyExample2026.iqair}
              </span>
            </div>

            <div className="p-3 rounded-[12px] bg-sand-surface border border-sand-line/70 flex items-center justify-between">
              <div>
                <span className="font-medium text-ink text-xs block">World Air Map (Aérosols Copernicus)</span>
                <span className="text-[11px] text-ink-subtle">Colonne atmosphérique totale</span>
              </div>
              <span className="font-serif text-base font-normal text-ink tabular-nums">
                {MOUSLY_FINDINGS.discrepancyExample2026.worldAirMap}
              </span>
            </div>

            <div className="p-3 rounded-[12px] bg-[#EAF3ED] border border-[#3F7D58]/30 flex items-center justify-between">
              <div>
                <span className="font-medium text-[#24613B] text-xs block">Capteur Limamoulaye (Au sol)</span>
                <span className="text-[11px] text-ink-subtle">Mesure optique in situ dans la cour</span>
              </div>
              <span className="font-serif text-base font-normal text-[#24613B] tabular-nums">
                {MOUSLY_FINDINGS.discrepancyExample2026.limamoulayeMedian}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-ink-muted leading-relaxed pt-1">
            <strong>Explication scientifique :</strong> {MOUSLY_FINDINGS.discrepancyExample2026.reason}
          </p>

          <DataMetadata
            source="Rapport Mously Sow (21/11/2026)"
            status="Mesuré"
          />
        </div>

        {/* Profil horaire réel & État vide explicite */}
        <div className="dash-card lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal" />
                <h3 className="font-serif text-base text-ink font-normal">
                  Profil horaire observé sur les capteurs
                </h3>
              </div>
              <StatusBadge status="À venir" size="sm" />
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Deux repères empiriques clés ont été isolés par Mously Sow sur les capteurs AirGradient :
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line">
                <span className="text-[11px] text-ink-subtle block">Minimum nocturne</span>
                <span className="font-serif text-xl text-ink font-normal tabular-nums">≈ 4 µg/m³</span>
                <span className="text-[10px] text-ink-muted block mt-1">Vers 03 h – 04 h du matin (Limamoulaye)</span>
              </div>

              <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line">
                <span className="text-[11px] text-ink-subtle block">Pic de soirée</span>
                <span className="font-serif text-xl text-ink font-normal tabular-nums">15 à 18 µg/m³</span>
                <span className="text-[10px] text-ink-muted block mt-1">Vers 19 h – 21 h (trafic + inversion)</span>
              </div>
            </div>

            {/* État vide explicite conformément au prompt (ne pas inventer de courbe) */}
            <EmptyStateCard
              title="Courbe horaire continue des stations"
              expectedFile="openaq_limamoulaye_hourly.csv"
              responsible="Mously Sow"
              description="La série temporelle complète brute n'a pas encore été téléchargée. Seuls les deux repères ci-dessus sont confirmés ; aucune courbe artificielle n'est tracée."
            />
          </div>

          <DataMetadata
            unit="µg/m³"
            source="Rapport de recherche Mously Sow"
            period="Fin 2025"
            status="À venir"
          />
        </div>
      </div>
    </section>
  );
}
