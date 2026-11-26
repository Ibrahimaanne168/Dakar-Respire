"use client";

import React, { useState } from "react";
import { COVERAGE_TIMELINE, SAYON_RESEARCH_CONTENT, LAMINE_SATELLITE_CONTENT } from "@/lib/dashboardData";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import BottomSheet from "@/components/BottomSheet";
import { BookOpen, Globe, Download, CheckCircle, Database, FileSpreadsheet, Layers } from "lucide-react";

export default function DataSection() {
  const [sayonSheetOpen, setSayonSheetOpen] = useState<boolean>(false);
  const [lamineSheetOpen, setLamineSheetOpen] = useState<boolean>(false);

  return (
    <section id="donnees" className="space-y-4 pt-4">
      {/* ── 1. Frise de couverture temporelle des sources reçues ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex flex-col gap-1 pb-3 border-b border-sand-line/60">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
              Section ⑤ · Données & Flux
            </span>
            <StatusBadge status="Mesuré" size="sm" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal">
            Couverture temporelle des sources consolidées
          </h2>
          <p className="text-xs text-ink-muted">
            100 % de nos données réelles mesurées et synchronisées (2025–2026)
          </p>
        </div>

        {/* Note de synchronisation temporelle validée */}
        <div className="p-3.5 rounded-[12px] bg-[#EAF3ED] border border-[#3F7D58]/30 text-xs text-[#24613B] flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-medium">
              Synchronisation complète : Météo, capteurs au sol et satellite
            </strong>
            <p className="text-[11px] leading-relaxed text-[#24613B]/90">
              Toutes nos observations couvrent la période continue 2025–2026. La météo, les capteurs dans les quartiers et les observations spatiales sont synchronisés dans la même base de données consolidée.
            </p>
          </div>
        </div>

        {/* Barres horizontales de couverture empilées (une ligne par source) */}
        <div className="space-y-2.5 pt-2">
          {COVERAGE_TIMELINE.map((cov, i) => (
            <div key={i} className="p-2.5 bg-sand-surface rounded-[12px] border border-sand-line/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink">{cov.source}</span>
                <StatusBadge status={cov.status} size="sm" />
              </div>

              <div className="w-full h-2.5 bg-sand-line/70 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#3F7D58]"
                  style={{ marginLeft: `${cov.startPct}%`, width: `${cov.widthPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-subtle">
                <span className="tabular-nums">{cov.periodLabel}</span>
                <span>{cov.frequency}</span>
              </div>
            </div>
          ))}
        </div>

        <DataMetadata
          unit="Heures & pixels"
          source="NASA POWER, OpenAQ & Sentinel-5P"
          period="2025 – 2026"
          status="Mesuré"
        />
      </div>

      {/* ── 2. Dossiers de recherche scientifique & observations de l'équipe ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Dossiers scientifiques & observations complémentaires
            </h3>
          </div>
          <StatusBadge status="Mesuré" size="sm" />
        </div>

        <p className="text-xs text-ink-muted">
          Consultez les études scientifiques et les observations par satellite qui alimentent le modèle de prévision.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Carte Étude scientifique */}
          <div className="p-3.5 bg-[#EAF3ED]/60 border border-[#3F7D58]/40 rounded-[14px] space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-ink flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#3F7D58]" />
                  Étude scientifique de référence
                </span>
                <span className="text-[10px] bg-[#3F7D58] text-white px-1.5 py-0.2 rounded-full font-medium">
                  4 volets
                </span>
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Comprendre la dynamique des particules fines au Sahel, les seuils d'alerte officiels et la complémentarité des capteurs au sol.
              </p>
            </div>
            <button
              onClick={() => setSayonSheetOpen(true)}
              className="touch-target w-full py-2 px-3 bg-[#3F7D58] text-white rounded-[10px] font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#2E5E41] active:scale-[0.99] transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Consulter l'étude scientifique</span>
            </button>
          </div>

          {/* Carte Imagerie satellite */}
          <div className="p-3.5 bg-[#EBF2F7]/70 border border-[#2A6F97]/40 rounded-[14px] space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-ink flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2A6F97]" />
                  Observations spatiales par satellite
                </span>
                <span className="text-[10px] bg-[#2A6F97] text-white px-1.5 py-0.2 rounded-full font-medium">
                  Vue satellite
                </span>
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Cartographie du dioxyde d'azote émis par la circulation et animation de la progression des masses d'air sahariennes.
              </p>
            </div>
            <button
              onClick={() => setLamineSheetOpen(true)}
              className="touch-target w-full py-2 px-3 bg-[#2A6F97] text-white rounded-[10px] font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#1E5270] active:scale-[0.99] transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Voir la carte et l'animation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Jeu de données consolidé unifié ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Base de données unifiée et nettoyée
            </h3>
          </div>
          <StatusBadge status="Mesuré" size="sm" />
        </div>

        <p className="text-xs text-ink-muted">
          Série consolidée et nettoyée combinant les observations météorologiques de la NASA et les mesures des 3 stations au sol de Dakar.
        </p>

        <div className="p-3.5 bg-sand-surface rounded-[12px] border border-sand-line space-y-2 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-ink">
            <div>
              <span className="text-[10px] text-ink-subtle block">Volume temporel</span>
              <strong className="font-serif text-sm tabular-nums">16 608 h</strong>
            </div>
            <div>
              <span className="text-[10px] text-ink-subtle block">Période couverte</span>
              <strong className="font-serif text-sm tabular-nums">2025 – 2026</strong>
            </div>
            <div>
              <span className="text-[10px] text-ink-subtle block">Stations sol</span>
              <strong className="font-serif text-sm">3 stations</strong>
            </div>
            <div>
              <span className="text-[10px] text-ink-subtle block">Qualité données</span>
              <strong className="font-serif text-sm text-[#3F7D58]">Nettoyé à 100%</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-sand-line/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span className="text-[11px] text-ink-subtle">
              Fichier : <code className="font-mono text-ink">donnees_propres.csv</code> (1,1 Mo, encodage UTF-8)
            </span>
            <a
              href="/donnees_propres.csv"
              download="donnees_propres_dakar_2025_2026.csv"
              className="touch-target w-full sm:w-auto py-2 px-4 bg-ink hover:bg-terracotta text-white rounded-[10px] font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le jeu de données propre</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── BottomSheet Recherche Scientifique ── */}
      <BottomSheet
        isOpen={sayonSheetOpen}
        onClose={() => setSayonSheetOpen(false)}
        title="Recherche scientifique & Références"
      >
        <div className="space-y-4 text-xs text-ink leading-relaxed pb-4">
          <div className="p-2.5 bg-[#EAF3ED] border border-[#3F7D58]/30 rounded-[10px] space-y-1">
            <div className="font-medium text-[#24613B] flex items-center justify-between">
              <span>Rapport d'analyse documentaire</span>
              <span className="text-[10px]">{SAYON_RESEARCH_CONTENT.date}</span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Source d'étude : Particules fines, capteurs d'air et seuils sanitaires
            </p>
          </div>

          {/* 4 Parties */}
          {SAYON_RESEARCH_CONTENT.parts.map((part) => (
            <div key={part.id} className="p-3 bg-sand-surface rounded-[12px] border border-sand-line/70 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink text-white font-medium">
                  {part.number}
                </span>
                <strong className="text-sm font-serif font-normal text-ink">{part.title}</strong>
              </div>

              {/* Partie I : Études */}
              {"studies" in part && part.studies && (
                <div className="space-y-2 pt-1">
                  {part.studies.map((st, sIdx) => (
                    <div key={sIdx} className="p-2 bg-white rounded-[8px] border border-sand-line/50 space-y-1">
                      <div className="font-medium text-ink">{st.title}</div>
                      <div className="text-[10px] text-terracotta">{st.citation} · {st.journal}</div>
                      <p className="text-[11px] text-ink-muted">{st.findings}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Partie II : Méthodes */}
              {"methodsComparison" in part && part.methodsComparison && (
                <div className="space-y-2 pt-1">
                  <div className="p-2 bg-white rounded-[8px] border border-sand-line/50 space-y-1">
                    <strong className="text-ink block">Synthèse comparative des 6 méthodes :</strong>
                    <div className="divide-y divide-sand-line/40 text-[11px]">
                      {part.methodsComparison.map((m, mIdx) => (
                        <div key={mIdx} className="py-1 flex justify-between gap-2">
                          <span className="font-medium text-ink w-1/3">{m.method} ({m.type})</span>
                          <span className="text-ink-muted flex-1">{m.usage} · <em>{m.limit}</em></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {part.keyStudy && (
                    <div className="p-2 bg-[#EAF3ED] border border-[#3F7D58]/30 rounded-[8px] text-[11px] text-[#24613B]">
                      <strong>Étude clé à Dakar (Gueye et al. 2025) :</strong> {part.keyStudy}
                    </div>
                  )}
                </div>
              )}

              {/* Partie III : Limites du satellite */}
              {"limits" in part && part.limits && (
                <div className="space-y-1.5 pt-1">
                  {part.limits.map((l, lIdx) => (
                    <div key={lIdx} className="p-2 bg-white rounded-[8px] border border-sand-line/50 space-y-0.5">
                      <strong className="text-ink block text-[11px]">{l.point}</strong>
                      <p className="text-[11px] text-ink-muted">{l.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Partie IV : Seuils & Normes */}
              {"standards" in part && part.standards && (
                <div className="space-y-2 pt-1 text-[11px]">
                  <div className="p-2 bg-white rounded-[8px] border border-sand-line/50 space-y-1">
                    <div><strong>OMS 2021 :</strong> {part.standards.who2021}</div>
                    <div><strong>Norme SN 05-062 :</strong> {part.standards.snNorm}</div>
                    <div className="font-mono text-terracotta pt-0.5"><strong>Formule CGQA :</strong> {part.standards.cgqaFormula}</div>
                  </div>
                  <div className="p-2 bg-white rounded-[8px] border border-sand-line/50 space-y-1">
                    <strong className="block text-ink">Grille officielle d'alerte du CGQA :</strong>
                    <div className="divide-y divide-sand-line/40">
                      {part.standards.cgqaScale.map((sc, scIdx) => (
                        <div key={scIdx} className="py-1 flex justify-between items-center gap-2">
                          <span className="font-medium text-ink w-28">{sc.range} ({sc.label})</span>
                          <span className="text-ink-subtle flex-1">{sc.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* ── BottomSheet Données Satellitaires ── */}
      <BottomSheet
        isOpen={lamineSheetOpen}
        onClose={() => setLamineSheetOpen(false)}
        title="Observations et imagerie par satellite"
      >
        <div className="space-y-4 text-xs pb-4">
          <div className="p-3 bg-[#EBF2F7] border border-[#2A6F97]/30 rounded-[12px] space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-sm font-serif text-[#1E5270]">
                {LAMINE_SATELLITE_CONTENT.title}
              </strong>
              <StatusBadge status="Mesuré" size="sm" />
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Imagerie spatiale au-dessus de la presqu'île du Cap-Vert. Analyse croisée de la pollution urbaine au sol et des grandes nappes de poussières désertiques.
            </p>
          </div>

          {/* Section 1 : Carte NO2 */}
          <div className="p-3 bg-white border border-sand-line rounded-[12px] space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-medium text-ink text-sm">
                1. Carte satellite du dioxyde d'azote (trafic & combustion)
              </h4>
              <span className="text-[10px] bg-sand-surface px-2 py-0.5 rounded-full text-ink-subtle">
                Novembre 2026
              </span>
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              {LAMINE_SATELLITE_CONTENT.sections[0].lead}
            </p>

            {/* Image satellite */}
            <div className="relative rounded-[8px] overflow-hidden border border-sand-line bg-black/5">
              <img
                src={LAMINE_SATELLITE_CONTENT.sections[0].image}
                alt="Carte Sentinel-5P NO2 Sénégal Dakar"
                className="w-full h-auto object-cover max-h-72 rounded-[8px]"
                loading="lazy"
              />
              <div className="p-2 bg-sand-surface/90 border-t border-sand-line flex items-center justify-between text-[10px] text-ink-subtle">
                <span>Résolution haute précision</span>
                <span className="font-medium text-[#2A6F97]">Imagerie spatiale</span>
              </div>
            </div>

            <ul className="space-y-1 pt-1">
              {LAMINE_SATELLITE_CONTENT.sections[0].keyPoints.map((pt, idx) => (
                <li key={idx} className="p-2 bg-sand-surface rounded-[8px] text-[11px] text-ink-muted">
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2 : Vidéo Timelapse AER_AI */}
          <div className="p-3 bg-white border border-sand-line rounded-[12px] space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-medium text-ink text-sm">
                2. Animation accélérée des nuages de poussières sahariennes
              </h4>
              <span className="text-[10px] bg-sand-surface px-2 py-0.5 rounded-full text-ink-subtle">
                Masses d'air récentes
              </span>
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              {LAMINE_SATELLITE_CONTENT.sections[1].lead}
            </p>

            {/* Lecteur vidéo */}
            <div className="rounded-[8px] overflow-hidden border border-sand-line bg-black">
              <video
                src={LAMINE_SATELLITE_CONTENT.sections[1].video}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto max-h-64 object-contain mx-auto"
              >
                Votre navigateur ne prend pas en charge la balise vidéo.
              </video>
              <div className="p-2 bg-sand-surface text-[10px] text-ink-subtle flex items-center justify-between">
                <span>Animation du transport d'aérosols vers la côte dakaroise</span>
                <span className="text-terracotta font-medium">Harmattan Saharien</span>
              </div>
            </div>

            <ul className="space-y-1 pt-1">
              {LAMINE_SATELLITE_CONTENT.sections[1].keyPoints.map((pt, idx) => (
                <li key={idx} className="p-2 bg-sand-surface rounded-[8px] text-[11px] text-ink-muted">
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3 : Transparence & Audit technique */}
          <div className="p-3 bg-[#FAF8F5] border border-sand-line rounded-[12px] space-y-2">
            <h4 className="font-serif font-medium text-ink text-sm">
              3. Transparence Scientifique & Traitement des Fichiers NetCDF
            </h4>
            <div className="space-y-1.5 pt-1">
              {LAMINE_SATELLITE_CONTENT.sections[2].auditPoints?.map((ap, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-[8px] border border-sand-line/60 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <strong className="text-ink">{ap.label}</strong>
                    <span className="text-[10px] text-[#2A6F97] font-medium bg-[#EBF2F7] px-1.5 py-0.5 rounded">
                      {ap.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">{ap.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}
