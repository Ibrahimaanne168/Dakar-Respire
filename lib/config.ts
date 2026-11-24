// ==============================================================================
// PROJET DAKAR RESPIRE - CONFIGURATION, FAITS SCIENTIFIQUES & SEUILS
// Conforme aux recherches d'Alioune Badara Sarr, Mously Sow, Lamine Cissé,
// El Hadji Ibrahima Diop Sow, Papa Ibrahima Samb et Sayon Sidibé.
// ==============================================================================

export interface AlertLevel {
  min: number;
  max: number;
  iqaMin: number;
  iqaMax: number;
  color: string;
  label: string;
  shortAdvice: string;
  advice: string;
}

// Échelle officielle IQA du Centre de Gestion de la Qualité de l'Air (CGQA Dakar)
export const ALERT_LEVELS: Record<string, AlertLevel> = {
  BON: {
    min: 0,
    max: 15,
    iqaMin: 0,
    iqaMax: 50,
    color: "#3F7D58", // Vert sourd
    label: "Bon",
    shortAdvice: "Air sain",
    advice: "Qualité de l'air satisfaisante. Aucune précaution requise pour les activités extérieures.",
  },
  MOYEN: {
    min: 15,
    max: 35,
    iqaMin: 51,
    iqaMax: 100,
    color: "#C99A1E", // Ocre / jaune sourd
    label: "Moyen",
    shortAdvice: "Sensibilité légère",
    advice: "Les personnes vulnérables (enfants, asthmatiques) peuvent modérer les efforts intenses prolongés en plein air.",
  },
  MAUVAIS: {
    min: 35,
    max: 55,
    iqaMin: 101,
    iqaMax: 200,
    color: "#D2691E", // Terre d'orange sourde
    label: "Mauvais",
    shortAdvice: "Effets sensibles",
    advice: "Réduire les activités physiques intenses en extérieur. Port du masque conseillé pour les personnes fragiles.",
  },
  TRES_MAUVAIS: {
    min: 55,
    max: 1000,
    iqaMin: 201,
    iqaMax: 500,
    color: "#A8372C", // Rouge brique sourd
    label: "Très mauvais",
    shortAdvice: "Alerte sanitaire",
    advice: "Fermer les ouvertures et limiter les déplacements non essentiels, particulièrement lors des brumes de poussière saharienne.",
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
  bbox: {
    latMin: 14.55,
    latMax: 14.85,
    lonMin: -17.55,
    lonMax: -17.10,
  },
};

// Faits scientifiques issus des recherches d'Alioune Badara Sarr (ordres de grandeur)
export const ALIOUNE_FACTS = {
  annualMean2024: 22.3, // µg/m³ (IQAir)
  whoAnnualThreshold: 5.0, // µg/m³ par an (OMS 2021)
  who24hThreshold: 15.0, // µg/m³ sur 24h (OMS 2021)
  ratioWhoAnnual: "plus de 4 fois",
  sources2009Campaign: [
    { label: "Trafic routier", share: "environ 49 %", note: "moteurs diesel, re-suspension" },
    { label: "Poussière minérale", share: "16 à 25 %", note: "Harmattan et sols arides" },
    { label: "Sels marins", share: "15 à 20 %", note: "embruns de l'Atlantique" },
    { label: "Industrie", share: "environ 10 à 11 %", note: "zones portuaires et centrales" },
    { label: "Aérosols secondaires", share: "variable", note: "photochimie atmosphérique" },
  ],
  seasonality: {
    dry: "Novembre à mars (pics décembre à février) : l'Harmattan apporte la poussière du Sahara sous forme de brume sèche.",
    wet: "Juillet à septembre : les pluies d'hivernage lessivent l'air et ramènent les concentrations sous 25 µg/m³.",
  },
  references: [
    {
      authors: "Étude POLCA",
      title: "Pollution des capitales africaines (Bamako et Dakar)",
      journal: "Atmosphere, 2023",
      note: "Caractérisation physico-chimique des aérosols en Afrique de l'Ouest.",
    },
    {
      authors: "IQAir",
      title: "Dakar among top 10 most polluted cities in the world",
      journal: "Rapport 17/02/2026",
      note: "Classement et moyennes d'exposition aux particules fines.",
    },
    {
      authors: "Banque mondiale (Hoffmann & Milusheva)",
      title: "Designing Air Quality Measurement Systems in Data-Scarce Settings",
      journal: "World Bank Policy Research",
      note: "Méthodologie pour estimer l'air sans réseaux denses de capteurs physiques.",
    },
    {
      authors: "Étude RAMP",
      title: "Real-time Air Measurement Platform (Abidjan et Accra)",
      journal: "Publication 2024, DOI: d4ea00012a",
      note: "Étalonnage de micro-capteurs low-cost en climat tropical humide.",
    },
  ],
};

// Profil horaire documenté par Mously Sow
export const MOUSLY_FINDINGS = {
  stations: [
    {
      name: "Complexe Scolaire Limamoulaye",
      location: "Grand Dakar",
      device: "AirGradient Open Air",
      license: "CC BY 4.0 (via OpenAQ & kaikai.dev)",
      diurnalTrend: "Médiane d'environ 4 µg/m³ vers 3 h-4 h du matin, pic à environ 18 µg/m³ vers 20 h.",
    },
    {
      name: "Mairie Tivaoune Diacksao",
      location: "Tiaroye",
      device: "AirGradient Open Air",
      license: "CC BY 4.0 (via OpenAQ)",
      diurnalTrend: "Médiane d'environ 15 µg/m³ vers 20 h en fin décembre 2025.",
    },
  ],
  discrepancyExample2026: {
    date: "21/11/2026 au soir",
    iqair: "environ 30 µg/m³",
    worldAirMap: "29 µg/m³",
    limamoulayeMedian: "environ 15 µg/m³",
    reason: "Différence de méthode : modèles satellitaires globaux interpolés (IQAir / World Air Map) versus capteur optique de surface in situ (Limamoulaye).",
  },
  referenceTarget: "Ambassade des États-Unis (AirNow) — station de référence à télécharger en priorité.",
};

// Répartition des 7 membres de l'équipe (DOC-20261115-WA0029.pdf)
export const TEAM_MEMBERS = [
  {
    name: "Ibrahima Anne",
    role: "Modélisation statistique, apprentissage et interface web",
    status: "Opérationnel",
    fileTarget: "public/model/ & app/",
  },
  {
    name: "Alioune Badara Sarr",
    role: "Étude des PM2.5, poussières sahariennes et régimes de saison",
    status: "Reçu",
    fileTarget: "Dakar_Respire_PM25_Poussieres_Alioune.pdf",
  },
  {
    name: "Mously Sow",
    role: "Mesures réelles de stations au sol (OpenAQ, AirNow, CGQA)",
    status: "Rapport reçu (séries brutes en attente)",
    fileTarget: "data/raw/openaq_limamoulaye.csv",
  },
  {
    name: "Lamine Cissé",
    role: "Données satellitaires (Copernicus CAMS, Sentinel-5P TROPOMI)",
    status: "Sources documentées (fichiers NetCDF en attente)",
    fileTarget: "data/raw/cams_aod_dakar.csv",
  },
  {
    name: "El Hadji Ibrahima Diop Sow",
    role: "Données météorologiques NASA POWER",
    status: "Catalogue reçu (série horaire avec direction du vent en attente)",
    fileTarget: "data/raw/meteo_nasa_power_hourly.csv",
  },
  {
    name: "Papa Ibrahima Samb",
    role: "Consolidation, nettoyage et production du fichier propre final",
    status: "À venir (emplacement prêt : donnees_propres.csv)",
    fileTarget: "donnees/donnees_propres.csv",
  },
  {
    name: "Sayon Sidibé",
    role: "Recherche scientifique, seuils réglementaires et bibliographie",
    status: "À venir (fichier de configuration et références)",
    fileTarget: "lib/sayon_config.json",
  },
];
