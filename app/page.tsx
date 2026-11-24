"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ForecastSection from "@/components/sections/ForecastSection";
import SourcesSection from "@/components/sections/SourcesSection";
import StationsSection from "@/components/sections/StationsSection";
import DataSection from "@/components/sections/DataSection";
import ModelSection from "@/components/sections/ModelSection";
import FooterSection from "@/components/sections/FooterSection";
import BackToTop from "@/components/BackToTop";

export default function OnePageDashboard() {
  const [data, setData] = useState<any>(null);
  const [isSynthetic, setIsSynthetic] = useState<boolean>(true);
  const [selectedHour, setSelectedHour] = useState<number>(14);

  useEffect(() => {
    // Caler par défaut sur l'heure UTC actuelle
    const nowUtc = new Date().getUTCHours();
    setSelectedHour(nowUtc);

    // Vérifier les données personnalisées injectées dans localStorage
    const custom = localStorage.getItem("dakarrespire:v1:custom_prediction");
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        setData(parsed);
        setIsSynthetic(Boolean(parsed.synthetic));
        return;
      } catch (e) {}
    }

    // Charger les prévisions de référence
    fetch("/model/forecast.json")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsSynthetic(true);
      })
      .catch(() => {});
  }, []);

  const currentPm25 = data?.current_pm25 ?? 28.5;

  return (
    <div className="min-h-screen bg-sand text-ink flex flex-col antialiased selection:bg-terracotta/20 selection:text-terracotta">
      {/* ── Navigation collée en haut en pilule (Capture 3 style) ── */}
      <Navbar currentPm25={currentPm25} isSynthetic={isSynthetic} />

      {/* ── Contenu principal en grille One Page ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-12 space-y-12 sm:space-y-16">
        {/* Section ① : Aujourd'hui (Hero 3D, grand chiffre, 5 cartes, 3 jauges) */}
        <HeroSection
          selectedHour={selectedHour}
          onHourChange={setSelectedHour}
          data={data}
          isSynthetic={isSynthetic}
        />

        {/* Section ② : Prévision sur 24 h (Graphique barres, marge droite, sélecteur modèle, tableau) */}
        <ForecastSection
          selectedHour={selectedHour}
          onHourChange={setSelectedHour}
          data={data}
          isSynthetic={isSynthetic}
        />

        {/* Section ③ : Sources de pollution (Donut Alioune 2009, ruban 12 mois, Harmattan) */}
        <SourcesSection />

        {/* Section ④ : Mesures au sol (Carte interactive Cap-Vert, tableau stations, écarts 21/11/2026) */}
        <StationsSection />

        {/* Section ⑤ : Les données (Frise 2019-2026, impasse météo/sol, état sources, import CSV) */}
        <DataSection />

        {/* Section ⑥ : Modèle et preuve (Benchmark RMSE, prévu/mesuré, expérience satellite, limites) */}
        <ModelSection />

        {/* Pied de page complet (Équipe 7 membres, licences et notices) */}
        <FooterSection />
      </main>

      {/* Bouton retour en haut fluide */}
      <BackToTop />
    </div>
  );
}
