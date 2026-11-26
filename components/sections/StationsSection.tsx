"use client";

import React, { useState } from "react";
import { GROUND_STATIONS } from "@/lib/dashboardData";
import { getAlertLevel, MOUSLY_FINDINGS } from "@/lib/config";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import BottomSheet from "@/components/BottomSheet";
import { MapPin, AlertCircle, Radio, TrendingUp, CheckCircle } from "lucide-react";

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
            Relevés en continu dans 3 quartiers témoins de la métropole
          </p>
        </div>

        {/* Encadré explicatif en langage simple */}
        <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line/70 text-xs text-ink-muted leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 text-ink font-medium">
            <span>💡</span>
            <span>Pourquoi observer ces 3 quartiers ?</span>
          </div>
          <p>
            • <strong>ESMT (Fann) :</strong> En bord d'océan, l'air marin tempère et disperse plus vite les polluants.
          </p>
          <p>
            • <strong>Limamoulaye (Guédiawaye) :</strong> En banlieue densément peuplée, directement exposé aux vents de poussière venant de l'est.
          </p>
          <p>
            • <strong>Tivaouane :</strong> Carrefour urbain très passant, marqué par les fumées d'échappement des cars et taxis.
          </p>
        </div>

        {/* Liste claire de cartes pour chaque station de Dakar */}
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
          source="Réseau de capteurs d'air à Dakar"
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
              <span className="font-medium text-ink block">Ce que révèle le quartier :</span>
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

        {/* Profil horaire réel consolidé (17 897 heures analysées) */}
        <div className="pt-3 border-t border-sand-line/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-serif text-xs sm:text-sm font-medium text-ink flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-terracotta" />
              Profil diurne horaire mesuré (17 897 heures · 3 stations)
            </span>
            <span className="text-[10px] bg-[#EAF3ED] text-[#24613B] font-medium px-2 py-0.5 rounded-full border border-[#3F7D58]/30 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Données réelles intégrées
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-sand-surface rounded-[10px] border border-sand-line/60 space-y-1">
              <div className="font-medium text-ink">Grand Dakar (Limamoulaye)</div>
              <div className="text-[11px] text-ink-muted">
                Creux : <strong className="text-ink">3,9 µg/m³</strong> (5h) · Pic soir : <strong className="text-terracotta">18,7 µg/m³</strong> (21h)
              </div>
              <div className="text-[10px] text-ink-subtle">Médiane globale : 11,1 µg/m³ (5 975 h)</div>
            </div>

            <div className="p-2.5 bg-sand-surface rounded-[10px] border border-sand-line/60 space-y-1">
              <div className="font-medium text-ink">Grand Dakar (ESMT)</div>
              <div className="text-[11px] text-ink-muted">
                Creux : <strong className="text-ink">4,4 µg/m³</strong> (5h) · Pic matin : <strong className="text-terracotta">16,3 µg/m³</strong> (8h)
              </div>
              <div className="text-[10px] text-ink-subtle">Médiane globale : 9,7 µg/m³ (6 569 h)</div>
            </div>

            <div className="p-2.5 bg-sand-surface rounded-[10px] border border-sand-line/60 space-y-1">
              <div className="font-medium text-ink">Pikine / Tiaroye (Tivaoune)</div>
              <div className="text-[11px] text-ink-muted">
                Creux : <strong className="text-ink">8,8 µg/m³</strong> (4h) · Pic matin : <strong className="text-terracotta">23,2 µg/m³</strong> (9h)
              </div>
              <div className="text-[10px] text-ink-subtle">Médiane globale : 15,6 µg/m³ (5 353 h)</div>
            </div>
          </div>

          <p className="text-[11px] text-ink-subtle leading-relaxed">
            <strong>Ce que révèlent les mesures :</strong> L'analyse de 17 897 heures montre deux pics quotidiens réguliers : le matin entre 8h et 9h (départs et circulation dense) et le soir entre 20h et 21h (retours et stagnation de l'air), avec une accalmie nocturne entre 3h et 5h du matin.
          </p>
        </div>
      </div>

      {/* ── 4. Cadre réglementaire & Calcul de l'IQA ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Comprendre l'Indice de la Qualité de l'Air (IQA)
            </h3>
          </div>
          <span className="text-[10px] bg-[#EAF3ED] text-[#24613B] font-medium px-2 py-0.5 rounded-full border border-[#3F7D58]/30">
            Norme officielle
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
          <strong>Repère santé :</strong> La recommandation de l'OMS (15 µg/m³ sur 24h) sert de repère de protection de la santé, tandis que la grille d'indice de 0 à 500 indique le niveau d'alerte immédiat pour la population.
        </p>
      </div>
    </section>
  );
}
