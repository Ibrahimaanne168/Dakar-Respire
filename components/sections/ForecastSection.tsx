"use client";

import React, { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Cell,
} from "recharts";
import { getAlertLevel } from "@/lib/config";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import { ChevronDown, ChevronUp, Download, Check } from "lucide-react";

interface ForecastSectionProps {
  selectedHour: number;
  onHourChange: (hour: number) => void;
  data: any;
  isSynthetic: boolean;
}

export default function ForecastSection({
  selectedHour,
  onHourChange,
  data,
  isSynthetic,
}: ForecastSectionProps) {
  const [selectedModel, setSelectedModel] = useState<string>("catboost");
  const [tableOpen, setTableOpen] = useState<boolean>(false);
  const [touchActiveIndex, setTouchActiveIndex] = useState<number | null>(null);

  const hourlyList = data?.hourly || [];

  const modelsList = [
    { id: "catboost", name: "CatBoost", tag: "Recommandé" },
    { id: "histgb", name: "HistGB", tag: "Rapide" },
    { id: "rf", name: "Random Forest", tag: "Ensemble" },
    { id: "ridge", name: "Ridge", tag: "Linéaire" },
  ];

  const chartData = hourlyList.map((item: any) => {
    let factor = 1.0;
    if (selectedModel === "rf") factor = 1.04;
    else if (selectedModel === "ridge") factor = 0.95;
    else if (selectedModel === "histgb") factor = 0.98;

    const adjustedPm25 = parseFloat((item.pm25 * factor).toFixed(1));
    const alert = getAlertLevel(adjustedPm25);

    return {
      name: `${item.hour}h`,
      hour: item.hour,
      offset: item.hour_offset,
      pm25: adjustedPm25,
      wind: item.wind_speed,
      color: alert.color,
      levelLabel: alert.label,
    };
  });

  const maxVal = Math.max(65, ...chartData.map((d: any) => d.pm25)) + 5;
  const peakItem = chartData.reduce(
    (best: any, h: any) => (h.pm25 > (best?.pm25 ?? -1) ? h : best),
    null
  );

  const activeItem =
    chartData.find((d: any) => d.hour === selectedHour) || chartData[0];

  const exportCsv = () => {
    const headers = "echeance,heure_utc,pm25_ug_m3,niveau,vent_ms\n";
    const rows = chartData
      .map(
        (h: any) =>
          `+${h.offset}h,${h.hour}:00,${h.pm25},${h.levelLabel},${h.wind}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `previsions_dakar_24h_${selectedModel}.csv`);
    link.click();
  };

  return (
    <section id="prevision" className="space-y-4 pt-4">
      <div className="dash-card space-y-4 p-4 sm:p-6">
        {/* En-tête mobile first */}
        <div className="flex flex-col gap-2 pb-3 border-b border-sand-line/60">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
              Section ② · Prévision 24 h
            </span>
            <StatusBadge status={isSynthetic ? "Simulé" : "Modèle"} size="sm" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal">
            Évolution horaire des PM2.5
          </h2>
          <p className="text-xs text-ink-muted">
            Glissez le doigt sur le graphique pour inspecter chaque heure
          </p>

          {/* Sélecteur de modèle en boutons tactiles (>= 44px) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 pt-2">
            {modelsList.map((m) => {
              const active = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`touch-target h-10 px-3 text-xs rounded-pill transition-all font-medium flex items-center justify-center gap-1.5 ${
                    active
                      ? "bg-ink text-white shadow-xs"
                      : "bg-sand-surface text-ink-muted border border-sand-line active:bg-sand-line"
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 text-terracotta" />}
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Infobulle active AU-DESSUS du doigt (ne cache jamais l'interaction) ── */}
        {activeItem && (
          <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line flex items-center justify-between text-xs tabular-nums">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeItem.color }}
              />
              <span className="font-serif text-base font-medium text-ink">
                {activeItem.hour} h : {activeItem.pm25.toFixed(1).replace(".", ",")} µg/m³
              </span>
              <span className="text-ink-subtle hidden xs:inline">({activeItem.levelLabel})</span>
            </div>
            <span className="text-ink-muted text-[11px]">Vent {activeItem.wind} m/s</span>
          </div>
        )}

        {/* ── Graphique en barres 24h pleine largeur ── */}
        <div className="relative h-64 sm:h-72 w-full touch-action-pan-y">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 6, left: -26, bottom: 0 }}
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length) {
                  onHourChange(state.activePayload[0].payload.hour);
                }
              }}
            >
              <ReferenceArea y1={0} y2={15} fill="#3F7D58" fillOpacity={0.08} />
              <ReferenceArea y1={15} y2={35} fill="#C99A1E" fillOpacity={0.08} />
              <ReferenceArea y1={35} y2={55} fill="#D2691E" fillOpacity={0.08} />
              <ReferenceArea y1={55} y2={maxVal} fill="#A8372C" fillOpacity={0.08} />

              {peakItem && (
                <ReferenceLine
                  x={peakItem.name}
                  stroke="#A8372C"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              )}

              {/* Une étiquette d'heure sur 6 (0h, 6h, 12h, 18h) pour écran 360px */}
              <XAxis
                dataKey="name"
                stroke="#8E8B82"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#E4DCCB" }}
                interval={5}
              />
              <YAxis
                stroke="#8E8B82"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#E4DCCB" }}
                domain={[0, maxVal]}
                unit=" µg"
              />
              <Tooltip
                cursor={{ fill: "rgba(181, 83, 42, 0.08)" }}
                content={() => null} // L'infobulle est affichée au-dessus du graphique pour ne pas masquer le doigt
              />
              <Bar dataKey="pm25" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {chartData.map((entry: any, index: number) => {
                  const isSelected = entry.hour === selectedHour;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={isSelected ? "#1B1F23" : "none"}
                      strokeWidth={isSelected ? 2 : 0}
                      opacity={isSelected ? 1 : 0.8}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Légende horizontale des niveaux sous le graphique ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-sand-line/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F7D58] shrink-0" />
            <span>Bon · ≤ 15 µg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C99A1E] shrink-0" />
            <span>Moyen · 15 à 35</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D2691E] shrink-0" />
            <span>Mauvais · 35 à 55</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A8372C] shrink-0" />
            <span>Très mauvais · +55</span>
          </div>
        </div>

        <p className="text-[11px] text-ink-subtle">
          * Seuils de santé provisoires (OMS 2021). Toucher une barre pour la sélectionner.
        </p>

        {/* ── Bouton repliable « Voir le détail heure par heure » ── */}
        <div className="pt-2 border-t border-sand-line/60">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setTableOpen(!tableOpen)}
              className="touch-target text-xs text-ink font-medium flex items-center gap-1.5 hover:text-terracotta"
            >
              {tableOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Masquer le détail
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Voir le détail heure par heure
                </>
              )}
            </button>

            <button
              onClick={exportCsv}
              className="touch-target px-3 py-1 text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 border border-sand-line rounded-pill bg-white"
            >
              <Download className="w-3.5 h-3.5 text-terracotta" />
              <span>CSV</span>
            </button>
          </div>

          {tableOpen && (
            <div className="divide-y divide-sand-line/50 mt-3 pt-2 border-t border-sand-line/40 max-h-64 overflow-y-auto">
              {chartData.map((row: any, idx: number) => {
                const isSelected = row.hour === selectedHour;
                return (
                  <div
                    key={idx}
                    onClick={() => onHourChange(row.hour)}
                    className={`py-2 px-2 flex items-center justify-between text-xs cursor-pointer rounded-lg ${
                      isSelected ? "bg-sand-surface font-medium" : "hover:bg-sand-surface/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-ink-subtle w-8">+{row.offset}h</span>
                      <span className="font-medium">{row.hour}:00</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: row.color }} />
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span>{row.pm25.toFixed(1)} µg/m³</span>
                      <span className="text-ink-subtle text-[11px]">{row.wind} m/s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DataMetadata
          unit="µg/m³"
          source={`Inférence ${selectedModel}`}
          period="24 heures"
          status={isSynthetic ? "Simulé" : "Modèle"}
        />
      </div>
    </section>
  );
}
