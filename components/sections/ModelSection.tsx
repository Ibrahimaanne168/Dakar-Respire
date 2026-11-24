"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MODELS_BENCHMARK, SATELLITE_EXPERIMENT } from "@/lib/dashboardData";
import { ALIOUNE_FACTS } from "@/lib/config";
import DataMetadata from "@/components/DataMetadata";
import StatusBadge from "@/components/StatusBadge";
import { Award, ChevronDown, ChevronUp, BookOpen, AlertCircle, BarChart3 } from "lucide-react";

export default function ModelSection() {
  const [refsOpen, setRefsOpen] = useState(false);

  // Échantillon de validation (dernières 24h)
  const validationCurve = [
    { hour: "00h", reel: 21.0, prevu: 22.4, cams: 28.0 },
    { hour: "04h", reel: 14.5, prevu: 15.2, cams: 26.5 },
    { hour: "08h", reel: 24.0, prevu: 22.8, cams: 29.0 },
    { hour: "12h", reel: 28.5, prevu: 27.1, cams: 31.0 },
    { hour: "16h", reel: 31.0, prevu: 32.4, cams: 34.0 },
    { hour: "20h", reel: 35.5, prevu: 34.2, cams: 38.0 },
    { hour: "23h", reel: 26.0, prevu: 27.5, cams: 32.0 },
  ];

  return (
    <section id="modele" className="space-y-6 pt-6">
      {/* ── 1. Tableau de comparaison des modèles avec barres de RMSE ── */}
      <div className="dash-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sand-line/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
                Section ⑥ · Modélisation statistique & Preuve (Ibrahima Anne)
              </span>
              <StatusBadge status="Simulé" size="sm" />
            </div>
            <h2 className="font-serif text-2xl text-ink font-normal mt-1">
              Benchmark comparatif des algorithmes de prévision
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Évaluation rigoureuse sur découpage temporel continu avec distinction des saisons sèche et humide
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Award className="w-4 h-4 text-terracotta" />
            <span>Filière Mathématiques et Modélisation</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-sand-line text-ink-subtle font-normal">
                <th className="py-2.5 pr-4 font-normal">Méthode / Algorithme</th>
                <th className="py-2.5 pr-3 font-normal">R² (↑)</th>
                <th className="py-2.5 pr-3 font-normal">RMSE global (↓)</th>
                <th className="py-2.5 pr-3 font-normal">Erreur relative</th>
                <th className="py-2.5 pr-3 font-normal">Saison sèche (↓)</th>
                <th className="py-2.5 pr-3 font-normal">Saison pluies (↓)</th>
                <th className="py-2.5 font-normal">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-line/60">
              {MODELS_BENCHMARK.map((m, i) => {
                const isTop = i === 0;
                const rmseBarWidth = Math.min(100, Math.round((m.rmse / 25) * 100));

                return (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      isTop ? "bg-[#EAF3ED]/60 font-medium" : "hover:bg-sand-surface/60"
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-ink font-medium">{m.name}</span>
                        {isTop && (
                          <span className="text-[10px] bg-white border border-[#3F7D58]/40 text-[#24613B] px-1.5 py-0.2 rounded-full font-sans">
                            Recommandé
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-subtle font-normal">{m.note}</div>
                    </td>
                    <td className="py-3 pr-3 font-serif text-sm font-medium text-ink">
                      {m.r2.toFixed(3)}
                    </td>
                    <td className="py-3 pr-3 font-serif text-sm font-medium text-ink">
                      {m.rmse.toFixed(2)} µg/m³
                    </td>
                    <td className="py-3 pr-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-sand-line rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isTop ? "bg-[#3F7D58]" : "bg-terracotta"
                            }`}
                            style={{ width: `${rmseBarWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-ink-muted">{m.rmseDry.toFixed(1)} µg/m³</td>
                    <td className="py-3 pr-3 text-ink-muted">{m.rmseWet.toFixed(1)} µg/m³</td>
                    <td className="py-3">
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-sand-surface rounded-[12px] border border-sand-line text-xs text-ink-muted leading-relaxed">
          <strong className="text-ink font-medium">Comparaison avec la prévision du CGQA :</strong> Le Centre de Gestion de la Qualité de l'Air publie quotidiennement une prévision globale. Une demande officielle d'archives a été transmise pour évaluer nos résidus contre les leurs.
        </div>

        <DataMetadata
          unit="µg/m³ et R²"
          source="Pipeline d'évaluation hors ligne (ml/evaluate.py)"
          period="Jeu de test temporel indépendant (1 859 heures)"
          status="Simulé"
        />
      </div>

      {/* ── 2. Prévu contre mesuré (Courbe) & Expérience AOD Satellite ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prévu contre mesuré */}
        <div className="dash-card lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
            <div>
              <h3 className="font-serif text-base text-ink font-normal">
                Prévu contre mesuré (Dernières 24 h)
              </h3>
              <p className="text-xs text-ink-subtle">
                Série d'évaluation continue superposée au satellite CAMS brut
              </p>
            </div>
            <StatusBadge status="Simulé" size="sm" />
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={validationCurve} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="hour"
                  stroke="#8E8B82"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E4DCCB" }}
                />
                <YAxis
                  stroke="#8E8B82"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E4DCCB" }}
                  label={{
                    value: "µg/m³",
                    position: "insideTopLeft",
                    offset: 6,
                    fontSize: 10,
                    fill: "#8E8B82",
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white rounded-lg p-2.5 shadow-card border border-sand-line text-xs tabular-nums space-y-1">
                          <div className="font-medium text-ink-subtle">{payload[0].payload.hour}</div>
                          <div className="text-ink">Mesuré (sol) : <strong>{payload[0].value} µg/m³</strong></div>
                          <div className="text-terracotta">Prévu (modèle) : <strong>{payload[1]?.value} µg/m³</strong></div>
                          <div className="text-ink-subtle">CAMS brut : {payload[2]?.value} µg/m³</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="reel" name="Mesuré au sol" stroke="#1B1F23" strokeWidth={2.2} fillOpacity={0} />
                <Area type="monotone" dataKey="prevu" name="Prévu modèle" stroke="#B5532A" strokeWidth={2} strokeDasharray="4 2" fillOpacity={0} />
                <Area type="monotone" dataKey="cams" name="CAMS brut (satellite)" stroke="#8E8B82" strokeWidth={1.2} strokeDasharray="2 2" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-subtle pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#1B1F23]" /> Mesuré au sol
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-terracotta" /> Prévu par le modèle
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#8E8B82]" /> CAMS brut (satellite)
            </span>
          </div>

          <DataMetadata
            unit="µg/m³"
            source="Échantillon d'évaluation chronologique"
            status="Simulé"
          />
        </div>

        {/* Expérience : « Le satellite améliore-t-il la prévision ? » */}
        <div className="dash-card lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-terracotta" />
                <h3 className="font-serif text-base text-ink font-normal">
                  Question : Le satellite améliore-t-il la prévision ?
                </h3>
              </div>
              <StatusBadge status="Modèle" size="sm" />
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Nous avons confronté trois architectures d'entrée pour quantifier l'apport réel de l'AOD satellitaire à court terme :
            </p>

            <div className="space-y-3 pt-1">
              {SATELLITE_EXPERIMENT.map((exp, idx) => (
                <div key={idx} className="p-3 bg-sand-surface rounded-[12px] border border-sand-line space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-ink">{exp.setup}</span>
                    <span className="font-serif text-sm font-medium text-ink tabular-nums">
                      R² = {exp.r2.toFixed(2)} · RMSE {exp.rmse} µg
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-sand-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal"
                      style={{ width: `${Math.round(exp.r2 * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-ink-subtle">{exp.comment}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-ink-muted leading-relaxed border-t border-sand-line/50 pt-2">
              <strong>Résultat d'honnêteté :</strong> L'apport direct de l'AOD satellitaire à 24 h est marginal car la persistance locale et le cycle diurne captent déjà la majeure partie du signal.
            </p>
          </div>

          <DataMetadata
            source="Protocole expérimental ML Dakar Respire"
            status="Modèle"
          />
        </div>
      </div>

      {/* ── 3. Carte compacte « Ce que le modèle ne sait pas faire » & Références repliables ── */}
      <div className="dash-card space-y-4 bg-gradient-to-br from-white to-[#FAF6EE]">
        <div className="flex items-center justify-between pb-3 border-b border-sand-line/60">
          <div className="flex items-center gap-2 text-terracotta">
            <AlertCircle className="w-4 h-4" />
            <h3 className="font-serif text-lg text-ink font-normal">
              Ce que le modèle ne sait pas faire (Limites méthodologiques strictes)
            </h3>
          </div>
          <StatusBadge status="Modèle" size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-ink-muted">
          <div className="p-3 bg-white rounded-[12px] border border-sand-line/70 space-y-1">
            <strong className="font-medium text-ink block">1. Le satellite ne mesure pas le sol respiré</strong>
            <p className="leading-relaxed">
              Les capteurs satellitaires intègrent une colonne optique verticale entière. Une poussière saharienne à 3 000 m d'altitude est comptabilisée par le satellite sans être inhalée par la population au sol.
            </p>
          </div>

          <div className="p-3 bg-white rounded-[12px] border border-sand-line/70 space-y-1">
            <strong className="font-medium text-ink block">2. L'humidité fausse les capteurs optiques low-cost</strong>
            <p className="leading-relaxed">
              En climat côtier (Almadies, Yoff), une humidité relative &gt; 80 % provoque le gonflement hygroscopique des micro-particules et entraîne une surestimation artificielle par les lasers d'AirGradient.
            </p>
          </div>

          <div className="p-3 bg-white rounded-[12px] border border-sand-line/70 space-y-1">
            <strong className="font-medium text-ink block">3. Les tempêtes brutales de poussière sont lissées</strong>
            <p className="leading-relaxed">
              Les panaches violents d'Harmattan (&gt; 150 µg/m³) arrivant en moins de 2 heures sont statistiquement rares et sont fréquemment sous-estimés par les fonctions de perte MSE/RMSE.
            </p>
          </div>

          <div className="p-3 bg-white rounded-[12px] border border-sand-line/70 space-y-1">
            <strong className="font-medium text-ink block">4. Transparence sur le score de référence CatBoost</strong>
            <p className="leading-relaxed">
              Des chercheurs ont publié un R² de 0,931 à Dakar. Ce résultat d'excellence dépendait de stations continues étalonnées ; notre équipe ne promet pas le même niveau tant que le jeu final n'est pas consolidé.
            </p>
          </div>
        </div>

        {/* Références scientifiques repliables */}
        <div className="pt-2 border-t border-sand-line/60">
          <button
            onClick={() => setRefsOpen(!refsOpen)}
            className="text-xs text-ink hover:text-terracotta font-medium flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-terracotta" />
            <span>{refsOpen ? "Masquer les références scientifiques" : "Afficher les références bibliographiques (Alioune B. Sarr)"}</span>
            {refsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {refsOpen && (
            <ul className="divide-y divide-sand-line/60 text-xs mt-3 pt-2 border-t border-sand-line/40">
              {ALIOUNE_FACTS.references.map((ref, idx) => (
                <li key={idx} className="py-2.5 space-y-0.5">
                  <div className="font-medium text-ink">
                    {ref.authors} — <em>{ref.title}</em>
                  </div>
                  <div className="text-ink-muted text-[11px]">
                    {ref.journal} · <span className="text-ink-subtle">{ref.note}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
