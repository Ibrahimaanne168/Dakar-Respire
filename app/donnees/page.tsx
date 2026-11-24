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

  const teamSources = [
    { name: "Alioune Badara Sarr", task: "Étude des PM2.5 et poussières sahariennes", status: "Reçu" },
    { name: "El Hadji Ibrahima Diop Sow", task: "Données météo NASA POWER 2019-2024", status: "Reçu en partie" },
    { name: "Lamine Cissé", task: "Données satellites Copernicus CAMS et Sentinel-5P", status: "Sources transmises" },
    { name: "Mously Sow", task: "Mesures réelles de stations au sol (CGQA)", status: "Rapport reçu" },
    { name: "Papa Ibrahima Samb", task: "Regroupement, nettoyage et fichier propre final", status: "À venir" },
    { name: "Sayon Sidibé", task: "Recherche scientifique, seuils et bibliographie", status: "À venir" },
  ];

  return (
    <div className="space-y-12 max-w-3xl">
      {/* En-tête */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-ink">
          Données et circuit de l'équipe
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Les prévisions actuellement affichées utilisent un jeu de données simulé calibré sur Dakar. Le fichier propre consolidé de Papa Ibrahima Samb peut être déposé directement ci-dessous.
        </p>
      </div>

      {/* Zone de dépôt CSV sobre */}
      <div className="p-6 bg-sand-surface hairline space-y-4">
        <div>
          <h2 className="font-serif text-lg text-ink font-normal">
            Déposer un nouveau fichier propre (CSV)
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Le recalcul de la prévision s'effectue directement dans le navigateur sans renvoi vers un serveur.
          </p>
        </div>

        <label className="block border border-dashed border-sand-line hover:border-ink-muted p-6 text-center cursor-pointer transition-colors">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <span className="text-xs text-ink">
            {fileName ? fileName : "Sélectionner ou glisser un fichier CSV ici"}
          </span>
          <span className="block text-[11px] text-ink-subtle mt-1">
            Colonnes attendues : timestamp, pm25, wd, ws, rh, temp
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
              Appliquer à toutes les prévisions
            </button>
          </div>
        )}

        {uploadStatus === "saved" && (
          <div className="pt-2 hairline-t flex items-baseline justify-between text-xs">
            <span className="text-level-bon font-medium">Données réelles enregistrées et actives sur le site.</span>
            <button onClick={resetToDefault} className="text-ink-muted hover:text-ink underline">
              Rétablir la version initiale
            </button>
          </div>
        )}
      </div>

      {/* État des sources sous forme de liste à filets */}
      <div className="space-y-3 pt-2">
        <h2 className="font-serif text-lg text-ink font-normal">
          État des travaux de l'équipe
        </h2>
        <ul className="divide-y divide-sand-line hairline-t hairline-b text-xs">
          {teamSources.map((s, i) => (
            <li key={i} className="py-2.5 flex items-baseline justify-between gap-4">
              <div>
                <span className="text-ink font-medium">{s.name}</span>
                <span className="text-ink-muted ml-2">· {s.task}</span>
              </div>
              <span className={`tabular-nums shrink-0 ${
                s.status === "Reçu" ? "text-level-bon" : "text-ink-subtle"
              }`}>
                {s.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Note claire sur les données simulées */}
      <div className="p-4 bg-sand-surface hairline text-xs text-ink-muted leading-relaxed">
        <strong className="text-ink font-medium">Note sur les données :</strong> Les prévisions par défaut du site proviennent d'un modèle entraîné sur une série simulée reproduisant les caractéristiques réelles de Dakar (pics du soir, creux nocturnes, dynamique de l'Harmattan). Dès réception du fichier propre de Papa Ibrahima Samb, celui-ci s'intègre via l'importateur ci-dessus sans aucune modification du code source.
      </div>
    </div>
  );
}
