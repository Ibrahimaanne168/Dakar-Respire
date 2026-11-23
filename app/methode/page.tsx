"use client";

import React from "react";
import {
  BookOpen,
  AlertTriangle,
  Compass,
  Database,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  FileText,
} from "lucide-react";
import { SCIENTIFIC_LIMITS } from "@/lib/config";

export default function MethodePage() {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <div className="text-xs uppercase font-bold tracking-widest text-teal-400 mb-1">
          Rigueur Scientifique & Modélisation
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Méthodologie, Sources & Limites Physiques
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Documentation approfondie des hypothèses physiques, du transport atmosphérique et de l'encadrement critique des données satellitaires.
        </p>
      </div>

      {/* 4 Limites Scientifiques Majeures (Règle d'or de l'équipe) */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-amber-500/30 bg-amber-950/15 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base">
          <AlertTriangle className="w-5 h-5" />
          Règle Fondamentale : Les Satellites ne Mesurent Pas les PM2.5 au Sol
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Pour garantir une démarche scientifique irréprochable face au jury du concours, nous rappelons les 4 verrous méthodologiques fondamentaux pris en compte dans le projet :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {SCIENTIFIC_LIMITS.map((limit, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] shrink-0">
                  {i + 1}
                </span>
                {limit.title}
              </h4>
              <p className="text-slate-400 leading-relaxed">{limit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamique Atmosphérique de la Presqu'île de Dakar */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-teal-400" />
          Dynamique Aérologique & Géographie Particulière de Dakar
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Dakar est une presqu'île triangulaire s'avançant de 30 km dans l'océan Atlantique. Cette configuration crée un micro-climat dynamique sous l'influence de deux forces antagonistes :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-teal-300">1. L'Harmattan (Flux Continental d'Est / Nord-Est)</h4>
            <p className="text-slate-400 leading-relaxed">
              Vent chaud, sec et turbulent originaire du Sahara. Il transporte d'importantes masses de poussières minérales qui provoquent des pics soudains de PM2.5 et PM10 (&gt; 150 µg/m³), réduisant la visibilité horizontale à moins de 2 kilomètres.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300">2. L'Alizé Maritime & la Brise de Mer (Flux Ouest / Nord-Ouest)</h4>
            <p className="text-slate-400 leading-relaxed">
              Vent frais et humide océanique qui ventile la côte et disperse temporairement les polluants urbains vers l'intérieur des terres, tout en induisant une forte humidité relative (&gt; 80%) sur les quartiers côtiers (Almadies, Yoff).
            </p>
          </div>
        </div>
      </div>

      {/* Inventaire des Sources de Données */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-400" />
          Sources de Données Open-Source
        </h3>

        <div className="space-y-3 text-xs">
          {[
            {
              title: "Copernicus Atmosphere Monitoring Service (CAMS)",
              provider: "Union Européenne / ECMWF",
              vars: "AOD (Aerosol Optical Depth 550nm), prévisions de poussières désertiques",
              role: "Indicateur spatial de charge d'aérosols dans la colonne d'air",
            },
            {
              title: "NASA POWER (Prediction of Worldwide Energy Resources)",
              provider: "NASA Langley Research Center",
              vars: "T2M (température à 2m), WS10M (vitesse du vent), WD10M (direction), RH2M (humidité relative)",
              role: "Réanalyse physique météorologique horaire ininterrompue",
            },
            {
              title: "Sentinel-5P (TROPOMI)",
              provider: "Agence Spatiale Européenne (ESA)",
              vars: "Colonnes totales de NO2, SO2, CO, indice d'aérosol absorbant UVAI",
              role: "Détection des traceurs de combustion urbaine et industrielle",
            },
            {
              title: "Centre de Gestion de la Qualité de l'Air (CGQA Dakar)",
              provider: "Direction de l'Environnement et des Établissements Classés (DEEC)",
              vars: "Concentrations in situ en surface de PM2.5 et PM10",
              role: "Vérité terrain pour l'entraînement et l'étalonnage des modèles supervisés",
            },
          ].map((src, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-200">
                <span className="font-bold text-teal-300">{src.title}</span>
                <span className="text-slate-500 text-[11px]">{src.provider}</span>
              </div>
              <p className="text-slate-400">
                <strong>Variables :</strong> {src.vars}
              </p>
              <p className="text-slate-400">
                <strong>Rôle dans le pipeline :</strong> {src.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Espace Réservé pour la Revue Scientifique de Sayon Sidibé */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-teal-500/30 bg-teal-950/10 space-y-3">
        <h3 className="text-base font-bold text-teal-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-400" />
          Section Bibliographie & Références Scientifiques (Sayon Sidibé)
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Cette section accueille les travaux de synthèse de <strong>Sayon Sidibé</strong> dès leur validation :
        </p>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>
            Étude de référence CatBoost sur la qualité de l'air à Dakar (R² = 0,931 ; RMSE = 11,50 µg/m³).
          </li>
          <li>
            Mécanismes photochimiques de formation des particules secondaires en milieu sahélien côtier.
          </li>
          <li>
            Normes sénégalaises NS 05-062 sur la pollution atmosphérique versus directives globales OMS 2021.
          </li>
        </ul>
      </div>
    </div>
  );
}
