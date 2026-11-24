"use client";

import React, { useState, useEffect } from "react";
import { COVERAGE_TIMELINE, SOURCES_STATE_TABLE } from "@/lib/dashboardData";
import { runInBrowserInference, PredictionResult } from "@/lib/clientPredictor";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import BottomSheet from "@/components/BottomSheet";
import { UploadCloud, FileText, AlertTriangle, CheckCircle, HelpCircle, Database } from "lucide-react";

export default function DataSection() {
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "valid" | "error" | "saved">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [report, setReport] = useState<any>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [formatSheetOpen, setFormatSheetOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("dakarrespire:v1:custom_prediction");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPrediction(parsed);
        setUploadStatus("saved");
      } catch (e) {}
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      validateCsv(text);
    };
    reader.readAsText(file);
  };

  const validateCsv = (text: string) => {
    try {
      const lines = text.trim().split("\n");
      if (lines.length < 5) throw new Error("Le fichier contient moins de 5 lignes.");

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const hasPm25 = headers.some((h) => h.includes("pm25") || h.includes("pm2.5"));

      if (!hasPm25) {
        throw new Error("Colonne obligatoire 'pm25' (ou 'pm2.5') introuvable.");
      }

      let missingCount = 0;
      const pm25Idx = headers.findIndex((h) => h.includes("pm25") || h.includes("pm2.5"));

      for (let i = 1; i < lines.length; i++) {
        const val = parseFloat(lines[i].split(",")[pm25Idx]);
        if (isNaN(val) || val === -999) missingCount++;
      }

      setReport({
        totalRows: lines.length - 1,
        headersFound: headers.slice(0, 8),
        completeness: Math.round(((lines.length - 1 - missingCount) / (lines.length - 1)) * 100),
      });

      const predResult = runInBrowserInference(text, null);
      setPrediction(predResult);
      setUploadStatus("valid");
    } catch (err: any) {
      setUploadStatus("error");
      setErrorMessage(err.message || "Erreur de format du fichier CSV.");
    }
  };

  const applyCustomData = () => {
    if (prediction) {
      localStorage.setItem("dakarrespire:v1:custom_prediction", JSON.stringify(prediction));
      setUploadStatus("saved");
      window.location.reload();
    }
  };

  const resetToDefault = () => {
    localStorage.removeItem("dakarrespire:v1:custom_prediction");
    setPrediction(null);
    setUploadStatus("idle");
    setReport(null);
    setFileName("");
    window.location.reload();
  };

  return (
    <section id="donnees" className="space-y-4 pt-4">
      {/* ── 1. Frise de couverture en barres empilées & Alerte chronologique ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex flex-col gap-1 pb-3 border-b border-sand-line/60">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
              Section ⑤ · Données & Flux
            </span>
            <StatusBadge status="Modèle" size="sm" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal">
            Couverture temporelle des sources
          </h2>
          <p className="text-xs text-ink-muted">
            Inventaire de l'historique reçu (2019–2026)
          </p>
        </div>

        {/* Note rouge sobre mise en valeur */}
        <div className="p-3.5 rounded-[12px] bg-[#FDF0EC] border border-[#A8372C]/30 text-xs text-[#A8372C] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-medium">
              Aucune période commune entre la météo documentée et les PM2.5 mesurés
            </strong>
            <p className="text-[11px] leading-relaxed text-[#A8372C]/90">
              La météo s'arrête au 31/12/2024 et les capteurs au sol débutent le 17/11/2025. La démonstration utilise donc une réanalyse météo calibrée pour synchroniser l'ensemble.
            </p>
          </div>
        </div>

        {/* Barres horizontales de couverture empilées (une ligne par source) */}
        <div className="space-y-2.5 pt-2">
          {COVERAGE_TIMELINE.map((cov, i) => (
            <div key={i} className="p-2.5 bg-sand-surface rounded-[12px] border border-sand-line/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink">{cov.source}</span>
                <StatusBadge status={cov.status} size="sm" />
              </div>

              <div className="w-full h-2.5 bg-sand-line/70 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    cov.status === "Inutilisable"
                      ? "bg-[#D2691E]/60"
                      : cov.status === "Mesuré"
                      ? "bg-[#3F7D58]"
                      : "bg-sand-line"
                  }`}
                  style={{ marginLeft: `${cov.startPct}%`, width: `${cov.widthPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-subtle">
                <span className="tabular-nums">{cov.periodLabel}</span>
                <span>{cov.frequency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. État des sources en LISTE DE CARTES ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <h3 className="font-serif text-sm font-normal text-ink">
            État de validation des sources (7 membres)
          </h3>
          <span className="text-[11px] text-ink-subtle">DOC-20261115</span>
        </div>

        <div className="space-y-2">
          {SOURCES_STATE_TABLE.map((row, i) => (
            <div
              key={i}
              className="p-3 bg-white rounded-[12px] border border-sand-line text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{row.source}</span>
                <StatusBadge status={row.statusType} size="sm" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-ink-subtle">
                <span>Responsable : {row.responsible}</span>
                <span className="tabular-nums">{row.coverage}</span>
              </div>
              <p className="text-[11px] text-ink-muted pt-1 border-t border-sand-line/40 leading-relaxed">
                {row.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Import du CSV avec gros bouton tactile ── */}
      <div className="dash-card space-y-3 p-4 sm:p-6">
        <div className="flex items-center justify-between pb-2 border-b border-sand-line/60">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-sm font-normal text-ink">
              Importer des données propres (Papa Samb)
            </h3>
          </div>
          <button
            onClick={() => setFormatSheetOpen(true)}
            className="touch-target text-xs text-terracotta hover:underline flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Format requis</span>
          </button>
        </div>

        <p className="text-xs text-ink-muted">
          Sur mobile, sélectionnez un fichier CSV propre depuis votre téléphone. L'inférence est calculée localement en TypeScript.
        </p>

        {/* Gros bouton tactile « Choisir un fichier » (>= 44px) */}
        <label className="touch-target w-full h-12 bg-ink hover:bg-terracotta text-white rounded-pill text-xs font-medium flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <UploadCloud className="w-4 h-4" />
          <span>{fileName ? fileName : "Choisir un fichier CSV"}</span>
        </label>

        {uploadStatus === "error" && (
          <div className="p-3 bg-[#FDF0EC] text-[#A8372C] rounded-[10px] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {uploadStatus === "saved" && (
          <div className="p-3 bg-[#EAF3ED] text-[#24613B] rounded-[10px] text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#3F7D58]" /> Données actives en local
            </span>
            <button onClick={resetToDefault} className="underline text-[11px] font-medium">
              Rétablir
            </button>
          </div>
        )}

        {uploadStatus === "valid" && report && (
          <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line text-xs space-y-2">
            <div className="flex justify-between">
              <span>Lignes valides : <strong>{report.totalRows}</strong></span>
              <span>Complétude : <strong>{report.completeness} %</strong></span>
            </div>
            <button
              onClick={applyCustomData}
              className="touch-target w-full h-10 bg-terracotta text-white rounded-pill font-medium text-xs shadow-xs"
            >
              Appliquer à toute la plateforme
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sheet expliquant le format CSV attendu */}
      <BottomSheet
        isOpen={formatSheetOpen}
        onClose={() => setFormatSheetOpen(false)}
        title="Format CSV attendu (donnees_propres.csv)"
      >
        <div className="space-y-3">
          <p>
            Le fichier consolidé par Papa Ibrahima Samb doit respecter la structure suivante :
          </p>
          <div className="p-3 bg-sand-surface rounded-[12px] font-mono text-xs space-y-1">
            <div className="font-bold text-ink">Colonnes obligatoires :</div>
            <div>timestamp (format UTC ISO 8601)</div>
            <div>pm25 (concentration en µg/m³)</div>
            <div className="font-bold text-ink pt-2">Colonnes optionnelles détectées :</div>
            <div>vent_vitesse, vent_direction, humidite, aod</div>
          </div>
          <p className="text-[11px] text-ink-subtle">
            Le fichier est analysé à 100% dans votre navigateur sans être envoyé sur un serveur tiers.
          </p>
        </div>
      </BottomSheet>
    </section>
  );
}
