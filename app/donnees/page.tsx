"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Database,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";
import { runInBrowserInference, PredictionResult } from "@/lib/clientPredictor";

export default function DonneesPage() {
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "valid" | "error" | "saved">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [report, setReport] = useState<any>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Vérifier si un CSV propre est déjà chargé dans le navigateur
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
      setCsvContent(text);
      validateAndScoreCsv(text, file.name);
    };
    reader.readAsText(file);
  };

  const validateAndScoreCsv = (text: string, name: string) => {
    try {
      const lines = text.trim().split("\n");
      if (lines.length < 5) {
        throw new Error("Le fichier est trop court (moins de 5 lignes).");
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const hasPm25 = headers.some((h) => h.includes("pm25") || h.includes("pm2.5"));
      const hasDate = headers.some((h) => h.includes("date") || h.includes("time"));
      const hasWind = headers.some((h) => h.includes("wind") || h.includes("ws"));
      const hasTemp = headers.some((h) => h.includes("temp") || h.includes("t2m"));

      if (!hasPm25) {
        throw new Error("Colonne obligatoire 'pm25' (ou 'pm2.5') introuvable dans l'en-tête.");
      }

      // Calcul des métriques de qualité
      let missingCount = 0;
      let negCount = 0;
      let sentinelCount = 0;
      const pm25Idx = headers.findIndex((h) => h.includes("pm25") || h.includes("pm2.5"));

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const val = parseFloat(cols[pm25Idx]);
        if (isNaN(val) || cols[pm25Idx]?.trim() === "") missingCount++;
        else if (val === -999) sentinelCount++;
        else if (val < 0) negCount++;
      }

      const qualityReport = {
        totalRows: lines.length - 1,
        headersFound: headers.slice(0, 8),
        hasDate,
        hasWind,
        hasTemp,
        missingCount,
        sentinelCount,
        negCount,
        completeness: Math.round(((lines.length - 1 - missingCount - sentinelCount) / (lines.length - 1)) * 100),
      };

      setReport(qualityReport);

      // Inférence client instantanée
      const predResult = runInBrowserInference(text, null);
      setPrediction(predResult);
      setUploadStatus("valid");
    } catch (err: any) {
      setUploadStatus("error");
      setErrorMessage(err.message || "Erreur de lecture du fichier CSV.");
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

  // Tableau de bord d'avancement de l'équipe
  const teamStatus = [
    { name: "Alioune Badara Sarr", role: "Étude des PM2.5 et poussières sahariennes", status: "Reçu", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    { name: "El Hadji Ibrahima Diop Sow", role: "Données météo NASA POWER 2019-2024", status: "Reçu en partie", badge: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    { name: "Lamine Cissé", role: "Données satellitaires Copernicus CAMS & Sentinel-5P", status: "Sources transmises", badge: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    { name: "Mously Sow", role: "Séries in situ réelles des stations sol CGQA Dakar", status: "Rapport reçu", badge: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    { name: "Papa Ibrahima Samb", role: "Consolidation, nettoyage et fusion finale", status: "En cours (Module d'accueil actif ci-dessous)", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { name: "Sayon Sidibé", role: "Recherche scientifique, seuils et littérature", status: "En cours (Page Méthode prête)", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <div className="text-xs uppercase font-bold tracking-widest text-teal-400 mb-1">
          Intégration & Architecture Modulaire
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Données du Projet & Livrables de l'Équipe
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Plateforme conçue pour intégrer les résultats réels de Papa Ibrahima Samb et Sayon Sidibé sans aucune réécriture de code.
        </p>
      </div>

      {/* Module de Dépôt CSV Papa Ibrahima Samb */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-teal-400" />
            Module d'Ingestion Directe du CSV de Papa Ibrahima Samb
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Déposez ici le fichier CSV propre contenant les mesures in situ combinées aux réanalyses météo et observations satellitaires.
          </p>
        </div>

        {/* Dropzone */}
        <label className="border-2 border-dashed border-slate-700 hover:border-teal-400/80 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/50 hover:bg-slate-900/80 group">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-7 h-7 text-teal-400" />
          </div>
          <span className="text-sm font-semibold text-slate-200">
            {fileName ? `Fichier sélectionné : ${fileName}` : "Cliquez ou glissez-déposez le fichier CSV ici"}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            Format accepté : .csv (colonnes attendues : timestamp, pm25, wd, ws, rh, temp)
          </span>
        </label>

        {/* Messages d'erreur ou de succès */}
        {uploadStatus === "error" && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {report && (
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Rapport de Contrôle Qualité Automatique du CSV
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Lignes analysées</div>
                <div className="font-bold text-white text-base">{report.totalRows}</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Complétude</div>
                <div className="font-bold text-teal-400 text-base">{report.completeness} %</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Sentinelles -999</div>
                <div className="font-bold text-amber-400 text-base">{report.sentinelCount}</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Valeurs négatives</div>
                <div className="font-bold text-slate-300 text-base">{report.negCount}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={applyCustomData}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs hover:opacity-90 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Appliquer et Mettre à Jour les Prévisions du Site
              </button>
            </div>
          </div>
        )}

        {uploadStatus === "saved" && (
          <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Jeu de données actif :</strong> Vos données réelles sont chargées dans le navigateur. Toutes les pages affichent désormais ces prévisions.
              </span>
            </div>
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shrink-0 transition"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Tableau d'Avancement des Livrables de l'Équipe */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          Circuit des Données & Contributions de l'Équipe
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-3">Membre de l'Équipe</th>
                <th className="py-3 px-3">Rôle / Données gérées</th>
                <th className="py-3 px-3">Statut Actuel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {teamStatus.map((m, i) => (
                <tr key={i} className="hover:bg-slate-800/30 text-slate-300">
                  <td className="py-3 px-3 font-bold text-slate-100">{m.name}</td>
                  <td className="py-3 px-3 text-slate-400">{m.role}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold ${m.badge}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
