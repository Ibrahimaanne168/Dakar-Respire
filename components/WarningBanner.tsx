"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Database, CheckCircle2, ChevronRight } from "lucide-react";

export const WarningBanner: React.FC = () => {
  const [isSynthetic, setIsSynthetic] = useState<boolean>(true);
  const [hasCustomCsv, setHasCustomCsv] = useState<boolean>(false);

  useEffect(() => {
    // Vérifier si un CSV propre de Papa Samb a été injecté dans le localStorage
    const saved = localStorage.getItem("dakarrespire:v1:custom_prediction");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.synthetic) {
          setIsSynthetic(false);
          setHasCustomCsv(true);
        }
      } catch (e) {}
    }
  }, []);

  if (!isSynthetic) {
    return (
      <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-200 px-4 py-2 text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Mode Données Réelles Actif :</strong> Prévisions basées sur le jeu de données importé (in situ + satellite).
            </span>
          </div>
          <Link
            href="/donnees"
            className="flex items-center gap-1 text-emerald-300 hover:text-white underline underline-offset-2 shrink-0 text-xs"
          >
            Gérer les données <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/85 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 text-xs sm:text-sm font-medium shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <div>
            <strong className="text-amber-300">Avertissement Scientifique & Démonstration :</strong>{" "}
            Ces prévisions s'appuient sur un modèle entraîné sur des données calibrées simulant Dakar. Les séries réelles consolidées sol + satellite (livrables de Papa Ibrahima Samb & Mously Sow) s'intègrent instantanément.
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Link
            href="/donnees"
            className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white px-2.5 py-1 rounded-md border border-amber-500/40 text-xs transition"
          >
            <Database className="w-3 h-3" />
            Déposer le CSV Papa Samb
          </Link>
        </div>
      </div>
    </div>
  );
};
