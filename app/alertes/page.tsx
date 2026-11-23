"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Sliders,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Heart,
  Baby,
  Activity,
  Trees,
} from "lucide-react";
import { ALERT_LEVELS, AlertLevel } from "@/lib/config";

export default function AlertesPage() {
  const [bonMax, setBonMax] = useState<number>(15);
  const [moyenMax, setMoyenMax] = useState<number>(35);
  const [mauvaisMax, setMauvaisMax] = useState<number>(55);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Charger les seuils enregistrés
  useEffect(() => {
    const saved = localStorage.getItem("dakarrespire:v1:custom_thresholds");
    if (saved) {
      try {
        const t = JSON.parse(saved);
        if (t.bon) setBonMax(t.bon);
        if (t.moyen) setMoyenMax(t.moyen);
        if (t.mauvais) setMauvaisMax(t.mauvais);
      } catch (e) {}
    }
  }, []);

  const saveThresholds = () => {
    const t = { bon: bonMax, moyen: moyenMax, mauvais: mauvaisMax };
    localStorage.setItem("dakarrespire:v1:custom_thresholds", JSON.stringify(t));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const resetThresholds = () => {
    setBonMax(15);
    setMoyenMax(35);
    setMauvaisMax(55);
    localStorage.removeItem("dakarrespire:v1:custom_thresholds");
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const healthGuides = [
    {
      group: "Enfants & Nourrissons",
      icon: Baby,
      color: "text-amber-400",
      advice:
        "Fréquence respiratoire plus rapide et alvéoles pulmonaires immatures. Éviter les récréations extérieures lors des dépassements de 35 µg/m³.",
    },
    {
      group: "Personnes Asthmatiques & Insuffisants Respiratoires",
      icon: Heart,
      color: "text-red-400",
      advice:
        "Garder les traitements bronchodilatateurs à portée de main. En cas de brume sèche saharienne (> 55 µg/m³), rester à domicile et fermer les ouvertures.",
    },
    {
      group: "Sportifs & Travailleurs en Extérieur",
      icon: Activity,
      color: "text-cyan-400",
      advice:
        "La ventilation pulmonaire décuple durant l'effort physique. Déplacer les entraînements tôt le matin (06h-08h) où les PM2.5 sont les plus basses.",
    },
    {
      group: "Population Générale",
      icon: Trees,
      color: "text-emerald-400",
      advice:
        "Privilégier le port du masque filtrant (type FFP2 ou chirurgical) lors des épisodes d'Harmattan intense pour limiter l'irritation des voies aériennes.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <div className="text-xs uppercase font-bold tracking-widest text-teal-400 mb-1">
          Santé Publique & Réglementation
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Seuils d'Alerte Sanitaire & Recommandations
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Standards officiels de la qualité de l'air du Centre de Gestion de la Qualité de l'Air (CGQA Dakar) et lignes directrices de l'Organisation Mondiale de la Santé (OMS).
        </p>
      </div>

      {/* Grille des 4 Paliers Officiels CGQA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ALERT_LEVELS).map(([key, lvl]) => (
          <div
            key={key}
            className="glass-panel p-5 rounded-2xl border flex flex-col justify-between"
            style={{ borderColor: `${lvl.color}40`, backgroundColor: `${lvl.color}08` }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: lvl.color, boxShadow: `0 0 10px ${lvl.color}` }}
                />
                <span className="text-xs font-bold text-slate-400">IQA {lvl.iqaRange}</span>
              </div>
              <h3 className="text-lg font-black text-white">{lvl.label}</h3>
              <div className="text-xs font-semibold my-1" style={{ color: lvl.color }}>
                {lvl.min} à {lvl.max === 1000 ? "+∞" : `${lvl.max} µg/m³`}
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{lvl.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              {lvl.recommandation}
            </div>
          </div>
        ))}
      </div>

      {/* Simulateur de Seuils Personnalisés */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-400" />
              Configurateur de Seuils d'Alerte Personnalisés
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ajustez les seuils de déclenchement selon les besoins d'établissements spécifiques (ex. crèches, cliniques ou écoles).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetThresholds}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Par défaut
            </button>
            <button
              onClick={saveThresholds}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Enregistrer
            </button>
          </div>
        </div>

        {isSaved && (
          <div className="p-3 rounded-lg bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs">
            Seuils sanitaires mis à jour et persistés dans le navigateur !
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-emerald-400">Seuil Bon / Moyen :</span>
              <span className="font-bold text-white">{bonMax} µg/m³</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              value={bonMax}
              onChange={(e) => setBonMax(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Recommandation OMS : 15 µg/m³ sur 24h.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-amber-400">Seuil Moyen / Mauvais :</span>
              <span className="font-bold text-white">{moyenMax} µg/m³</span>
            </div>
            <input
              type="range"
              min={25}
              max={45}
              value={moyenMax}
              onChange={(e) => setMoyenMax(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Alerte précoce pour personnes vulnérables.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-red-400">Seuil Mauvais / Très Mauvais :</span>
              <span className="font-bold text-white">{mauvaisMax} µg/m³</span>
            </div>
            <input
              type="range"
              min={45}
              max={75}
              value={mauvaisMax}
              onChange={(e) => setMauvaisMax(parseInt(e.target.value))}
              className="w-full accent-red-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Seuil officiel CGQA Dakar : 55 µg/m³.</p>
          </div>
        </div>
      </div>

      {/* Guide Sanitaire par Population Vulnérable */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-6">
          Directives Sanitaires Adaptées aux Groupes de Population
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthGuides.map((guide, i) => {
            const Icon = guide.icon;
            return (
              <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${guide.color}`} />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-200">{guide.group}</h4>
                  <p className="text-slate-400 leading-relaxed">{guide.advice}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
