"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MODELS_BENCHMARK, SATELLITE_EXPERIMENT } from "@/lib/dashboardData";
import { ALIOUNE_FACTS } from "@/lib/config";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import { Award, ChevronDown, ChevronUp, BookOpen, AlertCircle, BarChart3 } from "lucide-react";

export default function ModelSection() {
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [refsOpen, setRefsOpen] = useState(false);

  // Échantillon de validation
  const validationCurve = [
    { hour: "00h", reel: 21.0, prevu: 22.4, cams: 28.0 },
    { hour: "04h", reel: 14.5, prevu: 15.2, cams: 26.5 },
    { hour: "08h", reel: 24.0, prevu: 22.8, cams: 29.0 },
    { hour: "12h", reel: 28.5, prevu: 27.1, cams: 31.0 },
    { hour: "16h", reel: 31.0, prevu: 32.4, cams: 34.0 },
    { hour: "20h", reel: 35.5, prevu: 34.2, cams: 38.0 },
    { hour: "23h", reel: 26.0, prevu: 27.5, cams: 32.0 },
  ];

  return (
    <section id="modele" className="space-y-4 pt-4">
      {/* ── 1. Benchmark comparatif en LISTE DE CARTES (mobile first) ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex flex-col gap-1 pb-3 border-b border-sand-line/60">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
              Section ⑥ · Modèle & Preuve
            </span>
            <StatusBadge status="Simulé" size="sm" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal">
            Comparaison des algorithmes
          </h2>
          <p className="text-xs text-ink-muted">
            Évaluation rigoureuse sur découpage temporel continu
          </p>
        </div>

        {/* Liste de cartes par modèle avec barre d'erreur RMSE */}
        <div className="space-y-2.5">
          {MODELS_BENCHMARK.map((m, i) => {
            const isTop = i === 0;
            const rmseBarWidth = Math.min(100, Math.round((m.rmse / 25) * 100));

            return (
              <div
                key={i}
                className={`p-3 rounded-[14px] border transition-all space-y-2 ${
                  isTop
                    ? "bg-[#EAF3ED]/60 border-[#3F7D58]/40 shadow-xs"
                    : "bg-white border-sand-line/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs text-ink">{m.name}</span>
                    {isTop && (
                      <span className="text-[10px] bg-white border border-[#3F7D58]/40 text-[#24613B] px-1.5 py-0.2 rounded-full font-medium">
                        Recommandé
                      </span>
                    )}
                  </div>
                  <StatusBadge status={m.status} size="sm" />
                </div>

                {/* Métriques R² et RMSE */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-1 tabular-nums border-t border-sand-line/40">
                  <div>
                    <span className="text-[10px] text-ink-subtle block">R² (↑)</span>
                    <strong className="font-serif text-sm font-medium text-ink">{m.r2.toFixed(3)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-subtle block">RMSE global</span>
                    <strong className="font-serif text-sm font-medium text-ink">{m.rmse.toFixed(1)} µg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-subtle block">Saison sèche</span>
                    <strong className="font-serif text-sm font-medium text-ink-muted">{m.rmseDry.toFixed(1)} µg</strong>
                  </div>
                </div>

                {/* Barre visuelle d'erreur relative */}
                <div className="space-y-1 pt-0.5">
                  <div className="w-full h-1.5 bg-sand-line/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isTop ? "bg-[#3F7D58]" : "bg-terracotta"}`}
                      style={{ width: `${rmseBarWidth}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-ink-subtle block">{m.note}</span>
                </div>
              </div>
            );
          })}
        </div>

        <DataMetadata
          unit="µg/m³ et R²"
          source="Pipeline ML (ml/evaluate.py)"
          period="Jeu de test continu"
          status="Simulé"
        />
      </div>

      {/* ── 2. Prévu contre mesuré (Courbe) ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <h3 className="font-serif text-sm font-normal text-ink">
            Prévu contre mesuré (Dernières 24 h)
          </h3>
          <StatusBadge status="Simulé" size="sm" />
        </div>

        <div className="h-52 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={validationCurve} margin={{ top: 10, right: 6, left: -24, bottom: 0 }}>
              <XAxis dataKey="hour" stroke="#8E8B82" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#E4DCCB" }} />
              <YAxis stroke="#8E8B82" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#E4DCCB" }} unit=" µg" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white rounded-lg p-2 shadow-card border border-sand-line text-xs tabular-nums space-y-0.5">
                        <div className="font-medium text-ink-subtle">{payload[0].payload.hour}</div>
                        <div>Mesuré : <strong>{payload[0].value} µg/m³</strong></div>
                        <div className="text-terracotta">Prévu : <strong>{payload[1]?.value} µg/m³</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="reel" stroke="#1B1F23" strokeWidth={2} fillOpacity={0} />
              <Area type="monotone" dataKey="prevu" stroke="#B5532A" strokeWidth={2} strokeDasharray="3 2" fillOpacity={0} />
              <Area type="monotone" dataKey="cams" stroke="#8E8B82" strokeWidth={1} strokeDasharray="2 2" fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-subtle pt-1">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#1B1F23]" /> Mesuré au sol</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-terracotta" /> Prévu modèle</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#8E8B82]" /> CAMS brut</span>
        </div>
      </div>

      {/* ── 3. Expérience « Le satellite aide-t-il ? » (3 barres) ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Expérience : Le satellite aide-t-il la prévision ?
            </h3>
          </div>
          <StatusBadge status="Modèle" size="sm" />
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Comparaison de 3 configurations sur Dakar à 24 h :
        </p>

        <div className="space-y-2.5 pt-1">
          {SATELLITE_EXPERIMENT.map((exp, idx) => (
            <div key={idx} className="p-2.5 bg-sand-surface rounded-[12px] border border-sand-line/60 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink">{exp.setup}</span>
                <span className="font-serif font-medium text-ink tabular-nums">
                  R² = {exp.r2.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-sand-line rounded-full overflow-hidden">
                <div className="h-full bg-teal" style={{ width: `${Math.round(exp.r2 * 100)}%` }} />
              </div>
              <p className="text-[10px] text-ink-subtle">{exp.comment}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-ink-subtle pt-1">
          <strong>Pourquoi le satellite seul ne suffit pas :</strong> Un satellite observe l'atmosphère depuis l'espace (souvent des poussières qui survolent la ville à haute altitude sans toucher le sol). C'est pourquoi les capteurs dans les rues sont indispensables pour connaître l'air réellement respiré.
        </p>

        {/* Note observationnelle Sentinel-5P */}
        <div className="p-2.5 bg-[#EBF2F7] border border-[#2A6F97]/30 rounded-[10px] space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-[#1E5270] font-medium">
            <span>L'apport des observations spatiales</span>
            <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border border-[#2A6F97]/30 font-semibold">
              Données réelles
            </span>
          </div>
          <p className="text-ink-muted">
            Les images satellites permettent de voir arriver les nuages de poussière du Sahara deux jours à l'avance, tandis que les capteurs au sol mesurent avec exactitude les heures de pointe du trafic urbain dans nos quartiers.
          </p>
        </div>
      </div>

      {/* ── 4. Limites et références en ACCORDÉONS repliables au toucher ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        {/* Accordéon 1 : Ce que le modèle ne sait pas faire */}
        <div className="border-b border-sand-line/60 pb-3">
          <button
            onClick={() => setLimitsOpen(!limitsOpen)}
            className="touch-target w-full flex items-center justify-between text-left text-xs font-medium text-ink hover:text-terracotta"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-terracotta" />
              <span>Les 5 défis majeurs pour anticiper la pollution à Dakar</span>
            </span>
            {limitsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {limitsOpen && (
            <div className="space-y-2 mt-3 pt-2 text-xs text-ink-muted">
              <div className="p-2.5 bg-sand-surface rounded-[10px] space-y-0.5">
                <strong className="text-ink block">1. L'altitude du sable :</strong>
                <span>Le satellite voit la poussière qui vole à 3 000 m d'altitude. Sans capteurs au sol, impossible de savoir quelle part retombe au niveau des poumons.</span>
              </div>
              <div className="p-2.5 bg-sand-surface rounded-[10px] space-y-0.5">
                <strong className="text-ink block">2. L'humidité de l'océan :</strong>
                <span>L'air marin humide fait gonfler les embruns, et les nuages d'hivernage peuvent temporairement masquer la vue des satellites.</span>
              </div>
              <div className="p-2.5 bg-sand-surface rounded-[10px] space-y-0.5">
                <strong className="text-ink block">3. La diversité des quartiers :</strong>
                <span>Un pixel satellite couvre plusieurs kilomètres et ne distingue pas une rue calme bordée d'arbres d'un axe routier congestionné.</span>
              </div>
              <div className="p-2.5 bg-sand-surface rounded-[10px] space-y-0.5">
                <strong className="text-ink block">4. Le rythme des passages :</strong>
                <span>Les satellites ne survolent généralement la zone qu'une fois par jour, ratant le pic de circulation du matin et celui du soir.</span>
              </div>
              <div className="p-2.5 bg-sand-surface rounded-[10px] space-y-0.5">
                <strong className="text-ink block">5. La soudaineté des tempêtes :</strong>
                <span>Les tempêtes d'Harmattan peuvent envahir la presqu'île en quelques heures seulement, nécessitant des alertes réactives.</span>
              </div>
            </div>
          )}
        </div>

        {/* Accordéon 2 : Références scientifiques */}
        <div>
          <button
            onClick={() => setRefsOpen(!refsOpen)}
            className="touch-target w-full flex items-center justify-between text-left text-xs font-medium text-ink hover:text-terracotta"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-terracotta" />
              <span>Études et publications scientifiques de référence</span>
            </span>
            {refsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {refsOpen && (
            <ul className="divide-y divide-sand-line/50 text-xs mt-3 pt-2">
              {ALIOUNE_FACTS.references.map((ref, idx) => (
                <li key={idx} className="py-2 space-y-0.5">
                  <div className="font-medium text-ink">{ref.authors} — <em>{ref.title}</em></div>
                  <div className="text-[11px] text-ink-subtle">{ref.journal} · {ref.note}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
