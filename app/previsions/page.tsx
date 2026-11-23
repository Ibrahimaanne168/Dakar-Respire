"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Clock,
  Wind,
  Download,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  Filter,
} from "lucide-react";
import { AlertBadge } from "@/components/AlertBadge";
import { getAlertLevel, ALERT_LEVELS } from "@/lib/config";

const DakarScene3D = dynamic(() => import("@/components/DakarScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 text-slate-500 text-sm">
      Chargement du modèle 3D...
    </div>
  ),
});

export default function PrevisionsPage() {
  const [data, setData] = useState<any>(null);
  const [selectedOffset, setSelectedOffset] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<string>("hist_gradient_boosting");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    // Vérifier les données personnalisées
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
      .catch((err) => console.error(err));
  }, []);

  const hourlyList = data?.hourly || [];
  const currentItem = hourlyList[selectedOffset] || {
    hour: 14,
    pm25: 31.2,
    wind_speed: 4.8,
    wind_deg: 45,
    is_harmattan: true,
    temp_c: 24.5,
    label: "Moyen",
    color: "#FBBF24",
  };

  const chartData = hourlyList.map((item: any) => ({
    name: `${item.hour.toString().padStart(2, "0")}h`,
    offset: item.hour_offset,
    pm25: item.pm25,
    wind: item.wind_speed,
    harmattan: item.is_harmattan,
  }));

  // Export CSV de la prévision
  const exportCsv = () => {
    setIsExporting(true);
    const headers = "offset,heure_utc,pm25_ug_m3,niveau,vent_vitesse_ms,direction_deg,harmattan\n";
    const rows = hourlyList
      .map(
        (h: any) =>
          `${h.hour_offset},${h.hour}:00,${h.pm25},${h.label},${h.wind_speed},${h.wind_deg},${h.is_harmattan}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `previsions_dakar_24h_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  return (
    <div className="space-y-8">
      {/* En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-widest text-teal-400 mb-1">
            Projection Temporelle • Dakar & Banlieue
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Prévisions Horaires des PM2.5 (24 Heures)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Évolution anticipée heure par heure selon le cycle diurne et le transport des poussières sahariennes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-teal-400" />
            Exporter CSV 24h
          </button>
        </div>
      </div>

      {/* Graphique Interactif Principal */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">
              Courbe Prévisionnelle & Seuils Sanitaires CGQA
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Bon (≤ 15)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moyen (15-35)
            </span>
            <span className="flex items-center gap-1.5 text-orange-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Mauvais (35-55)
            </span>
            <span className="flex items-center gap-1.5 text-red-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Alerte (&gt; 55)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" µg" domain={[0, "auto"]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value as number;
                    const alert = getAlertLevel(val);
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs shadow-lg">
                        <div className="font-semibold text-slate-200">{payload[0].payload.name} UTC</div>
                        <div className="text-sm font-bold my-1" style={{ color: alert.color }}>
                          {val} µg/m³ • {alert.label}
                        </div>
                        <div className="text-slate-400">
                          Vent : {payload[0].payload.wind} m/s
                          {payload[0].payload.harmattan ? " (Harmattan)" : ""}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Lignes de référence des seuils CGQA */}
              <ReferenceLine y={15} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Seuil OMS (15)", fill: "#10b981", fontSize: 10, position: "insideTopRight" }} />
              <ReferenceLine y={35} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: "Seuil Moyen (35)", fill: "#fbbf24", fontSize: 10, position: "insideTopRight" }} />
              <ReferenceLine y={55} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Alerte CGQA (55)", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }} />
              <Area
                type="monotone"
                dataKey="pm25"
                stroke="#14b8a6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#pmGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Contrôleur glissière temporelle */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              Sélectionner une heure : H+{selectedOffset} ({currentItem.hour}:00 UTC)
            </span>
            <AlertBadge pm25={currentItem.pm25} size="sm" />
          </div>
          <input
            type="range"
            min={0}
            max={hourlyList.length > 0 ? hourlyList.length - 1 : 23}
            value={selectedOffset}
            onChange={(e) => setSelectedOffset(parseInt(e.target.value))}
            className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Maintenant (H+0)</span>
            <span>+6h</span>
            <span>+12h (Midi)</span>
            <span>+18h (Soir)</span>
            <span>+24h</span>
          </div>
        </div>
      </div>

      {/* Détail de l'heure sélectionnée avec Visualiseur 3D synchrone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">
              Inspection Détaillée à H+{selectedOffset}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              Conditions à {currentItem.hour}:00 UTC
            </h3>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-extrabold" style={{ color: currentItem.color || "#14b8a6" }}>
                {currentItem.pm25}
              </span>
              <span className="text-slate-400 font-medium">µg/m³ PM2.5</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-teal-400">Diagnostic Sanitaire :</span>{" "}
                {getAlertLevel(currentItem.pm25).description}
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-teal-400">Recommandation :</span>{" "}
                {getAlertLevel(currentItem.pm25).recommandation}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Vitesse vent</span>
              <span className="font-bold text-slate-200">{currentItem.wind_speed} m/s</span>
            </div>
            <div>
              <span className="text-slate-500 block">Direction</span>
              <span className="font-bold text-slate-200">{currentItem.wind_deg}° (NE)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Harmattan</span>
              <span className="font-bold text-amber-400">
                {currentItem.is_harmattan ? "Actif (Poussières)" : "Inactif"}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 h-[340px]">
          <DakarScene3D
            pm25={currentItem.pm25}
            hour={currentItem.hour}
            windSpeed={currentItem.wind_speed}
            windDeg={currentItem.wind_deg}
            isHarmattan={currentItem.is_harmattan}
          />
        </div>
      </div>

      {/* Tableau Heure par Heure */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">
          Tableau Prévisionnel Exhaustif (24 Heures)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Échéance</th>
                <th className="py-3 px-3">Heure UTC</th>
                <th className="py-3 px-3">Concentration PM2.5</th>
                <th className="py-3 px-3">Niveau CGQA</th>
                <th className="py-3 px-3">Vent (m/s)</th>
                <th className="py-3 px-3">Harmattan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {hourlyList.map((row: any, idx: number) => {
                const isSelected = idx === selectedOffset;
                const alert = getAlertLevel(row.pm25);
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedOffset(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-teal-500/10 text-white font-medium" : "hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-teal-400">+{row.hour_offset} h</td>
                    <td className="py-2.5 px-3">{row.hour}:00</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: alert.color }}>
                      {row.pm25} µg/m³
                    </td>
                    <td className="py-2.5 px-3">
                      <AlertBadge pm25={row.pm25} size="sm" />
                    </td>
                    <td className="py-2.5 px-3">
                      {row.wind_speed} m/s ({row.wind_deg}°)
                    </td>
                    <td className="py-2.5 px-3">
                      {row.is_harmattan ? (
                        <span className="text-amber-400 font-semibold">Oui</span>
                      ) : (
                        <span className="text-slate-500">Non</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
