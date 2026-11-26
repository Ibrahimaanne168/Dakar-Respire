"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { POLLUTION_SOURCES, SEASON_RIBBON } from "@/lib/dashboardData";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import { Wind, Calendar } from "lucide-react";

export default function SourcesSection() {
  const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(0);

  // Abréviation compacte des 12 mois pour mobile (J, F, M, A, M, J, J, A, S, O, N, D)
  const monthLetters = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <section id="sources" className="space-y-4 pt-4">
      {/* ── 1. Donut centré et légende en liste dessous ── */}
      <div className="dash-card space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-1 pb-3 border-b border-sand-line/60">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
              Section ③ · Origine des poussières
            </span>
            <StatusBadge status="Mesuré" size="sm" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal">
            D'où proviennent les particules fines ?
          </h2>
          <p className="text-xs text-ink-muted">
            Origine des particules respirées dans l'agglomération dakaroise
          </p>
        </div>

        {/* Encadré explicatif en langage simple */}
        <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line/70 text-xs text-ink-muted leading-relaxed">
          <strong className="text-ink font-medium block mb-0.5">En clair :</strong>
          À Dakar, la pollution a deux coupables principaux : les <strong>gaz d'échappement</strong> de la circulation urbaine au quotidien, et les <strong>nuages de poussière du désert</strong> apportés par le vent en saison sèche.
        </div>

        {/* Donut centré */}
        <div className="flex flex-col items-center justify-center pt-1">
          <div className="w-48 h-48 sm:w-56 sm:h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={POLLUTION_SOURCES}
                  dataKey="share"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={3}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  onClick={(_, index) => setActiveSourceIndex(index)}
                >
                  {POLLUTION_SOURCES.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeSourceIndex === index ? 1 : 0.85}
                      className="cursor-pointer"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Texte au centre */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
              <span className="text-[10px] uppercase tracking-wider text-ink-subtle">Secteur n°1</span>
              <span className="font-serif text-xl font-normal text-ink leading-tight">
                Trafic
              </span>
              <span className="text-xs font-medium text-terracotta tabular-nums">≈ 49 %</span>
            </div>
          </div>
          <p className="text-[11px] text-ink-subtle mt-1">Toucher un segment pour mettre en valeur</p>
        </div>

        {/* Légende en liste dessous (une ligne par source avec fourchette) */}
        <div className="space-y-2 pt-2 border-t border-sand-line/60">
          {POLLUTION_SOURCES.map((src, i) => {
            const isHighlighted = activeSourceIndex === i;
            return (
              <div
                key={i}
                onClick={() => setActiveSourceIndex(i)}
                className={`p-2.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isHighlighted
                    ? "bg-sand-surface border-terracotta ring-1 ring-terracotta shadow-xs"
                    : "bg-white border-sand-line/60 hover:bg-sand-surface/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: src.color }}
                  />
                  <div>
                    <span className="font-medium text-ink block">{src.name}</span>
                    <span className="text-[11px] text-ink-subtle block">{src.description}</span>
                  </div>
                </div>
                <span className="font-serif text-sm font-medium text-ink tabular-nums shrink-0 ml-2">
                  {src.range}
                </span>
              </div>
            );
          })}
        </div>

        <DataMetadata
          unit="Part en %"
          source="Inventaire des émissions de la métropole"
          period="Moyenne annuelle"
          status="Mesuré"
        />
      </div>

      {/* ── 2. Ruban des 12 mois compact sur une ligne ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Régime saisonnier annuel (12 mois)
            </h3>
          </div>
          <StatusBadge status="Mesuré" size="sm" />
        </div>

        <p className="text-xs text-ink-muted">
          Pics en saison sèche sous l'Harmattan (décembre–février), minimum en hivernage (juillet–septembre).
        </p>

        {/* 12 cases compactes sur une seule ligne (J F M A M J J A S O N D) */}
        <div className="grid grid-cols-12 gap-1 pt-1 text-center">
          {SEASON_RIBBON.map((m, idx) => {
            let bg = "bg-sand-surface text-ink-muted border-sand-line";
            if (m.status === "pic") bg = "bg-[#A8372C] text-white border-[#A8372C]";
            else if (m.status === "eleve") bg = "bg-[#C99A1E] text-white border-[#C99A1E]";
            else if (m.status === "minimum") bg = "bg-[#3F7D58] text-white border-[#3F7D58]";

            return (
              <div
                key={idx}
                className={`py-2 rounded-md border text-[11px] font-medium ${bg}`}
                title={`${m.month} : ${m.label}`}
              >
                <span>{monthLetters[idx]}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-subtle pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#A8372C]" /> Pics (D–F)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C99A1E]" /> Élevé (N, M)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3F7D58]" /> Minimum (J–S)
          </span>
        </div>

        {/* Encadré court Harmattan */}
        <div className="p-3 bg-[#FAF6EE] rounded-[12px] border border-sand-line text-xs space-y-1 mt-2">
          <div className="font-medium text-ink flex items-center gap-1.5 text-terracotta">
            <Wind className="w-3.5 h-3.5" />
            <span>L'Harmattan en bref</span>
          </div>
          <p className="text-ink-muted text-[11px] leading-relaxed">
            Vent sec de nord-est qui transporte les poussières du Sahara sur Dakar, saturant l'atmosphère de particules fines insolubles.
          </p>
        </div>
      </div>
    </section>
  );
}
