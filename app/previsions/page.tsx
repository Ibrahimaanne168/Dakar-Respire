"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { getAlertLevel } from "@/lib/config";
import AnimatedNumber from "@/components/AnimatedNumber";
import DakarSkyGradient from "@/components/DakarSkyGradient";

const DakarScene3D = dynamic(() => import("@/components/DakarScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-sand-surface hairline flex items-center justify-center text-xs text-ink-muted">
      Vue de Dakar…
    </div>
  ),
});

// Légende droite positionnée hors du graphique
function ChartLegend() {
  return (
    <div className="flex flex-col justify-between text-[10px] leading-tight py-1 pl-3 w-28 shrink-0 select-none">
      <span style={{ color: "#A8372C" }} className="font-medium">Très mauvais<br /><span className="font-normal opacity-80">+55 µg/m³</span></span>
      <span style={{ color: "#D2691E" }} className="font-medium">Mauvais<br /><span className="font-normal opacity-80">35–55 µg/m³</span></span>
      <span style={{ color: "#C99A1E" }} className="font-medium">Moyen<br /><span className="font-normal opacity-80">15–35 µg/m³</span></span>
      <span style={{ color: "#3F7D58" }} className="font-medium">Bon<br /><span className="font-normal opacity-80">≤ 15 µg/m³</span></span>
    </div>
  );
}

export default function PrevisionsPage() {
  const [data, setData] = useState<any>(null);
  const [selectedOffset, setSelectedOffset] = useState<number>(0);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [isSynthetic, setIsSynthetic] = useState<boolean>(true);

  useEffect(() => {
    const custom = localStorage.getItem("dakarrespire:v1:custom_prediction");
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        setData(parsed);
        setIsSynthetic(Boolean(parsed.synthetic));
        return;
      } catch (e) {}
    }
    fetch("/model/forecast.json")
      .then((res) => res.json())
      .then((d) => { setData(d); setIsSynthetic(true); })
      .catch(() => {});
  }, []);

  const hourlyList = data?.hourly || [];
  const currentItem = hourlyList[selectedOffset] || {
    hour: 14,
    pm25: 28.5,
    wind_speed: 4.2,
    wind_deg: 45,
    is_harmattan: true,
  };

  const currentPm25: number = data?.current_pm25 ?? currentItem.pm25;
  const peakPm25: number = data?.peak_pm25 ?? 34.0;

  // Trouver l'heure du pic et la meilleure heure
  const peakItem = hourlyList.reduce(
    (best: any, h: any) => (h.pm25 > (best?.pm25 ?? -1) ? h : best),
    null
  );
  const bestItem = hourlyList.reduce(
    (best: any, h: any) => (h.pm25 < (best?.pm25 ?? Infinity) ? h : best),
    null
  );

  const chartData = hourlyList.map((item: any) => ({
    name: `${item.hour}h`,
    offset: item.hour_offset,
    pm25: item.pm25,
    wind: item.wind_speed,
  }));

  const maxVal = Math.max(65, ...hourlyList.map((h: any) => h.pm25)) + 5;

  // Heure actuelle pour marqueur "maintenant"
  const nowHour = new Date().getUTCHours();
  const nowName = `${nowHour}h`;
  // Pic
  const peakName = peakItem ? `${peakItem.hour}h` : null;

  const exportCsv = () => {
    const headers = "echeance,heure_utc,pm25_ug_m3,niveau,vent_ms\n";
    const rows = hourlyList
      .map(
        (h: any) =>
          `+${h.hour_offset}h,${h.hour}:00,${h.pm25},${getAlertLevel(h.pm25).label},${h.wind_speed}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "previsions_dakar_24h.csv");
    link.click();
  };

  const currentLevel = getAlertLevel(currentPm25);
  const isHarmattan =
    currentItem.is_harmattan ||
    (currentItem.wind_deg >= 20 && currentItem.wind_deg <= 80);

  return (
    <div className="space-y-10">

      {/* ── Hero avec ciel fonctionnel ── */}
      <DakarSkyGradient
        pm25={currentPm25}
        hour={currentItem.hour}
        className="rounded-none -mx-4 sm:-mx-8 px-4 sm:px-8 pt-10 pb-8"
      >
        {/* Étiquette données simulées */}
        {isSynthetic && (
          <span className="inline-block text-[11px] border border-terracotta/50 text-terracotta px-2 py-0.5 mb-4 tabular-nums">
            Données simulées
          </span>
        )}

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-ink-muted opacity-80">
            Dakar · Presqu'île du Cap-Vert · PM2.5 actuel
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-6xl sm:text-7xl font-normal text-ink tabular-nums">
              <AnimatedNumber value={currentPm25} decimals={1} duration={800} />
            </span>
            <span className="text-lg text-ink-muted">µg/m³</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: currentLevel.color }}
            />
            <span className="font-serif text-xl text-ink font-normal" style={{ color: currentLevel.color }}>
              {currentLevel.label}
            </span>
          </div>
        </div>

        {/* 3 stats en ligne */}
        <div className="mt-6 flex flex-col sm:flex-row sm:divide-x sm:divide-sand-line gap-4 sm:gap-0 text-sm text-ink-muted">
          <div className="sm:pr-6">
            <p className="text-[11px] uppercase tracking-wide text-ink-subtle">Maintenant</p>
            <p className="font-serif text-2xl text-ink tabular-nums font-normal">
              {currentPm25.toFixed(1).replace(".", ",")} µg/m³
            </p>
          </div>
          <div className="sm:px-6">
            <p className="text-[11px] uppercase tracking-wide text-ink-subtle">Pic prévu</p>
            <p className="font-serif text-2xl text-ink tabular-nums font-normal">
              {peakPm25.toFixed(1).replace(".", ",")} µg/m³
              {peakItem && (
                <span className="text-sm text-ink-muted font-sans ml-1">à {peakItem.hour}h</span>
              )}
            </p>
          </div>
          <div className="sm:pl-6">
            <p className="text-[11px] uppercase tracking-wide text-ink-subtle">Meilleur moment</p>
            <p className="font-serif text-2xl text-ink tabular-nums font-normal">
              {bestItem ? `${bestItem.hour}h` : "—"}
              {bestItem && (
                <span className="text-sm text-ink-muted font-sans ml-1">
                  · {bestItem.pm25.toFixed(1).replace(".", ",")} µg/m³
                </span>
              )}
            </p>
          </div>
        </div>

        {isHarmattan && (
          <p className="mt-3 text-xs text-ink-muted">
            · Vent de nord-est (Harmattan) — transport de poussière saharienne probable
          </p>
        )}
      </DakarSkyGradient>

      {/* ── Graphique principal ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-xl sm:text-2xl font-normal text-ink">
            Prévision horaire sur 24 heures
          </h1>
          {isSynthetic && (
            <span className="text-[11px] border border-terracotta/40 text-terracotta px-2 py-0.5 tabular-nums">
              Données simulées
            </span>
          )}
        </div>
        <p className="text-sm text-ink-muted max-w-xl">
          Concentrations horaires attendues en PM2.5, basées sur le cycle diurne et le transport par le vent.
        </p>

        {/* Conteneur graphique + légende côte à côte */}
        <div className="flex items-stretch gap-0">
          {/* Graphique */}
          <div className="flex-1 h-64 sm:h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 24, right: 8, left: -20, bottom: 0 }}
              >
                {/* Bandes de niveau colorées */}
                <ReferenceArea y1={0} y2={15} fill="#3F7D58" fillOpacity={0.14} />
                <ReferenceArea y1={15} y2={35} fill="#C99A1E" fillOpacity={0.14} />
                <ReferenceArea y1={35} y2={55} fill="#D2691E" fillOpacity={0.14} />
                <ReferenceArea y1={55} y2={maxVal} fill="#A8372C" fillOpacity={0.14} />

                {/* Marqueur "maintenant" */}
                {chartData.length > 0 && (
                  <ReferenceLine
                    x={nowName}
                    stroke="#1B1F23"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    label={{
                      value: "maintenant",
                      position: "insideTopLeft",
                      fill: "#66645E",
                      fontSize: 10,
                      dy: -4,
                    }}
                  />
                )}

                {/* Marqueur pic */}
                {peakName && (
                  <ReferenceLine
                    x={peakName}
                    stroke="#A8372C"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                    label={{
                      value: `Pic · ${peakItem?.hour}h`,
                      position: "insideTopRight",
                      fill: "#A8372C",
                      fontSize: 10,
                      dy: -4,
                    }}
                  />
                )}

                <XAxis
                  dataKey="name"
                  stroke="#8E8B82"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E4DCCB" }}
                  interval={2}
                />
                <YAxis
                  stroke="#8E8B82"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E4DCCB" }}
                  domain={[0, maxVal]}
                  tickFormatter={(v) => `${v}`}
                  label={{
                    value: "µg/m³",
                    position: "insideTopLeft",
                    offset: 6,
                    fontSize: 10,
                    fill: "#8E8B82",
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value as number;
                      const alert = getAlertLevel(val);
                      return (
                        <div className="bg-sand-surface hairline p-2 text-xs text-ink tabular-nums shadow-sm">
                          <div className="text-ink-muted">{payload[0].payload.name} UTC</div>
                          <div className="font-serif text-sm font-medium mt-0.5">
                            {val.toFixed(1).replace(".", ",")} µg/m³{" "}
                            <span style={{ color: alert.color }}>· {alert.label}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pm25"
                  stroke="#B5532A"
                  strokeWidth={2}
                  fill="#B5532A"
                  fillOpacity={0.09}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Légende droite — hors de Recharts */}
          <ChartLegend />
        </div>

        {/* Note seuils provisoires */}
        <p className="text-[11px] text-ink-subtle leading-relaxed">
          Seuils provisoires (OMS 2021). La correspondance officielle avec l'IQA du CGQA sera mise à jour dès confirmation.
        </p>
      </div>

      {/* ── Curseur de l'heure lié à la scène 3D ── */}
      <div className="p-4 bg-sand-surface hairline space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-xs">
          <span className="text-ink-muted">
            Heure sélectionnée :{" "}
            <strong className="text-ink font-medium tabular-nums">
              +{selectedOffset} h
            </strong>{" "}
            ({currentItem.hour}:00 UTC)
          </span>
          <div className="flex items-center gap-2 tabular-nums">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentLevel.color }}
            />
            <span className="font-medium text-ink">
              {currentItem.pm25.toFixed(1).replace(".", ",")} µg/m³
            </span>
            <span className="text-ink-muted">({currentLevel.label})</span>
            {isHarmattan && (
              <span className="text-terracotta ml-1 font-medium">· Harmattan</span>
            )}
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={hourlyList.length > 0 ? hourlyList.length - 1 : 23}
          value={selectedOffset}
          onChange={(e) => setSelectedOffset(parseInt(e.target.value))}
          className="w-full h-1 bg-sand-line cursor-pointer"
        />

        <div className="text-xs text-ink-muted pt-1 space-y-1 leading-relaxed">
          <p>
            <strong className="text-ink font-medium">Tendance horaire observée :</strong>{" "}
            en début de soirée (vers 19 h–21 h), l'air est généralement le plus chargé, sous l'effet combiné
            du trafic routier et du refroidissement du sol. L'air est le plus respirable vers 3 h–4 h du matin.
          </p>
          <p className="text-[11px] text-ink-subtle">
            * Tendance observée par Mously Sow sur les capteurs de Limamoulaye et Tivaoune Diacksao, présentée comme ordre de grandeur empirique.
          </p>
        </div>
      </div>

      {/* ── Visualisation 3D ── */}
      <div className="h-56 w-full">
        <DakarScene3D
          pm25={currentItem.pm25}
          hour={currentItem.hour}
          windSpeed={currentItem.wind_speed}
          windDeg={currentItem.wind_deg}
          isHarmattan={currentItem.is_harmattan}
        />
      </div>

      {/* ── Tableau heure par heure ── */}
      <div className="pt-4 hairline-t space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowTable(!showTable)}
            className="text-xs text-ink hover:text-terracotta underline underline-offset-4"
          >
            {showTable ? "Masquer le tableau heure par heure" : "Afficher le tableau heure par heure"}
          </button>
          <button onClick={exportCsv} className="text-xs text-ink-muted hover:text-ink">
            Télécharger le CSV
          </button>
        </div>

        {showTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="hairline-b text-ink-muted font-normal">
                  <th className="py-2 pr-4 font-normal">Échéance</th>
                  <th className="py-2 pr-4 font-normal">Heure UTC</th>
                  <th className="py-2 pr-4 font-normal">PM2.5</th>
                  <th className="py-2 pr-4 font-normal">Niveau</th>
                  <th className="py-2 pr-4 font-normal">Vent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-line">
                {hourlyList.map((row: any, idx: number) => {
                  const alert = getAlertLevel(row.pm25);
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedOffset(idx)}
                      className={`cursor-pointer hover:bg-sand-surface ${
                        idx === selectedOffset ? "bg-sand-surface font-medium" : ""
                      }`}
                    >
                      <td className="py-2 pr-4 text-ink-muted">+{row.hour_offset} h</td>
                      <td className="py-2 pr-4">{row.hour}:00</td>
                      <td className="py-2 pr-4 font-medium">
                        {row.pm25.toFixed(1).replace(".", ",")} µg/m³
                      </td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: alert.color }}
                          />
                          <span>{alert.label}</span>
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-ink-muted">{row.wind_speed} m/s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
