"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { getAlertLevel, ALIOUNE_FACTS } from "@/lib/config";

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

  useEffect(() => {
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

  const currentPm25 = data?.current_pm25 ?? 28.5;
  const peakPm25 = data?.peak_pm25 ?? 34.0;
  const hourly = data?.hourly || [];
  const currentLevel = getAlertLevel(currentPm25);

  const sparklineData = hourly.map((h: any) => ({
    hour: `${h.hour}h`,
    pm25: h.pm25,
  }));

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. La scène 3D en grand, calme */}
      <section className="w-full h-[360px] sm:h-[440px]">
        <DakarScene3D
          pm25={currentPm25}
          hour={14}
          windSpeed={4.2}
          windDeg={45}
          isHarmattan={true}
        />
      </section>

      {/* 2. Le très grand chiffre, niveau IQA en mots et étiquette d'honnêteté */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-ink-muted">
            Dakar · Presqu'île du Cap-Vert
          </span>
          <span className="text-sand-line">·</span>
          <span className="text-[11px] text-ink-subtle">
            {isSynthetic ? "Données simulées" : "Données réelles"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-6">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-6xl sm:text-7xl font-normal text-ink tabular-nums">
              {currentPm25.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-base sm:text-lg text-ink-muted">µg/m³ PM2.5</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: currentLevel.color }}
            />
            <span className="font-serif text-2xl text-ink font-normal">
              {currentLevel.label}
            </span>
            <span className="text-xs text-ink-muted tabular-nums ml-1">
              (IQA {currentLevel.iqaMin}–{currentLevel.iqaMax})
            </span>
          </div>
        </div>

        <p className="text-base text-ink-muted max-w-xl">
          Pic attendu à 20 h :{" "}
          <strong className="text-ink font-medium tabular-nums">
            {peakPm25.toFixed(1).replace(".", ",")} µg/m³
          </strong>
          . Vents de nord-est (Harmattan) acheminant une brume sèche de poussière saharienne.
        </p>
      </section>

      {/* 3. Petit aperçu sobre de l'évolution sur 24 h */}
      <section className="space-y-2 pt-4 hairline-t">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>Évolution prévue sur 24 heures</span>
          <span className="tabular-nums">Moyenne : {data?.mean_pm25 ?? 27.2} µg/m³</span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="hour" stroke="#8E8B82" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value as number;
                    return (
                      <div className="bg-sand-surface hairline px-2.5 py-1 text-xs text-ink tabular-nums shadow-sm">
                        <span>{payload[0].payload.hour} : </span>
                        <strong>{val.toFixed(1).replace(".", ",")} µg/m³</strong>
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
                strokeWidth={1.5}
                fill="#B5532A"
                fillOpacity={0.08}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Récit : Pourquoi Dakar respire mal (recherches d'Alioune Badara Sarr) */}
      <section className="pt-6 hairline-t space-y-6 max-w-2xl">
        <h2 className="font-serif text-2xl font-normal text-ink">
          Pourquoi Dakar respire mal
        </h2>

        <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
          <p>
            En 2024, la concentration moyenne annuelle à Dakar atteignait environ{" "}
            <strong className="text-ink font-medium tabular-nums">{ALIOUNE_FACTS.annualMean2024} µg/m³</strong>{" "}
            (selon les synthèses IQAir), soit <strong className="text-ink font-medium">{ALIOUNE_FACTS.ratioWhoAnnual}</strong> le seuil annuel recommandé par l'Organisation Mondiale de la Santé (5 µg/m³ par an, et 15 µg/m³ sur 24 h).
          </p>

          <p>
            D'où proviennent ces particules fines ? Les ordres de grandeur documentés lors de la campagne de saison sèche de 2009 mettent en évidence un mélange spécifique à la presqu'île :
          </p>

          <ul className="divide-y divide-sand-line hairline-t hairline-b text-xs py-1">
            {ALIOUNE_FACTS.sources2009Campaign.map((src, i) => (
              <li key={i} className="py-2 flex items-baseline justify-between gap-4">
                <span className="text-ink font-medium">{src.label}</span>
                <span className="text-ink-subtle">{src.note}</span>
                <span className="tabular-nums font-medium text-ink shrink-0">{src.share}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-ink-subtle">
            * Ordres de grandeur issus de la campagne de saison sèche 2009 (source : Alioune Badara Sarr).
          </p>

          <div className="pt-2 space-y-2">
            <h3 className="font-serif text-base text-ink font-normal">
              Deux régimes saisonniers très marqués
            </h3>
            <p>
              <strong>De novembre à mars :</strong> la saison sèche correspond aux pics de pollution (maximum entre décembre et février). L'Harmattan, vent chaud et sec de nord-est, transporte d'épaisses brumes sèches de poussière saharienne qui stagnent sur la ville.
            </p>
            <p>
              <strong>De juillet à septembre :</strong> pendant l'hivernage, les précipitations lessivent l'air et les flux maritimes d'ouest réduisent nettement les teneurs en poussières.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Un seul bouton sobre */}
      <section className="pt-4">
        <Link
          href="/previsions"
          className="inline-block bg-terracotta hover:bg-terracotta-hover text-sand-surface px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Voir les prévisions
        </Link>
      </section>
    </div>
  );
}
