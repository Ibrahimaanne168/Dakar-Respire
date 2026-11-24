"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { getAlertLevel, ALIOUNE_FACTS } from "@/lib/config";
import AnimatedNumber from "@/components/AnimatedNumber";
import DakarSkyGradient from "@/components/DakarSkyGradient";
import DakarSilhouette from "@/components/DakarSilhouette";

const DakarScene3D = dynamic(() => import("@/components/DakarScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] bg-sand-surface flex items-center justify-center text-xs text-ink-muted hairline">
      Vue de la presqu'île du Cap-Vert…
    </div>
  ),
});

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [isSynthetic, setIsSynthetic] = useState<boolean>(true);
  const [currentHour, setCurrentHour] = useState<number>(14);

  useEffect(() => {
    setCurrentHour(new Date().getUTCHours());
    const custom = localStorage.getItem("dakarrespire:v1:custom_prediction");
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        setData(parsed);
        setIsSynthetic(Boolean(parsed.synthetic));
        return;
      } catch (e) {}
    }

    fetch("/model/forecast.json")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsSynthetic(true);
      })
      .catch(() => {});
  }, []);

  const currentPm25: number = data?.current_pm25 ?? 28.5;
  const peakPm25: number = data?.peak_pm25 ?? 34.0;
  const hourly: any[] = data?.hourly || [];
  const currentLevel = getAlertLevel(currentPm25);

  // Heure du pic et meilleure heure
  const peakItem = hourly.reduce(
    (best: any, h: any) => (h.pm25 > (best?.pm25 ?? -1) ? h : best),
    null
  );
  const bestItem = hourly.reduce(
    (best: any, h: any) => (h.pm25 < (best?.pm25 ?? Infinity) ? h : best),
    null
  );

  const sparklineData = hourly.map((h: any) => ({
    hour: `${h.hour}h`,
    pm25: h.pm25,
  }));

  return (
    <div className="space-y-0">

      {/* ── 1. Hero : ciel fonctionnel + grand chiffre animé ── */}
      <DakarSkyGradient
        pm25={currentPm25}
        hour={currentHour}
        className="-mx-4 sm:-mx-8 px-4 sm:px-8 pt-12 pb-10"
      >
        {isSynthetic && (
          <span className="inline-block text-[11px] border border-terracotta/50 text-terracotta px-2 py-0.5 mb-5">
            Données simulées
          </span>
        )}

        <p className="text-xs uppercase tracking-wider text-ink-muted mb-3 opacity-80">
          Dakar · Presqu'île du Cap-Vert
        </p>

        {/* Grand chiffre animé */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-serif text-7xl sm:text-8xl font-normal text-ink tabular-nums leading-none">
            <AnimatedNumber value={currentPm25} decimals={1} duration={1000} />
          </span>
          <span className="text-xl text-ink-muted">µg/m³ PM2.5</span>
        </div>

        {/* Niveau en couleur */}
        <div className="flex items-center gap-2 mb-6">
          <span
            className="w-3 h-3 rounded-full inline-block shrink-0"
            style={{ backgroundColor: currentLevel.color }}
          />
          <span
            className="font-serif text-2xl font-normal"
            style={{ color: currentLevel.color }}
          >
            {currentLevel.label}
          </span>
        </div>

        {/* 3 stats en ligne séparées par trait */}
        <div className="flex flex-col sm:flex-row sm:divide-x sm:divide-ink/10 gap-4 sm:gap-0 text-sm mt-2">
          <div className="sm:pr-8">
            <p className="text-[11px] uppercase tracking-wide text-ink-subtle mb-0.5">Maintenant</p>
            <p className="font-serif text-2xl text-ink tabular-nums font-normal">
              {currentPm25.toFixed(1).replace(".", ",")} µg/m³
            </p>
          </div>
          <div className="sm:px-8">
            <p className="text-[11px] uppercase tracking-wide text-ink-subtle mb-0.5">Pic prévu</p>
            <p className="font-serif text-2xl text-ink tabular-nums font-normal">
              {peakPm25.toFixed(1).replace(".", ",")} µg/m³
              {peakItem && (
                <span className="text-base text-ink-muted font-sans ml-1">à {peakItem.hour}h</span>
              )}
            </p>
          </div>
          <div className="sm:pl-8">
            <p className="text-[11px] uppercase tracking-wide text-ink-subtle mb-0.5">Meilleur moment</p>
            <p className="font-serif text-2xl text-ink tabular-nums font-normal">
              {bestItem ? `${bestItem.hour}h` : "—"}
              {bestItem && (
                <span className="text-base text-ink-muted font-sans ml-1">
                  · {bestItem.pm25.toFixed(1).replace(".", ",")} µg/m³
                </span>
              )}
            </p>
          </div>
        </div>
      </DakarSkyGradient>

      {/* ── 2. Scène 3D ── */}
      <section className="w-full h-[360px] sm:h-[440px]">
        <DakarScene3D
          pm25={currentPm25}
          hour={currentHour}
          windSpeed={4.2}
          windDeg={45}
          isHarmattan={true}
        />
      </section>

      {/* ── 3. Sparkline 24h ── */}
      <section className="space-y-2 pt-8 px-0">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>Évolution prévue sur 24 heures</span>
          <span className="tabular-nums">Moyenne : {data?.mean_pm25 ?? 27.2} µg/m³</span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="hour"
                stroke="#8E8B82"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value as number;
                    const alert = getAlertLevel(val);
                    return (
                      <div className="bg-sand-surface hairline px-2.5 py-1 text-xs text-ink tabular-nums shadow-sm">
                        <span>{payload[0].payload.hour} · </span>
                        <strong style={{ color: alert.color }}>
                          {val.toFixed(1).replace(".", ",")} µg/m³
                        </strong>
                        <span className="text-ink-muted ml-1">({alert.label})</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="pm25"
                stroke="#B5532A"
                strokeWidth={1.8}
                fill="#B5532A"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2">
          <Link
            href="/previsions"
            className="inline-block bg-terracotta hover:bg-terracotta-hover text-sand-surface px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Voir les prévisions détaillées
          </Link>
        </div>
      </section>

      {/* ── 4. Silhouette SVG séparateur ── */}
      <section className="-mx-4 sm:-mx-8 mt-12">
        <DakarSilhouette />
      </section>

      {/* ── 5. Récit éditorial : fond teal sombre ── */}
      <section className="-mx-4 sm:-mx-8 bg-teal-deep px-4 sm:px-8 py-12">
        <div className="max-w-2xl space-y-6">
          <h2 className="font-serif text-2xl font-normal text-sand">
            Pourquoi Dakar respire mal
          </h2>

          <div className="space-y-4 text-sm text-sand/70 leading-relaxed">
            <p>
              En 2024, la concentration moyenne annuelle à Dakar atteignait environ{" "}
              <strong className="text-sand font-medium tabular-nums">
                {ALIOUNE_FACTS.annualMean2024} µg/m³
              </strong>{" "}
              (selon les synthèses IQAir), soit{" "}
              <strong className="text-sand font-medium">{ALIOUNE_FACTS.ratioWhoAnnual}</strong> le
              seuil annuel recommandé par l'OMS (5 µg/m³ par an, 15 µg/m³ sur 24 h).
            </p>

            <p>
              D'où proviennent ces particules fines ? Les ordres de grandeur documentés lors de la
              campagne de saison sèche de 2009 mettent en évidence un mélange spécifique à la
              presqu'île :
            </p>

            <ul className="divide-y divide-sand/10 text-xs py-1">
              {ALIOUNE_FACTS.sources2009Campaign.map((src, i) => (
                <li key={i} className="py-2 flex items-baseline justify-between gap-4">
                  <span className="text-sand font-medium">{src.label}</span>
                  <span className="text-sand/50">{src.note}</span>
                  <span className="tabular-nums font-medium text-ochre shrink-0">{src.share}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-sand/40">
              * Ordres de grandeur issus de la campagne de saison sèche 2009 (source : Alioune Badara Sarr).
            </p>

            <div className="pt-2 space-y-2">
              <h3 className="font-serif text-base text-sand font-normal">
                Deux régimes saisonniers très marqués
              </h3>
              <p>
                <strong className="text-sand/90">De novembre à mars :</strong> la saison sèche correspond
                aux pics de pollution (maximum entre décembre et février). L'Harmattan, vent chaud et sec
                de nord-est, transporte d'épaisses brumes sèches de poussière saharienne.
              </p>
              <p>
                <strong className="text-sand/90">De juillet à septembre :</strong> pendant l'hivernage,
                les précipitations lessivent l'air et les flux maritimes d'ouest réduisent nettement les
                teneurs en poussières.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Espacement final ── */}
      <div className="h-12" />
    </div>
  );
}
