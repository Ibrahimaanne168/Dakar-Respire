"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Wind,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
  Thermometer,
  Droplets,
  Layers,
  Sparkles,
} from "lucide-react";
import { AlertBadge } from "@/components/AlertBadge";
import { getAlertLevel, DAKAR_COORDINATES } from "@/lib/config";

// Chargement dynamique de la scène 3D sans SSR
const DakarScene3D = dynamic(() => import("@/components/DakarScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-900/60 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 animate-pulse">
      Initialisation de la scène 3D Dakar...
    </div>
  ),
});

export default function HomePage() {
  const [forecastData, setForecastData] = useState<any>(null);
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Vérifier si un CSV personnalisé existe
    const custom = localStorage.getItem("dakarrespire:v1:custom_prediction");
    if (custom) {
      try {
        setForecastData(JSON.parse(custom));
        setLoading(false);
        return;
      } catch (e) {}
    }

    // Sinon charger le forecast standard
    fetch("/model/forecast.json")
      .then((res) => res.json())
      .then((data) => {
        setForecastData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement prévisions:", err);
        setLoading(false);
      });
  }, []);

  const currentHourData = forecastData?.hourly?.[selectedHourOffset] || {
    pm25: 31.2,
    hour: 14,
    wind_speed: 4.8,
    wind_deg: 45,
    is_harmattan: true,
    temp_c: 24.5,
  };

  const currentPm25 = forecastData?.current_pm25 ?? 31.2;
  const peakPm25 = forecastData?.peak_pm25 ?? 44.7;
  const meanPm25 = forecastData?.mean_pm25 ?? 30.8;
  const currentLevel = getAlertLevel(currentHourData.pm25);

  return (
    <div className="space-y-8">
      {/* Hero Section avec Scène 3D & Statut Actuel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Colonne Gauche : Synthèse & Valeurs Clés */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Artificielle • Prévision 24H
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Qualité de l'air sur la Presqu'île de Dakar
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Anticipation horaire des concentrations de particules fines (PM2.5) par couplage de données satellitaires et réanalyses météorologiques.
            </p>
          </div>

          {/* Carte PM2.5 Principale */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div
              className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: currentLevel.color }}
            />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {selectedHourOffset === 0 ? "Indicateur Actuel (H+0)" : `Prévision H+${selectedHourOffset}`}
              </span>
              <AlertBadge pm25={currentHourData.pm25} showIqa size="md" />
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-5xl sm:text-6xl font-black tracking-tight" style={{ color: currentLevel.color }}>
                {currentHourData.pm25}
              </span>
              <span className="text-slate-400 text-lg font-medium">µg/m³</span>
            </div>

            <p className="text-xs text-slate-300 mt-2 font-medium">
              {currentLevel.description}
            </p>

            {/* Météo & Vent instantanés */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Wind className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500">Vent</div>
                  <div className="font-semibold">{currentHourData.wind_speed} m/s</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500">Direction</div>
                  <div className="font-semibold">{currentHourData.wind_deg}° (NE)</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500">Temp.</div>
                  <div className="font-semibold">{currentHourData.temp_c || 24}°C</div>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action rapide */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/previsions"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
            >
              Consulter la courbe 24h
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/modeles"
              className="inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-3 rounded-xl border border-slate-700/80 transition"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              Scores IA
            </Link>
          </div>
        </div>

        {/* Colonne Droite : Visualiseur 3D Interactif */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="h-[420px] w-full">
            <DakarScene3D
              pm25={currentHourData.pm25}
              hour={currentHourData.hour}
              windSpeed={currentHourData.wind_speed}
              windDeg={currentHourData.wind_deg}
              isHarmattan={currentHourData.is_harmattan}
            />
          </div>

          {/* Slider temporel rapide sous la 3D */}
          <div className="glass-panel px-4 py-3 rounded-xl border border-slate-800 flex items-center gap-4 text-xs">
            <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              Glissière 24h :
            </span>
            <input
              type="range"
              min={0}
              max={23}
              value={selectedHourOffset}
              onChange={(e) => setSelectedHourOffset(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <span className="text-teal-300 font-bold shrink-0 w-12 text-right">
              +{selectedHourOffset} h
            </span>
          </div>
        </div>
      </section>

      {/* Résumé Prévisionnel 24 Heures : 3 Indicateurs Clés */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Moyenne 24h prévue</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">{meanPm25} <span className="text-xs text-slate-400 font-normal">µg/m³</span></div>
          <p className="text-xs text-slate-400 mt-2">
            Niveau moyen globalement stable sur la journée.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pic maximal anticipé</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{peakPm25} <span className="text-xs text-slate-400 font-normal">µg/m³</span></div>
          <p className="text-xs text-slate-400 mt-2">
            Pic attendu en soirée vers 20h UTC sous l'effet du trafic et du reflux de l'inversion thermique.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Régime de vent dominant</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">Harmattan (NE)</div>
          <p className="text-xs text-slate-400 mt-2">
            Vents continentaux de secteur Nord-Est véhiculant des poussières sahariennes minérales.
          </p>
        </div>
      </section>

      {/* Présentation concise du projet & Cadre de concours */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-2">
            Une réponse mathématique & open-source au défi de la qualité de l'air
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Dakar subit régulièrement des épisodes critiques de poussières désertiques et d'émissions urbaines. Avec un réseau de stations au sol restreint, <strong>Dakar Respire</strong> exploite la complémentarité des satellites d'observation de la Terre (Copernicus CAMS, Sentinel-5P) et des réanalyses météorologiques (NASA POWER) pour modéliser le comportement des particules fines sans nécessiter de coûteux réseaux de capteurs physiques.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> Seuil OMS PM2.5 : 15 µg/m³ (24h)
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Alerte CGQA Dakar : &gt; 55 µg/m³
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Horizon prédictif : 24 heures glissantes
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
