"use client";

import React, { useState, useEffect } from "react";
import { ALERT_LEVELS } from "@/lib/config";

export default function AlertesPage() {
  const [bonMax, setBonMax] = useState<number>(15);
  const [moyenMax, setMoyenMax] = useState<number>(35);
  const [mauvaisMax, setMauvaisMax] = useState<number>(55);
  const [savedMessage, setSavedMessage] = useState<string>("");

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
    localStorage.setItem(
      "dakarrespire:v1:custom_thresholds",
      JSON.stringify({ bon: bonMax, moyen: moyenMax, mauvais: mauvaisMax })
    );
    setSavedMessage("Seuils personnalisés enregistrés.");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const resetThresholds = () => {
    setBonMax(15);
    setMoyenMax(35);
    setMauvaisMax(55);
    localStorage.removeItem("dakarrespire:v1:custom_thresholds");
    setSavedMessage("Seuils par défaut rétablis.");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const levelsList = [
    {
      name: "Bon",
      color: ALERT_LEVELS.BON.color,
      range: "0 à 15 µg/m³",
      advice: "Qualité de l'air satisfaisante. Activités extérieures libres pour tous.",
    },
    {
      name: "Moyen",
      color: ALERT_LEVELS.MOYEN.color,
      range: "15 à 35 µg/m³",
      advice: "Les personnes sensibles (enfants, personnes asthmatiques) peuvent modérer les efforts intenses prolongés.",
    },
    {
      name: "Mauvais",
      color: ALERT_LEVELS.MAUVAIS.color,
      range: "35 à 55 µg/m³",
      advice: "Réduire les activités sportives extérieures. Port du masque conseillé pour les personnes vulnérables.",
    },
    {
      name: "Très mauvais",
      color: ALERT_LEVELS.TRES_MAUVAIS.color,
      range: "Plus de 55 µg/m³",
      advice: "Fermer les ouvertures et limiter les sorties, particulièrement en période de brume de poussière saharienne.",
    },
  ];

  return (
    <div className="space-y-12 max-w-2xl">
      {/* En-tête */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-ink">
          Seuils et recommandations
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Repères sanitaires officiels du Centre de Gestion de la Qualité de l'Air (CGQA Dakar) et de l'Organisation Mondiale de la Santé (OMS).
        </p>
      </div>

      {/* Liste verticale lisible */}
      <div className="space-y-4">
        <ul className="divide-y divide-sand-line hairline-t hairline-b">
          {levelsList.map((lvl, i) => (
            <li key={i} className="py-4 space-y-1">
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: lvl.color }}
                  />
                  <span className="font-serif text-lg text-ink font-normal">{lvl.name}</span>
                </div>
                <span className="text-xs text-ink-muted tabular-nums">{lvl.range}</span>
              </div>
              <p className="text-xs text-ink-muted pl-4 leading-relaxed">
                {lvl.advice}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Panneau simple de réglage des seuils */}
      <div className="p-6 bg-sand-surface hairline space-y-4">
        <div>
          <h2 className="font-serif text-lg text-ink font-normal">
            Ajuster les seuils d'alerte
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Utile pour définir des seuils plus stricts adaptés à un établissement particulier (maternité, école, centre sportif).
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-ink mb-1">
              <span>Seuil Bon / Moyen :</span>
              <strong className="tabular-nums">{bonMax} µg/m³</strong>
            </div>
            <input
              type="range"
              min={10}
              max={25}
              value={bonMax}
              onChange={(e) => setBonMax(parseInt(e.target.value))}
              className="w-full h-1 bg-sand-line cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-ink mb-1">
              <span>Seuil Moyen / Mauvais :</span>
              <strong className="tabular-nums">{moyenMax} µg/m³</strong>
            </div>
            <input
              type="range"
              min={25}
              max={45}
              value={moyenMax}
              onChange={(e) => setMoyenMax(parseInt(e.target.value))}
              className="w-full h-1 bg-sand-line cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-ink mb-1">
              <span>Seuil Mauvais / Très mauvais :</span>
              <strong className="tabular-nums">{mauvaisMax} µg/m³</strong>
            </div>
            <input
              type="range"
              min={45}
              max={70}
              value={mauvaisMax}
              onChange={(e) => setMauvaisMax(parseInt(e.target.value))}
              className="w-full h-1 bg-sand-line cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 hairline-t text-xs">
          <button
            onClick={saveThresholds}
            className="bg-terracotta hover:bg-terracotta-hover text-sand-surface px-4 py-2 font-medium transition-colors"
          >
            Enregistrer
          </button>
          <button
            onClick={resetThresholds}
            className="text-ink-muted hover:text-ink underline"
          >
            Rétablir
          </button>
          {savedMessage && <span className="text-level-bon">{savedMessage}</span>}
        </div>
      </div>
    </div>
  );
}
