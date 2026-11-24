import React from "react";

export default function MethodePage() {
  return (
    <article className="max-w-2xl mx-auto space-y-10 text-ink leading-relaxed">
      {/* En-tête éditorial */}
      <header className="space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-ink">
          Comment fonctionne la prévision
        </h1>
        <p className="text-base text-ink-muted leading-normal">
          Dakar subit régulièrement des pics de particules fines sous l'effet des poussières du Sahara et de l'activité urbaine. Avec peu de capteurs in situ, le site s'appuie sur la météo et les satellites d'observation pour anticiper les concentrations de la journée.
        </p>
      </header>

      {/* Section 1 : Sources de données */}
      <section className="space-y-3 pt-4 hairline-t">
        <h2 className="font-serif text-xl font-normal text-ink">
          Les sources de données
        </h2>
        <p className="text-sm text-ink-muted">
          Trois sources ouvertes sont combinées :
        </p>
        <ul className="text-sm space-y-2 list-disc list-inside text-ink-muted">
          <li>
            <strong className="text-ink">La météo (NASA POWER) :</strong> vitesse et direction du vent, humidité de l'air et température à deux mètres. Ces variables renseignent sur le transport et la dispersion des particules.
          </li>
          <li>
            <strong className="text-ink">L'observation satellitaire (Copernicus CAMS) :</strong> épaisseur optique des aérosols (AOD), qui estime la quantité globale de poussières dans l'atmosphère.
          </li>
          <li>
            <strong className="text-ink">Les mesures au sol (CGQA Dakar) :</strong> stations de référence qui enregistrent les PM2.5 réels et permettent d'étalonner les modèles mathématiques.
          </li>
        </ul>
      </section>

      {/* Section 2 : Ce que le site ne sait pas faire (honnêteté scientifique) */}
      <section className="space-y-3 pt-4 hairline-t">
        <h2 className="font-serif text-xl font-normal text-ink">
          Ce que le modèle ne sait pas faire
        </h2>
        <p className="text-sm text-ink-muted">
          Pour interpréter correctement les chiffres, plusieurs limites concrètes doivent être gardées en tête :
        </p>

        <div className="space-y-3 text-sm text-ink-muted">
          <p>
            <strong className="text-ink">1. Le satellite ne mesure pas le sol.</strong> Les instruments spatiaux mesurent l'ensemble de la colonne d'air entre le sol et l'espace. Une poussière qui vole à trois kilomètres d'altitude est vue par le satellite, même si les habitants ne la respirent pas.
          </p>
          <p>
            <strong className="text-ink">2. L'humidité fausse les capteurs bon marché.</strong> Près des côtes (Almadies, Yoff), lorsque l'humidité dépasse 80 %, les micro-gouttelettes d'eau gonflent les particules optiques et peuvent faire surestimer la pollution réelle.
          </p>
          <p>
            <strong className="text-ink">3. Les tempêtes brutales de poussière sont lissées.</strong> Les brusques bouffées d'Harmattan qui s'abattent en une heure ou deux sont souvent atténuées par les modèles statistiques, qui privilégient la régularité.
          </p>
          <p>
            <strong className="text-ink">4. La météo passée est un modèle de réanalyse.</strong> Les données historiques de vent et de température proviennent de réanalyses physiques globales, pas de thermomètres situés dans chaque quartier de la ville.
          </p>
        </div>
      </section>

      {/* Section 3 : Le vent et la presqu'île */}
      <section className="space-y-3 pt-4 hairline-t">
        <h2 className="font-serif text-xl font-normal text-ink">
          La presqu'île et les deux régimes de vent
        </h2>
        <p className="text-sm text-ink-muted">
          Dakar avance de trente kilomètres dans l'océan Atlantique. Cette situation géographique expose la ville à deux flux opposés :
        </p>
        <p className="text-sm text-ink-muted">
          L'<strong className="text-ink">Harmattan</strong>, vent d'est et de nord-est, chaud et sec, amène les poussières minérales du désert. C'est lui qui provoque les alertes sanitaires les plus fortes. À l'inverse, l'<strong className="text-ink">alizé maritime</strong> d'ouest et de nord-ouest apporte de l'air océanique plus pur et ventile la ville.
        </p>
      </section>

      {/* Section 4 : Références et bibliographie */}
      <section className="space-y-2 pt-4 hairline-t text-xs text-ink-muted">
        <h3 className="font-serif text-sm font-normal text-ink">
          Références et travaux
        </h3>
        <ol className="space-y-1.5 list-decimal list-inside text-ink-subtle">
          <li>Centre de Gestion de la Qualité de l'Air (CGQA) de Dakar, Direction de l'Environnement et des Établissements Classés (DEEC).</li>
          <li>Copernicus Atmosphere Monitoring Service (CAMS), Service européen de surveillance de l'atmosphère.</li>
          <li>NASA POWER (Prediction of Worldwide Energy Resources), données météorologiques et solaires.</li>
          <li>Organisation Mondiale de la Santé (OMS), lignes directrices relatives à la qualité de l'air, 2021.</li>
        </ol>
      </section>
    </article>
  );
}
