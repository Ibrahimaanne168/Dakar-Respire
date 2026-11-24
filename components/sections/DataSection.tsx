"use client";

import React, { useState, useEffect } from "react";
import { COVERAGE_TIMELINE, SOURCES_STATE_TABLE } from "@/lib/dashboardData";
import { runInBrowserInference, PredictionResult } from "@/lib/clientPredictor";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import { UploadCloud, FileText, AlertTriangle, CheckCircle, RefreshCw, Database } from "lucide-react";

export default function DataSection() {
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "valid" | "error" | "saved">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [report, setReport] = useState<any>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

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
        throw new Error("Colonne obligatoire 'pm25' (ou 'pm2.5') introuvable dans le CSV.");
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
        hasWind: headers.some((h) => h.includes("vent") || h.includes("wind")),
        hasHum: headers.some((h) => h.includes("hum")),
      });

      const predResult = runInBrowserInference(text, null);
      setPrediction(predResult);
      setUploadStatus("valid");
    } catch (err: any) {
      setUploadStatus("error");
      setErrorMessage(err.message || "Erreur lors de la lecture du fichier CSV.");
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
    <section id="donnees" className="space-y-6 pt-6">
      {/* ── 1. Frise de couverture par source & Note rouge d'absence de recouvrement ── */}
      <div className="dash-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sand-line/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
                Section ⑤ · Consolidation des flux
              </span>
              <StatusBadge status="Modèle" size="sm" />
            </div>
            <h2 className="font-serif text-2xl text-ink font-normal mt-1">
              Couverture temporelle et état des jeux de données
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Historique des sources reçues et identification de l'impasse chronologique à résoudre
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-terracotta" />
            <span className="text-xs text-ink-muted">Échelle 2019 – 2026</span>
          </div>
        </div>

        {/* Note rouge sobre non équivoque (imposée par le prompt) */}
        <div className="p-4 rounded-[14px] bg-[#FDF0EC] border border-[#A8372C]/30 text-xs text-[#A8372C] flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-medium text-sm block">
              Constat méthodologique : Aucune période commune entre la météo documentée et les PM2.5 mesurés
            </strong>
            <p className="text-xs leading-relaxed text-[#A8372C]/90">
              Les données météo reçues (NASA POWER) s'arrêtent au <strong>31/12/2024</strong>, tandis que les premiers capteurs PM2.5 d'OpenAQ ne commencent à émettre qu'au <strong>17/11/2025</strong>. Les modèles de démonstration actuels utilisent donc une réanalyse météorologique simulée synchronisée sur 2025–2026 en attendant le téléchargement des séries météo récentes par El Hadji.
            </p>
          </div>
        </div>

        {/* Diagramme horizontal en barres (Gantt temporel) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-ink-subtle border-b border-sand-line/60 pb-1 tabular-nums">
            <span>2019</span>
            <span>2021</span>
            <span>2023</span>
            <span>2024 (fin météo reçue)</span>
            <span className="font-medium text-terracotta">2025–2026 (mesures sol)</span>
          </div>

          <div className="space-y-3">
            {COVERAGE_TIMELINE.map((cov, i) => (
              <div key={i} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <span className="font-medium text-ink">{cov.source}</span>
                  <div className="flex items-center gap-2 text-ink-subtle text-[11px]">
                    <span className="tabular-nums">{cov.periodLabel}</span>
                    <span>·</span>
                    <span>{cov.frequency}</span>
                    <StatusBadge status={cov.status} size="sm" />
                  </div>
                </div>

                {/* Barre de timeline */}
                <div className="w-full h-3.5 bg-sand-surface rounded-full overflow-hidden p-0.5 border border-sand-line">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cov.status === "Inutilisable"
                        ? "bg-[#D2691E]/50"
                        : cov.status === "Mesuré"
                        ? "bg-[#3F7D58]"
                        : "bg-sand-line"
                    }`}
                    style={{
                      marginLeft: `${cov.startPct}%`,
                      width: `${cov.widthPct}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-ink-subtle">{cov.statusText}</p>
              </div>
            ))}
          </div>
        </div>

        <DataMetadata
          source="Inventaire des 5 fichiers de l'équipe"
          period="2019 – 2026"
          status="Modèle"
        />
      </div>

      {/* ── 2. Tableau « État des sources » ── */}
      <div className="dash-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
          <h3 className="font-serif text-lg text-ink font-normal">
            Inventaire et état de validation des sources
          </h3>
          <span className="text-xs text-ink-subtle">Attributions selon DOC-20261115-WA0029.pdf</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand-line text-ink-subtle font-normal">
                <th className="py-2.5 pr-4 font-normal">Source</th>
                <th className="py-2.5 pr-4 font-normal">Responsable</th>
                <th className="py-2.5 pr-4 font-normal">Période</th>
                <th className="py-2.5 pr-4 font-normal">Pas</th>
                <th className="py-2.5 pr-4 font-normal">Statut</th>
                <th className="py-2.5 font-normal">Observation critique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-line/60">
              {SOURCES_STATE_TABLE.map((row, i) => (
                <tr key={i} className="hover:bg-sand-surface/60 transition-colors">
                  <td className="py-3 pr-4 font-medium text-ink">{row.source}</td>
                  <td className="py-3 pr-4 text-ink-muted">{row.responsible}</td>
                  <td className="py-3 pr-4 text-ink-subtle tabular-nums">{row.coverage}</td>
                  <td className="py-3 pr-4 text-ink-subtle">{row.timeStep}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={row.statusType} size="sm" />
                  </td>
                  <td className="py-3 text-[11px] text-ink-muted leading-relaxed">
                    {row.comment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Fiche de qualité & Zone d'import CSV (Papa Ibrahima Samb) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zone de glisser-déposer CSV */}
        <div className="dash-card lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-terracotta" />
              <h3 className="font-serif text-base text-ink font-normal">
                Déposer un jeu de données propre (donnees_propres.csv)
              </h3>
            </div>
            <StatusBadge status="À venir" size="sm" />
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Emplacement prévu pour le fichier final de <strong>Papa Ibrahima Samb</strong>. Le navigateur exécute instantanément l'inférence en TypeScript et actualise l'ensemble du tableau de bord.
          </p>

          <label className="block border-2 border-dashed border-sand-line hover:border-terracotta p-8 rounded-[16px] text-center cursor-pointer transition-colors bg-sand-surface/40 hover:bg-sand-surface">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            <UploadCloud className="w-8 h-8 text-terracotta mx-auto mb-2 opacity-80" />
            <span className="text-xs font-medium text-ink block">
              {fileName ? fileName : "Glissez votre fichier CSV propre ici ou cliquez pour parcourir"}
            </span>
            <span className="text-[11px] text-ink-subtle block mt-1">
              Colonnes requises : <code className="font-mono text-ink">pm25</code> (ou <code className="font-mono text-ink">pm2.5</code>). Colonnes optionnelles : <code className="font-mono">vent</code>, <code className="font-mono">humidite</code>, <code className="font-mono">aod</code>.
            </span>
          </label>

          {uploadStatus === "error" && (
            <div className="p-3 bg-[#FDF0EC] text-[#A8372C] rounded-[10px] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {uploadStatus === "saved" && (
            <div className="p-3 bg-[#EAF3ED] text-[#24613B] rounded-[10px] text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#3F7D58]" />
                Données personnalisées actives dans le navigateur (localStorage).
              </span>
              <button
                onClick={resetToDefault}
                className="underline hover:text-ink font-medium text-[11px]"
              >
                Rétablir le modèle de base
              </button>
            </div>
          )}

          {uploadStatus === "valid" && report && (
            <div className="p-4 bg-sand-surface rounded-[12px] border border-sand-line text-xs space-y-3">
              <div className="flex items-center justify-between font-medium text-ink">
                <span>Fichier vérifié avec succès :</span>
                <span className="text-[#3F7D58]">Prêt pour l'application</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-ink-muted text-[11px] tabular-nums">
                <div>Lignes temporelles : <strong>{report.totalRows}</strong></div>
                <div>Complétude PM2.5 : <strong>{report.completeness} %</strong></div>
                <div>Vent détecté : <strong>{report.hasWind ? "Oui" : "Non (imputé)"}</strong></div>
                <div>Humidité : <strong>{report.hasHum ? "Oui" : "Non (imputée)"}</strong></div>
              </div>
              <button
                onClick={applyCustomData}
                className="w-full bg-ink hover:bg-terracotta text-white py-2 rounded-pill font-medium transition-colors text-xs"
              >
                Appliquer immédiatement à tout le tableau de bord
              </button>
            </div>
          )}
        </div>

        {/* Fiche de qualité du jeu de données en cours */}
        <div className="dash-card lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-ink-muted" />
                <h3 className="font-serif text-base text-ink font-normal">
                  Fiche de qualité du jeu actif
                </h3>
              </div>
              <StatusBadge status={prediction ? "Mesuré" : "Simulé"} size="sm" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-sand-line/50">
                <span className="text-ink-subtle">Source active :</span>
                <span className="font-medium text-ink">{prediction ? "Fichier importé client" : "Série simulée étalonnée"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sand-line/50">
                <span className="text-ink-subtle">Pas d'échantillonnage :</span>
                <span className="font-medium text-ink">1 heure (UTC)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sand-line/50">
                <span className="text-ink-subtle">Échéance de prévision :</span>
                <span className="font-medium text-ink">+1 h à +24 h</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sand-line/50">
                <span className="text-ink-subtle">Taux de données manquantes :</span>
                <span className="font-medium text-ink">0 % (interpolé par spline)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sand-line/50">
                <span className="text-ink-subtle">Variable cible :</span>
                <span className="font-medium text-ink">PM2.5 de surface (µg/m³)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line text-[11px] text-ink-muted leading-relaxed">
            Le moteur local stocke le jeu importé sous la clé standardisée <code className="font-mono text-ink">dakarrespire:v1:custom_prediction</code> sans aucun envoi vers un serveur externe.
          </div>
        </div>
      </div>
    </section>
  );
}
