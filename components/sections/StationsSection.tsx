"use client";

import React, { useState } from "react";
import { GROUND_STATIONS } from "@/lib/dashboardData";
import { getAlertLevel, MOUSLY_FINDINGS } from "@/lib/config";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import EmptyStateCard from "@/components/EmptyStateCard";
import BottomSheet from "@/components/BottomSheet";
import { MapPin, AlertCircle, Radio } from "lucide-react";

export default function StationsSection() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const activeStation = GROUND_STATIONS.find((s) => s.id === selectedStationId);

  return (
    <section id="mesures" className="space-y-4 pt-4">
      {/* ── 1. Liste des capteurs et stations réelles de Dakar ── */}
      <div className="dash-card space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-1 pb-3 border-b border-sand-line/60">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
              Section ④ · Mesures réelles au sol
            </span>
            <StatusBadge status="Mesuré" size="sm" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal">
            Stations de mesure dans la région de Dakar
          </h2>
          <p className="text-xs text-ink-muted">
            Réseau de capteurs optiques et stations de référence documentées par Mously Sow
          </p>
        </div>

        {/* Liste claire de cartes pour chaque station de Dakar (Almadies, Grand Dakar, Tiaroye, Plateau, etc.) */}
        <div className="space-y-2.5">
          {GROUND_STATIONS.map((st) => {
            const alert = st.latestValue ? getAlertLevel(st.latestValue) : null;
            return (
              <div
                key={st.id}
                onClick={() => setSelectedStationId(st.id)}
                className="p-3.5 bg-white hover:bg-sand-surface rounded-[14px] border border-sand-line cursor-pointer transition-colors space-y-2 active:bg-sand-surface shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs sm:text-sm text-ink flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                    {st.name}
                  </span>
                  <StatusBadge status={st.statusType} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-ink-subtle">
                  <span>{st.location}</span>
                  <span className="font-mono text-[11px]">{st.instrument.split("(")[0]}</span>
                </div>

                <div className="pt-1.5 border-t border-sand-line/40 flex items-center justify-between text-xs">
                  <span className="text-ink-subtle text-[11px]">Dernière mesure :</span>
                  {st.latestValue !== null ? (
                    <span className="font-serif font-medium text-ink tabular-nums flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: alert?.color }} />
                      <strong className="text-sm">{st.latestValue.toFixed(1).replace(".", ",")}</strong> µg/m³
                    </span>
                  ) : (
                    <span className="text-ink-subtle text-[11px]">En attente de téléchargement</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DataMetadata
          unit="µg/m³"
          source="Mously Sow / OpenAQ"
          period="Archives sol 2025–2026"
          status="Mesuré"
        />
      </div>

      {/* ── 2. Bottom Sheet pour les détails de la station touchée ── */}
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

            <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line space-y-1.5 text-xs">
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

      {/* ── 3. Comparaison du 21/11/2026 (Pourquoi les sources divergent) ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Pourquoi les chiffres divergent à Dakar (21/11/2026)
            </h3>
          </div>
          <StatusBadge status="Mesuré" size="sm" />
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-muted">IQAir (modèle global)</span>
              <span className="font-medium text-ink tabular-nums">~30 µg/m³</span>
            </div>
            <div className="w-full h-2 bg-sand-surface rounded-full overflow-hidden">
              <div className="h-full bg-ochre" style={{ width: "85%" }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-muted">World Air Map (Aérosols Copernicus)</span>
              <span className="font-medium text-ink tabular-nums">29 µg/m³</span>
            </div>
            <div className="w-full h-2 bg-sand-surface rounded-full overflow-hidden">
              <div className="h-full bg-ochre" style={{ width: "82%" }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-medium text-ink">
              <span>Capteur Limamoulaye (Au sol à Grand Dakar)</span>
              <span className="text-[#24613B] tabular-nums">~15 µg/m³</span>
            </div>
            <div className="w-full h-2 bg-sand-surface rounded-full overflow-hidden">
              <div className="h-full bg-[#3F7D58]" style={{ width: "42%" }} />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-ink-subtle pt-1 leading-relaxed">
          Le satellite intègre toute la colonne atmosphérique en altitude (poussières sahariennes traversant à 3 000 m), tandis que le capteur de Limamoulaye mesure uniquement les particules respirées au sol.
        </p>

        {/* Profil horaire avec état vide explicite */}
        <div className="pt-2 border-t border-sand-line/60">
          <EmptyStateCard
            title="Série horaire continue complète"
            expectedFile="openaq_limamoulaye_hourly.csv"
            responsible="Mously Sow"
            description="Seuls les 2 repères (4 µg à 4h et 18 µg à 20h) sont confirmés par Mously. Aucune courbe continue artificielle n'est tracée."
          />
        </div>
      </div>

      {/* ── 4. Cadre réglementaire & Calcul de l'IQA (Recherches Sayon Sidibé) ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Cadre réglementaire sénégalais (NS 05-062) & Indice IQA
            </h3>
          </div>
          <span className="text-[10px] bg-[#EAF3ED] text-[#24613B] font-medium px-2 py-0.5 rounded-full border border-[#3F7D58]/30">
            Sayon Sidibé
          </span>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Le Centre de Gestion de la Qualité de l'Air (CGQA) applique la formule officielle rapportant la concentration mesurée à la limite réglementaire :
        </p>

        <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line font-mono text-center text-xs text-ink">
          <span className="text-terracotta font-bold">IQA</span> = ( C<sub>mesurée</sub> / C<sub>limite</sub> ) × 100
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="p-2 bg-white rounded-[10px] border border-sand-line space-y-0.5">
            <div className="font-medium text-[#24613B] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3F7D58]" /> Bon
            </div>
            <div className="text-[10px] text-ink-subtle">IQA &lt; 100</div>
            <div className="text-[10px] text-ink-muted">Air satisfaisant</div>
          </div>
          <div className="p-2 bg-white rounded-[10px] border border-sand-line space-y-0.5">
            <div className="font-medium text-ochre flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#C99A1E]" /> Moyen
            </div>
            <div className="text-[10px] text-ink-subtle">100 ≤ IQA &lt; 150</div>
            <div className="text-[10px] text-ink-muted">Modérer l'effort prolongé</div>
          </div>
          <div className="p-2 bg-white rounded-[10px] border border-sand-line space-y-0.5">
            <div className="font-medium text-terracotta flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D2691E]" /> Mauvais
            </div>
            <div className="text-[10px] text-ink-subtle">150 ≤ IQA ≤ 200</div>
            <div className="text-[10px] text-ink-muted">Sensibilité accrue</div>
          </div>
          <div className="p-2 bg-white rounded-[10px] border border-sand-line space-y-0.5">
            <div className="font-medium text-[#A8372C] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#A8372C]" /> Très mauvais
            </div>
            <div className="text-[10px] text-ink-subtle">IQA &gt; 200</div>
            <div className="text-[10px] text-ink-muted">Alerte sanitaire (&gt;300 urgence)</div>
          </div>
        </div>

        <p className="text-[11px] text-ink-subtle leading-relaxed pt-1">
          <strong>Distinction méthodologique (Sayon Sidibé) :</strong> La recommandation OMS (15 µg/m³ sur 24h) sert de repère sanitaire international, tandis que l'indice du CGQA et la norme NS 05-062 constituent le cadre réglementaire d'alerte des populations à Dakar.
        </p>
      </div>
    </section>
  );
}
