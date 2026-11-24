"use client";

import React, { useState, useEffect } from "react";
import { runInBrowserInference, PredictionResult } from "@/lib/clientPredictor";

export default function DonneesPage() {
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
      validateCsv(text, file.name);
    };
    reader.readAsText(file);
  };

  const validateCsv = (text: string, name: string) => {
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
      setErrorMessage(err.message || "Erreur lors de la lecture du fichier CSV.");
    }
  };

  const applyCustomData = () => {
    if (prediction) {
      localStorage.setItem("dakarrespire:v1:custom_prediction", JSON.stringify(prediction));
      setUploadStatus("saved");
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

  // Les 5 emplacements uniques pour intégrer les fichiers attendus
  const expectedSlots = [
    {
      file: "donnees_propres.csv",
      author: "Papa Ibrahima Samb",
      format: "CSV horaire (timestamp UTC, pm25, station, météo, satellite)",
      status: "Emplacement actif via la zone de dépôt ci-dessus",
    },
    {
      file: "sayon_config.json",
      author: "Sayon Sidibé",
      format: "JSON (seuils d'alerte, références sanitaires, limites)",
      status: "Emplacement réservé dans lib/config.ts",
    },
    {
      file: "meteo_nasa_power_hourly.csv",
      author: "El Hadji Ibrahima Diop Sow",
      format: "CSV horaire (date, temp, humidite, vent_ms, direction_deg)",
      status: "Prévu dans data/raw/ (catalogue reçu, série en attente)",
    },
    {
      file: "openaq_limamoulaye.csv & airnow_ambassade.csv",
      author: "Mously Sow",
      format: "CSV brut OpenAQ / AirNow des stations au sol",
      status: "Prévu dans data/raw/ (rapport reçu, téléchargement en attente)",
    },
    {
      file: "cams_aod_dakar.nc & sentinel5p.nc",
      author: "Lamine Cissé",
      format: "NetCDF / CSV de l'emprise 14,55°–14,85° N, −17,55°–−17,10° O",
      status: "Prévu dans data/raw/ (sources documentées)",
    },
  ];

  return (
    <div className="space-y-12 max-w-3xl">
      {/* En-tête */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-ink">
          Données et intégration future
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Zone de dépôt du fichier consolidé de Papa Ibrahima Samb et points d'accueil pour chaque fichier de l'équipe.
        </p>
      </div>

      {/* Zone de dépôt CSV sobre */}
      <div className="p-6 bg-sand-surface hairline space-y-4">
        <div>
          <h2 className="font-serif text-lg text-ink font-normal">
            Déposer le fichier propre (donnees_propres.csv)
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Format cible : CSV horaire, timestamp en UTC, colonne 'pm25'. Les colonnes optionnelles (vent, humidité, AOD) sont détectées automatiquement.
          </p>
        </div>

        <label className="block border border-dashed border-sand-line hover:border-ink-muted p-6 text-center cursor-pointer transition-colors">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <span className="text-xs text-ink">
            {fileName ? fileName : "Cliquer ou glisser le fichier CSV propre ici"}
          </span>
          <span className="block text-[11px] text-ink-subtle mt-1">
            Exemple : donnees_propres.csv (recalcul immédiat en TypeScript dans le navigateur)
          </span>
        </label>

        {uploadStatus === "error" && (
          <p className="text-xs text-level-alerte">{errorMessage}</p>
        )}

        {report && uploadStatus === "valid" && (
          <div className="pt-2 hairline-t text-xs space-y-2">
            <p className="text-ink">
              Fichier analysé : <strong className="tabular-nums">{report.totalRows} lignes</strong> · Complétude :{" "}
              <strong className="tabular-nums">{report.completeness} %</strong>
            </p>
            <button
              onClick={applyCustomData}
              className="bg-terracotta hover:bg-terracotta-hover text-sand-surface px-4 py-2 text-xs font-medium transition-colors"
            >
              Appliquer à toutes les prévisions du site
            </button>
          </div>
        )}

        {uploadStatus === "saved" && (
          <div className="pt-2 hairline-t flex items-baseline justify-between text-xs">
            <span className="text-level-bon font-medium">Données réelles enregistrées et actives sur l'ensemble du site.</span>
            <button onClick={resetToDefault} className="text-ink-muted hover:text-ink underline">
              Rétablir le modèle initial
            </button>
          </div>
        )}
      </div>

      {/* Emplacements d'accueil pour chaque fichier attendu */}
      <div className="space-y-3 pt-2">
        <h2 className="font-serif text-lg text-ink font-normal">
          Emplacements réservés pour les fichiers attendus
        </h2>
        <p className="text-xs text-ink-muted">
          L'architecture permet d'intégrer chaque livrable dès sa réception sans réécriture de code :
        </p>

        <ul className="divide-y divide-sand-line hairline-t hairline-b text-xs">
          {expectedSlots.map((slot, i) => (
            <li key={i} className="py-3 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="font-mono text-ink font-medium">{slot.file}</span>
                <span className="text-ink-subtle text-[11px]">{slot.author}</span>
              </div>
              <div className="text-ink-muted">{slot.format}</div>
              <div className="text-terracotta text-[11px]">{slot.status}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Note d'honnêteté sur les données de démonstration */}
      <div className="p-4 bg-sand-surface hairline text-xs text-ink-muted leading-relaxed">
        <strong className="text-ink font-medium">Note d'honnêteté :</strong> Tant que le fichier propre de Papa Ibrahima Samb n'est pas déposé, les prévisions s'appuient sur une série synthétique calibrée reproduisant la saisonnalité et le cycle diurne de Dakar. L'étiquette « Données simulées » est visible sur toutes les pages.
      </div>
    </div>
  );
}
