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

const DakarScene3D = dynamic(() => import("@/components/DakarScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-sand-surface hairline flex items-center justify-center text-xs text-ink-muted">
      Vue de Dakar…
    </div>
  ),
});

export default function PrevisionsPage() {
  const [data, setData] = useState<any>(null);
  const [selectedOffset, setSelectedOffset] = useState<number>(0);
  const [showTable, setShowTable] = useState<boolean>(false);

  useEffect(() => {
    const custom = localStorage.getItem("dakarrespire:v1:custom_prediction");
    if (custom) {
      try {
        setData(JSON.parse(custom));
        return;
      } catch (e) {}
    }
    fetch("/model/forecast.json")
      .then((res) => res.json())
      .then((d) => setData(d))
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

  const chartData = hourlyList.map((item: any) => ({
    name: `${item.hour} h`,
    offset: item.hour_offset,
    pm25: item.pm25,
    wind: item.wind_speed,
  }));

  const maxVal = Math.max(65, ...hourlyList.map((h: any) => h.pm25));

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
    link.setAttribute("download", `previsions_dakar_24h.csv`);
    link.click();
  };

  const currentLevel = getAlertLevel(currentItem.pm25);
  const isHarmattan = currentItem.is_harmattan || (currentItem.wind_deg >= 20 && currentItem.wind_deg <= 80);

  return (
    <div className="space-y-12">
      {/* En-tête sobre */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-ink">
          Prévision horaire sur 24 heures
        </h1>
        <p className="mt-2 text-sm text-ink-muted max-w-xl">
          Concentrations horaires attendues en PM2.5, basées sur le cycle diurne et le transport par le vent.
        </p>
      </div>

      {/* La courbe en héros */}
      <div className="space-y-4">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 10, left: -24, bottom: 0 }}>
              {/* Bandes très pâles d'arrière-plan pour les niveaux officiels IQA du CGQA */}
              <ReferenceArea y1={0} y2={15} fill="#3F7D58" fillOpacity={0.06} />
              <ReferenceArea y1={15} y2={35} fill="#C99A1E" fillOpacity={0.06} />
              <ReferenceArea y1={35} y2={55} fill="#D2691E" fillOpacity={0.06} />
              <ReferenceArea y1={55} y2={maxVal} fill="#A8372C" fillOpacity={0.06} />

              {/* Lignes fines avec étiquettes directes sur le graphique */}
              <ReferenceLine y={15} stroke="#3F7D58" strokeWidth={1} strokeDasharray="3 3" label={{ value: "Bon (IQA ≤ 50)", fill: "#3F7D58", fontSize: 11, position: "insideTopRight" }} />
              <ReferenceLine y={35} stroke="#C99A1E" strokeWidth={1} strokeDasharray="3 3" label={{ value: "Moyen (IQA ≤ 100)", fill: "#C99A1E", fontSize: 11, position: "insideTopRight" }} />
              <ReferenceLine y={55} stroke="#D2691E" strokeWidth={1} strokeDasharray="3 3" label={{ value: "Alerte CGQA (IQA > 100)", fill: "#D2691E", fontSize: 11, position: "insideTopRight" }} />

              <XAxis dataKey="name" stroke="#8E8B82" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#E4DCCB" }} />
              <YAxis stroke="#8E8B82" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#E4DCCB" }} unit=" µg" domain={[0, maxVal]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value as number;
                    const alert = getAlertLevel(val);
                    return (
                      <div className="bg-sand-surface hairline p-2 text-xs text-ink tabular-nums shadow-sm">
                        <div className="text-ink-muted">{payload[0].payload.name} UTC</div>
                        <div className="font-serif text-sm font-medium mt-0.5">
                          {val.toFixed(1).replace(".", ",")} µg/m³ · <span style={{ color: alert.color }}>{alert.label}</span>
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
                strokeWidth={1.8}
                fill="#B5532A"
                fillOpacity={0.07}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Curseur de l'heure lié à la scène 3D */}
        <div className="p-4 bg-sand-surface hairline space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-xs">
            <span className="text-ink-muted">
              Heure sélectionnée : <strong className="text-ink font-medium tabular-nums">+{selectedOffset} h</strong> ({currentItem.hour}:00 UTC)
            </span>
            <div className="flex items-center gap-2 tabular-nums">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentLevel.color }} />
              <span className="font-medium text-ink">{currentItem.pm25.toFixed(1).replace(".", ",")} µg/m³</span>
              <span className="text-ink-muted">({currentLevel.label})</span>
              {isHarmattan && (
                <span className="text-terracotta ml-1 font-medium">· Vent de nord-est (Harmattan)</span>
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

          {/* Conseil horaire fondé sur le profil de Mously */}
          <div className="text-xs text-ink-muted pt-1 space-y-1 leading-relaxed">
            <p>
              <strong className="text-ink font-medium">Tendance horaire observée :</strong> en début de soirée (vers 19 h–21 h), l'air est généralement le plus chargé, sous l'effet combiné du trafic routier et du refroidissement du sol qui plaque les polluants près de la surface. À l'inverse, l'air est le plus respirable en fin de nuit vers 3 h–4 h du matin.
            </p>
            <p className="text-[11px] text-ink-subtle">
              * Tendance observée par Mously Sow sur les capteurs de Limamoulaye et Tivaoune Diacksao, présentée comme ordre de grandeur empirique.
            </p>
          </div>
        </div>
      </div>

      {/* Visualisation 3D sobre */}
      <div className="h-56 w-full">
        <DakarScene3D
          pm25={currentItem.pm25}
          hour={currentItem.hour}
          windSpeed={currentItem.wind_speed}
          windDeg={currentItem.wind_deg}
          isHarmattan={currentItem.is_harmattan}
        />
      </div>

      {/* Tableau heure par heure replié par défaut */}
      <div className="pt-4 hairline-t space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowTable(!showTable)}
            className="text-xs text-ink hover:text-terracotta underline underline-offset-4"
          >
            {showTable ? "Masquer le tableau heure par heure" : "Afficher le tableau heure par heure"}
          </button>
          <button
            onClick={exportCsv}
            className="text-xs text-ink-muted hover:text-ink"
          >
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
                  <th className="py-2 pr-4 font-normal">Niveau IQA</th>
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
                      <td className="py-2 pr-4 font-medium">{row.pm25.toFixed(1).replace(".", ",")} µg/m³</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: alert.color }} />
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
