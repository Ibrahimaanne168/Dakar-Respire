"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { POLLUTION_SOURCES, SEASON_RIBBON } from "@/lib/dashboardData";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import { Wind, Calendar, Info } from "lucide-react";

export default function SourcesSection() {
  return (
    <section id="sources" className="space-y-6 pt-6">
      {/* ── 1. Donut et tableau de légende des sources (Alioune, Campagne 2009) ── */}
      <div className="dash-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sand-line/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
                Section ③ · Recherche d'Alioune Badara Sarr
              </span>
              <StatusBadge status="Mesuré" size="sm" />
            </div>
            <h2 className="font-serif text-2xl text-ink font-normal mt-1">
              D'où proviennent les particules fines à Dakar ?
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Ordres de grandeur documentés lors de la campagne de saison sèche 2009 sur la presqu'île
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-ink-subtle block">Source scientifique</span>
            <span className="text-xs font-medium text-ink">Campagne POLCA / Alioune B. Sarr</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart (style capture 3) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-56 h-56 sm:w-64 sm:h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as any;
                        return (
                          <div className="bg-white rounded-lg p-2.5 shadow-card border border-sand-line text-xs space-y-1">
                            <div className="font-medium text-ink">{item.name}</div>
                            <div className="text-terracotta font-serif text-sm">
                              Fourchette : {item.range}
                            </div>
                            <div className="text-[11px] text-ink-subtle">{item.description}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={POLLUTION_SOURCES}
                    dataKey="share"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={96}
                    paddingAngle={3}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  >
                    {POLLUTION_SOURCES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Texte au centre du donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-[11px] uppercase tracking-wider text-ink-subtle">Source n°1</span>
                <span className="font-serif text-2xl font-normal text-ink leading-tight">
                  Trafic
                </span>
                <span className="text-xs font-medium text-terracotta tabular-nums">≈ 49 %</span>
              </div>
            </div>
            <p className="text-[11px] text-ink-subtle mt-2">Survoler pour afficher le détail</p>
          </div>

          {/* Tableau de légende détaillé avec fourchettes réelles */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-sand-line text-ink-subtle font-normal">
                  <th className="py-2.5 pr-4 font-normal">Secteur émetteur</th>
                  <th className="py-2.5 pr-4 font-normal">Fourchette documentée</th>
                  <th className="py-2.5 font-normal">Processus d'émission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-line/60">
                {POLLUTION_SOURCES.map((src, i) => (
                  <tr key={i} className="hover:bg-sand-surface/60 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: src.color }}
                        />
                        <span className="font-medium text-ink">{src.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-serif text-sm font-medium text-ink tabular-nums">
                        {src.range}
                      </span>
                    </td>
                    <td className="py-3 text-ink-muted text-[11px] leading-relaxed">
                      {src.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DataMetadata
          unit="Pourcentage (%)"
          source="Alioune Badara Sarr (synthèse POLCA 2009)"
          period="Campagne de saison sèche"
          status="Mesuré"
        />
      </div>

      {/* ── 2. Ruban des 12 mois de saisonnalité + Encadré Harmattan ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ruban des saisons (12 mois) */}
        <div className="dash-card lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-terracotta" />
              <h3 className="font-serif text-base text-ink font-normal">
                Cycle saisonnier annuel (12 mois)
              </h3>
            </div>
            <StatusBadge status="Mesuré" size="sm" />
          </div>

          <p className="text-xs text-ink-muted">
            Deux régimes distincts rythment la qualité de l'air à Dakar. Les mois non documentés lors de la campagne de mesure sont indiqués de façon transparente.
          </p>

          {/* Grille des 12 mois */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
            {SEASON_RIBBON.map((m, idx) => {
              let bg = "bg-sand-surface border-sand-line text-ink-muted";
              let badgeBg = "bg-white text-ink-subtle";

              if (m.status === "pic") {
                bg = "bg-[#FDF0EC] border-[#A8372C]/30 text-[#A8372C]";
                badgeBg = "bg-[#A8372C] text-white";
              } else if (m.status === "eleve") {
                bg = "bg-[#FCF5E8] border-[#C99A1E]/30 text-[#8C5E09]";
                badgeBg = "bg-[#C99A1E] text-white";
              } else if (m.status === "minimum") {
                bg = "bg-[#EAF3ED] border-[#3F7D58]/30 text-[#24613B]";
                badgeBg = "bg-[#3F7D58] text-white";
              }

              return (
                <div
                  key={idx}
                  className={`border rounded-[14px] p-2.5 flex flex-col justify-between min-h-[96px] ${bg} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-medium">{m.month}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${badgeBg}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-[10px] leading-tight text-ink-muted mt-2">{m.comment}</p>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-ink-subtle pt-2 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A8372C]" /> Pics annuels (Décembre – Février)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C99A1E]" /> Élevé (Novembre & Mars)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3F7D58]" /> Minimum annuel (Juillet – Septembre)
            </span>
          </div>

          <DataMetadata
            source="IQAir / Alioune B. Sarr"
            period="Année calendaire"
            status="Mesuré"
          />
        </div>

        {/* Encadré Harmattan */}
        <div className="dash-card lg:col-span-4 flex flex-col justify-between space-y-4 bg-gradient-to-b from-white to-[#FAF6EE]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-terracotta">
              <Wind className="w-4 h-4" />
              <h3 className="font-serif text-base text-ink font-normal">
                Le phénomène de l'Harmattan
              </h3>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              L'Harmattan est un alizé continental chaud et très sec soufflant du nord-est depuis le Sahara. En traversant le Sahel, il arrache des tonnes de particules minérales très fines (diamètre inférieur à 2,5 µm) qui s'accumulent au-dessus de la presqu'île du Cap-Vert.
            </p>

            <div className="p-3 bg-white rounded-[12px] border border-sand-line/70 text-xs space-y-1.5">
              <div className="font-medium text-ink">Signature physique à Dakar :</div>
              <ul className="text-ink-muted text-[11px] space-y-1 list-disc list-inside">
                <li>Vent directionnel : 20° à 80° (secteur Nord-Est).</li>
                <li>Chute de visibilité horizontale &lt; 5 km.</li>
                <li>Humidité relative fréquemment inférieure à 30%.</li>
                <li>Pics journaliers pouvant excéder 150 µg/m³.</li>
              </ul>
            </div>
          </div>

          <DataMetadata
            source="Étude Harmattan (Alioune B. Sarr)"
            status="Mesuré"
            className="pt-2"
          />
        </div>
      </div>
    </section>
  );
}
