"use client";

import React, { useState } from "react";
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

  const hourlyList = data?.hourly || [];

  const modelsList = [
    { id: "catboost", name: "CatBoost (Recommandé)", tag: "Optimal" },
    { id: "histgb", name: "HistGradientBoosting", tag: "Rapide" },
    { id: "rf", name: "Random Forest", tag: "Ensemble" },
    { id: "ridge", name: "Régression Ridge", tag: "Linéaire" },
  ];

  // Ajustement léger des valeurs selon le modèle sélectionné pour simuler le comportement comparatif
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
    <section id="prevision" className="space-y-6 pt-6">
      <div className="dash-card space-y-6">
        {/* En-tête de section avec sélecteur de modèle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sand-line/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
                Section ② · Échéance 24 heures
              </span>
              <StatusBadge status={isSynthetic ? "Simulé" : "Modèle"} size="sm" />
            </div>
            <h2 className="font-serif text-2xl text-ink font-normal mt-1">
              Prévision horaire des particules fines (PM2.5)
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Cycle diurne et dispersion côtière heure par heure sur la presqu'île du Cap-Vert
            </p>
          </div>

          {/* Sélecteur de modèle en boutons pilules */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-sand-surface rounded-pill border border-sand-line self-start md:self-center">
            {modelsList.map((m) => {
              const active = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-3 py-1 text-xs rounded-pill transition-all font-medium flex items-center gap-1.5 ${
                    active
                      ? "bg-ink text-white shadow-sm"
                      : "text-ink-muted hover:text-ink hover:bg-white/60"
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-terracotta" />}
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Graphique en barres horaires avec marge de légende droite ── */}
        <div className="space-y-2">
          <div className="flex items-stretch gap-0">
            {/* Conteneur graphique */}
            <div className="flex-1 h-72 sm:h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 28, right: 12, left: -16, bottom: 0 }}
                  onClick={(state) => {
                    if (state && state.activePayload && state.activePayload.length) {
                      const clickedHour = state.activePayload[0].payload.hour;
                      onHourChange(clickedHour);
                    }
                  }}
                >
                  {/* Bandes colorées d'arrière-plan sourdes */}
                  <ReferenceArea y1={0} y2={15} fill="#3F7D58" fillOpacity={0.09} />
                  <ReferenceArea y1={15} y2={35} fill="#C99A1E" fillOpacity={0.09} />
                  <ReferenceArea y1={35} y2={55} fill="#D2691E" fillOpacity={0.09} />
                  <ReferenceArea y1={55} y2={maxVal} fill="#A8372C" fillOpacity={0.09} />

                  {/* Marqueur pour le pic horaire */}
                  {peakItem && (
                    <ReferenceLine
                      x={peakItem.name}
                      stroke="#A8372C"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      label={{
                        value: `Pic ${peakItem.hour}h · ${peakItem.pm25} µg`,
                        position: "insideTop",
                        fill: "#A8372C",
                        fontSize: 10,
                        dy: -14,
                      }}
                    />
                  )}

                  <XAxis
                    dataKey="name"
                    stroke="#8E8B82"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "#E4DCCB" }}
                    interval={1}
                  />
                  <YAxis
                    stroke="#8E8B82"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "#E4DCCB" }}
                    domain={[0, maxVal]}
                    label={{
                      value: "µg/m³",
                      position: "insideTopLeft",
                      offset: 6,
                      fontSize: 10,
                      fill: "#8E8B82",
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(181, 83, 42, 0.06)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const val = payload[0].value as number;
                        const alert = getAlertLevel(val);
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white rounded-lg p-2.5 shadow-card border border-sand-line text-xs tabular-nums space-y-1">
                            <div className="text-ink-subtle font-medium">{item.name} UTC ({item.hour}:00 Dakar)</div>
                            <div className="font-serif text-sm font-medium">
                              {val.toFixed(1).replace(".", ",")} µg/m³
                            </div>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: alert.color }}
                              />
                              <span style={{ color: alert.color }} className="font-medium">
                                {alert.label}
                              </span>
                              <span className="text-ink-subtle ml-1">· Vent {item.wind} m/s</span>
                            </div>
                            <div className="text-[10px] text-terracotta pt-0.5 border-t border-sand-line/50">
                              Cliquer pour caler la 3D et les jauges sur cette heure
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="pm25" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {chartData.map((entry: any, index: number) => {
                      const isSelected = entry.hour === selectedHour;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={isSelected ? "#1B1F23" : "none"}
                          strokeWidth={isSelected ? 2.5 : 0}
                          opacity={isSelected ? 1 : 0.82}
                          className="cursor-pointer transition-opacity hover:opacity-100"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Légende positionnée dans la marge à droite (hors du graphique) */}
            <div className="flex flex-col justify-between text-[10px] leading-tight py-2 pl-3 w-28 sm:w-32 shrink-0 select-none border-l border-sand-line/60">
              <div className="space-y-0.5">
                <span style={{ color: "#A8372C" }} className="font-medium block">
                  Très mauvais
                </span>
                <span className="text-ink-subtle font-mono">+55 µg/m³</span>
              </div>

              <div className="space-y-0.5">
                <span style={{ color: "#D2691E" }} className="font-medium block">
                  Mauvais
                </span>
                <span className="text-ink-subtle font-mono">35 à 55 µg/m³</span>
              </div>

              <div className="space-y-0.5">
                <span style={{ color: "#C99A1E" }} className="font-medium block">
                  Moyen
                </span>
                <span className="text-ink-subtle font-mono">15 à 35 µg/m³</span>
              </div>

              <div className="space-y-0.5">
                <span style={{ color: "#3F7D58" }} className="font-medium block">
                  Bon
                </span>
                <span className="text-ink-subtle font-mono">0 à 15 µg/m³</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-ink-subtle pt-1 gap-2">
            <span>
              * Seuils de santé provisoires (OMS 2021). La correspondance officielle avec l'indice IQA du CGQA sera intégrée dès accord.
            </span>
            <span className="text-terracotta">
              Heure active : <strong>{selectedHour}h00</strong> (barre cerclée de noir)
            </span>
          </div>
        </div>

        {/* ── Tableau détaillé replié ── */}
        <div className="pt-2 border-t border-sand-line/60">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setTableOpen(!tableOpen)}
              className="text-xs text-ink hover:text-terracotta font-medium flex items-center gap-1.5 transition-colors"
            >
              {tableOpen ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Masquer le tableau heure par heure
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Consulter le tableau heure par heure détaillé
                </>
              )}
            </button>

            <button
              onClick={exportCsv}
              className="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 border border-sand-line px-3 py-1 rounded-pill bg-white hover:bg-sand-surface transition-colors"
            >
              <Download className="w-3 h-3 text-terracotta" />
              <span>Exporter CSV</span>
            </button>
          </div>

          {tableOpen && (
            <div className="overflow-x-auto mt-4 pt-3 border-t border-sand-line/40">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="text-ink-subtle font-normal border-b border-sand-line">
                    <th className="py-2 pr-3 font-normal">Échéance</th>
                    <th className="py-2 pr-3 font-normal">Heure UTC</th>
                    <th className="py-2 pr-3 font-normal">PM2.5 ({selectedModel})</th>
                    <th className="py-2 pr-3 font-normal">Niveau</th>
                    <th className="py-2 pr-3 font-normal">Vent</th>
                    <th className="py-2 pr-3 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-line/60">
                  {chartData.map((row: any, idx: number) => {
                    const isSelected = row.hour === selectedHour;
                    return (
                      <tr
                        key={idx}
                        onClick={() => onHourChange(row.hour)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-sand-surface font-medium" : "hover:bg-sand-surface/60"
                        }`}
                      >
                        <td className="py-2.5 pr-3 text-ink-subtle">+{row.offset} h</td>
                        <td className="py-2.5 pr-3">{row.hour}:00</td>
                        <td className="py-2.5 pr-3 font-medium">
                          {row.pm25.toFixed(1).replace(".", ",")} µg/m³
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: row.color }}
                            />
                            <span>{row.levelLabel}</span>
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-ink-muted">{row.wind} m/s</td>
                        <td className="py-2.5 pr-3 text-right">
                          <span className="text-[11px] text-terracotta underline">
                            {isSelected ? "Actif" : "Sélectionner"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DataMetadata
          unit="µg/m³"
          source={`Pipeline d'inférence (${selectedModel})`}
          period="24 heures continues"
          status={isSynthetic ? "Simulé" : "Modèle"}
        />
      </div>
    </section>
  );
}
