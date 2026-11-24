// ==============================================================================
// PROJET DAKAR RESPIRE - CONFIGURATION & SEUILS SANITAIRES
// Palette sourde : vert sourd, ocre, terre cuite, rouge brique
// ==============================================================================

export interface AlertLevel {
  min: number;
  max: number;
  color: string;
  label: string;
  shortAdvice: string;
  advice: string;
}

export const ALERT_LEVELS: Record<string, AlertLevel> = {
  BON: {
    min: 0,
    max: 15,
    color: "#3F7D58", // Vert sourd
    label: "Bon",
    shortAdvice: "Air sain pour tous",
    advice: "Qualité de l'air satisfaisante. Aucune précaution requise pour les activités extérieures.",
  },
  MOYEN: {
    min: 15,
    max: 35,
    color: "#C99A1E", // Ocre / jaune sourd
    label: "Moyen",
    shortAdvice: "Sensibilité légère",
    advice: "Les personnes vulnérables (enfants, asthmatiques) peuvent réduire les efforts prolongés en plein air.",
  },
  MAUVAIS: {
    min: 35,
    max: 55,
    color: "#D2691E", // Terre d'orange sourde
    label: "Mauvais",
    shortAdvice: "Effets sensibles",
    advice: "Réduire les activités physiques intenses en extérieur. Port du masque conseillé aux personnes fragiles.",
  },
  TRES_MAUVAIS: {
    min: 55,
    max: 1000,
    color: "#A8372C", // Rouge brique sourd
    label: "Très mauvais",
    shortAdvice: "Alerte sanitaire",
    advice: "Fermer les ouvertures et limiter les déplacements non essentiels, particulièrement lors des brumes de poussière.",
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
