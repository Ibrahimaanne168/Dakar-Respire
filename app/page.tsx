"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "@/components/sections/HeroSection";
import ForecastSection from "@/components/sections/ForecastSection";
import SourcesSection from "@/components/sections/SourcesSection";
import StationsSection from "@/components/sections/StationsSection";
import DataSection from "@/components/sections/DataSection";
import ModelSection from "@/components/sections/ModelSection";
import FooterSection from "@/components/sections/FooterSection";
import BackToTop from "@/components/BackToTop";
import ShareButton from "@/components/ShareButton";
import OfflineBanner from "@/components/OfflineBanner";

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
  const peakPm25 = data?.peak_pm25 ?? 34.0;
  const peakHour = data?.hourly?.reduce(
    (best: any, h: any) => (h.pm25 > (best?.pm25 ?? -1) ? h : best),
    null
  )?.hour ?? 20;

  return (
    <div className="min-h-[100dvh] bg-sand text-ink flex flex-col antialiased selection:bg-terracotta/20 selection:text-terracotta">
      {/* ── Bandeau hors ligne discret (s'active si perte de connexion) ── */}
      <OfflineBanner />

      {/* ── Contenu principal mobile first (une seule colonne sur mobile, 12 colonnes sur desktop) ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6 sm:space-y-12">
        {/* Section ① : Aujourd'hui (Hero 55svh, grand chiffre 72-88px, curseur 6h, carrousel horizontal, 3 jauges) */}
        <HeroSection
          selectedHour={selectedHour}
          onHourChange={setSelectedHour}
          data={data}
          isSynthetic={isSynthetic}
        />

        {/* Section ② : Prévision 24 h (Graphique barres pleine largeur, repères 6h, infobulle au-dessus du doigt) */}
        <ForecastSection
          selectedHour={selectedHour}
          onHourChange={setSelectedHour}
          data={data}
          isSynthetic={isSynthetic}
        />

        {/* Section ③ : Sources de pollution (Donut centré + légende liste dessous, 12 mois compacts) */}
        <SourcesSection />

        {/* Section ④ : Mesures au sol (Carte hauteur fixe 280px + liste de cartes par station + BottomSheet) */}
        <StationsSection />

        {/* Section ⑤ : Données (Frise empilée + état sources en cartes + gros bouton CSV tactile) */}
        <DataSection />

        {/* Section ⑥ : Modèle et preuve (Cartes modèles avec barres RMSE + accordéons limites & références) */}
        <ModelSection />

        {/* Pied de page complet (7 membres, licences et notices) */}
        <FooterSection />
      </main>

      {/* Bouton retour en haut (au-dessus du bouton de partage) */}
      <BackToTop />

      {/* Bouton « Partager » au pouce (Web Share API + WhatsApp + notice données simulées) */}
      <ShareButton
        currentPm25={currentPm25}
        selectedHour={selectedHour}
        peakPm25={peakPm25}
        peakHour={peakHour}
        isSynthetic={isSynthetic}
      />
    </div>
  );
}
