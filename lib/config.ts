// ==============================================================================
// PROJET DAKAR RESPIRE - CONFIGURATION GLOBALE TYPESCRIPT
// Responsable Modélisation & Interface : Ibrahima Anne
// ==============================================================================

export interface AlertLevel {
  min: number;
  max: number;
  color: string;
  label: string;
  iqaRange: string;
  description: string;
  recommandation: string;
}

export const ALERT_LEVELS: Record<string, AlertLevel> = {
  BON: {
    min: 0,
    max: 15,
    color: "#10B981", // Vert
    label: "Bon",
    iqaRange: "0 – 50",
    description: "Peu ou pas de risque sanitaire.",
    recommandation: "Qualité de l'air satisfaisante. Activités extérieures libres pour tous.",
  },
  MOYEN: {
    min: 15,
    max: 35,
    color: "#FBBF24", // Jaune
    label: "Moyen",
    iqaRange: "51 – 100",
    description: "Risques légers pour les personnes très vulnérables.",
    recommandation: "Les personnes sensibles (asthmatiques, jeunes enfants) doivent modérer les efforts intenses prolongés.",
  },
  MAUVAIS: {
    min: 35,
    max: 55,
    color: "#F97316", // Orange
    label: "Mauvais",
    iqaRange: "101 – 200",
    description: "Risque élevé pour les personnes sensibles. Effets ressentis par tous.",
    recommandation: "Réduire les activités sportives en plein air. Port du masque conseillé pour les personnes vulnérables.",
  },
  TRES_MAUVAIS: {
    min: 55,
    max: 1000,
    color: "#EF4444", // Rouge
    label: "Très Mauvais (Alerte)",
    iqaRange: "> 200",
    description: "Alerte sanitaire : toute la population est affectée.",
    recommandation: "Fermer les fenêtres, éviter toute sortie prolongée, port du masque filtrant fortement recommandé.",
  },
};

export function getAlertLevel(pm25: number): AlertLevel {
  if (pm25 <= 15) return ALERT_LEVELS.BON;
  if (pm25 <= 35) return ALERT_LEVELS.MOYEN;
  if (pm25 <= 55) return ALERT_LEVELS.MAUVAIS;
  return ALERT_LEVELS.TRES_MAUVAIS;
}

export const DAKAR_COORDINATES = {
  lat: 14.6928,
  lon: -17.4467,
  name: "Dakar, Sénégal (Presqu'île du Cap-Vert)",
};

export const SCIENTIFIC_LIMITS = [
  {
    title: "Mesures satellitaires ≠ Concentration au sol",
    desc: "L'AOD (Copernicus CAMS) et les gaz (Sentinel-5P) mesurent l'intégrale sur toute la colonne atmosphérique, jamais directement la teneur respirable au sol.",
  },
  {
    title: "Sensibilité hygrométrique des capteurs low-cost",
    desc: "Les capteurs optiques bon marché (AirGradient / OpenAQ) ont tendance à surestimer les PM2.5 en cas de forte humidité relative (> 80 %).",
  },
  {
    title: "Sous-estimation des tempêtes brutales de poussière",
    desc: "Les pics d'Harmattan (> 150 µg/m³) arrivent en quelques heures et sont souvent lissés par les algorithmes de régression statistique.",
  },
  {
    title: "Données NASA POWER = Modèle de réanalyse",
    desc: "Les variables météorologiques historiques issues de NASA POWER proviennent d'un modèle physique de réanalyse et non d'une station météo in situ.",
  },
];
