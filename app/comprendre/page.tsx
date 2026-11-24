import React from "react";
import { ALIOUNE_FACTS, TEAM_MEMBERS } from "@/lib/config";

export default function ComprendrePage() {
  return (
    <article className="max-w-2xl mx-auto space-y-12 text-ink leading-relaxed">
      {/* En-tête éditorial */}
      <header className="space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-ink">
          Comprendre la démarche
        </h1>
        <p className="text-base text-ink-muted leading-normal">
          Dakar subit régulièrement des pics de particules fines sous l'effet des poussières du Sahara et du trafic urbain. Faute d'un réseau dense de stations au sol, le projet croise météo et satellites d'observation pour anticiper les concentrations de la journée.
        </p>
      </header>

      {/* 1. Les sources de données */}
      <section className="space-y-4 pt-4 hairline-t">
        <h2 className="font-serif text-2xl font-normal text-ink">
          Les sources de données
        </h2>
        <p className="text-sm text-ink-muted">
          Quatre sources ouvertes et documentées sont exploitées dans le projet :
        </p>

        <div className="space-y-3 text-sm text-ink-muted">
          <p>
            <strong className="text-ink">1. La météo (NASA POWER) :</strong> vitesse et direction du vent, température à deux mètres et humidité relative sur Dakar (14,6928° N, −17,4467° O). Ces variables gouvernent la dispersion atmosphérique et l'accumulation des particules.
          </p>
          <p>
            <strong className="text-ink">2. Les satellites (Copernicus CAMS & Sentinel-5P) :</strong> l'épaisseur optique des aérosols (AOD 550 nm) et les traceurs gazeux (UVAI, NO2, CO) pour suivre les panaches de poussière continentale au-dessus de l'Afrique de l'Ouest.
          </p>
          <p>
            <strong className="text-ink">3. Les stations au sol ouvertes (OpenAQ) :</strong> deux points de mesure réels équipés de capteurs AirGradient Open Air sous licence CC BY 4.0 — le <em>Complexe Scolaire Limamoulaye</em> (Grand Dakar) et la <em>Mairie de Tivaoune Diacksao</em> (Tiaroye), complétés prochainement par la station de référence de l'ambassade des États-Unis (AirNow).
          </p>
          <p>
            <strong className="text-ink">4. Le cadre réglementaire (Webinaire CGQA 2019) :</strong> l'échelle de calcul de l'Indice de la Qualité de l'Air (IQA) définie par le Centre de Gestion de la Qualité de l'Air (0–50 Bon, 51–100 Moyen, 101–200 Mauvais, &gt; 200 Très mauvais).
          </p>
        </div>
      </section>

      {/* 2. Ce que le modèle ne sait pas faire (honnêteté scientifique absolue) */}
      <section className="space-y-4 pt-6 hairline-t">
        <h2 className="font-serif text-2xl font-normal text-ink">
          Ce que le modèle ne sait pas faire
        </h2>
        <p className="text-sm text-ink-muted">
          Pour une lecture éclairée des résultats, quatre limites techniques incontournables doivent être explicitées :
        </p>

        <div className="space-y-3 text-sm text-ink-muted">
          <div className="p-3 bg-sand-surface hairline space-y-1">
            <strong className="text-ink font-medium">1. Le satellite ne mesure pas le sol</strong>
            <p>
              Les capteurs satellitaires (CAMS, Sentinel-5P) mesurent une colonne optique intégrée depuis le sol jusqu'au sommet de l'atmosphère. Une couche de poussière saharienne survolant Dakar à trois kilomètres d'altitude est visible par le satellite alors que les habitants ne la respirent pas au sol.
            </p>
          </div>

          <div className="p-3 bg-sand-surface hairline space-y-1">
            <strong className="text-ink font-medium">2. L'humidité fausse les capteurs bon marché</strong>
            <p>
              Les micro-capteurs optiques (AirGradient) mesurent par diffusion laser. En climat côtier (Almadies, Yoff), lorsque l'humidité relative dépasse 80 %, les micro-gouttelettes d'eau provoquent le gonflement hygroscopique des particules et conduisent à une surestimation artificielle des PM2.5.
            </p>
          </div>

          <div className="p-3 bg-sand-surface hairline space-y-1">
            <strong className="text-ink font-medium">3. Les tempêtes brutales de poussière sont lissées</strong>
            <p>
              Les bouffées soudaines d'Harmattan (&gt; 150 µg/m³) arrivant en moins de deux heures sont statistiquement difficiles à capturer et ont tendance à être sous-estimées par les algorithmes de régression.
            </p>
          </div>

          <div className="p-3 bg-sand-surface hairline space-y-1">
            <strong className="text-ink font-medium">4. La météo passée provient d'une réanalyse</strong>
            <p>
              Les données historiques de NASA POWER sont issues d'un modèle physique de réanalyse global, et non de stations météorologiques physiques installées dans chaque commune de Dakar.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Références bibliographiques (Alioune Badara Sarr) */}
      <section className="space-y-3 pt-6 hairline-t">
        <h2 className="font-serif text-2xl font-normal text-ink">
          Références scientifiques
        </h2>
        <ul className="divide-y divide-sand-line hairline-t hairline-b text-xs py-1 space-y-0.5">
          {ALIOUNE_FACTS.references.map((ref, i) => (
            <li key={i} className="py-2.5 space-y-0.5">
              <div className="font-medium text-ink">
                {ref.authors} — <em>{ref.title}</em>
              </div>
              <div className="text-ink-muted">
                {ref.journal} · <span className="text-ink-subtle">{ref.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Crédits de l'équipe (les 7 membres de DOC-20261115-WA0029.pdf) */}
      <section className="space-y-3 pt-6 hairline-t">
        <h2 className="font-serif text-2xl font-normal text-ink">
          L'équipe Dakar Respire
        </h2>
        <p className="text-xs text-ink-muted">
          Projet présenté au concours, filière Mathématiques et Modélisation (7 membres) :
        </p>

        <ul className="divide-y divide-sand-line hairline-t hairline-b text-xs py-1">
          {TEAM_MEMBERS.map((m, i) => (
            <li key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <strong className="text-ink font-medium">{m.name}</strong>
                <span className="text-ink-muted ml-2">· {m.role}</span>
              </div>
              <span className="text-[11px] text-ink-subtle shrink-0">{m.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
