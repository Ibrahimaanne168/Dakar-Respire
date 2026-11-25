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
      authors: "Sow, B., Tchanche, B., Fall, I., Souaré, S., & Mbow-Diokhané, A.",
      title: "Monitoring of Atmospheric Pollutant Concentrations in the City of Dakar, Senegal",
      journal: "Open Journal of Air Pollution, 10, 18-30 (2021)",
      note: "Données CGQA : PM10 (120-180 µg/m³) et PM2.5 (25-48 µg/m³). Fort contraste saison sèche (nov-mai) vs pluies (juin-oct). DOI: 10.4236/ojap.2021.101002.",
    },
    {
      authors: "Gueye, A., et al.",
      title: "On the Application of Long Short-Term Memory Neural Network for Daily Forecasting of PM2.5 in Dakar, Senegal",
      journal: "Sustainability, 17(12), 5421 (2025)",
      note: "Benchmark académique Dakar (station Bel Air sur 4 ans) : LSTM atteint RMSE = 3,2 µg/m³ vs ARIMA = 6,8 µg/m³. Prévision jusqu'à J+7. DOI: 10.3390/su17125421.",
    },
    {
      authors: "Léon, J.-F., Martiny, N., & Merlet, S.",
      title: "A Multi Linear Regression Model to Derive Dust PM10 in the Sahel Using AERONET AOD and CALIOP Products",
      journal: "Remote Sensing, 12(18), 3099 (2020)",
      note: "Sites de M'Bour (Sénégal), Banizoumbou et Cinzana : l'AOD satellitaire seule n'explique que R² = 0,15 au sol ; l'ajout du profil vertical CALIOP élève le R² à 0,75. DOI: 10.3390/rs12183099.",
    },
    {
      authors: "Toure, N. O., et al.",
      title: "Observed and Modeled Seasonal Air Quality and Respiratory Health in Senegal During 2015 and 2016",
      journal: "GeoHealth, 3(12), 423-442 (2019)",
      note: "Couplage mesures sol, satellite et modèle WRF. Poussières de décembre à février et impact sanitaire respiratoire. DOI: 10.1029/2019GH000214.",
    },
    {
      authors: "Source Apportionment Dakar & Bamako",
      title: "Source Apportionment of Ambient Particulate Matter in Two Western African Urban Sites",
      journal: "Atmosphere, 14(4), 684 (2023)",
      note: "Analyses PCA et PMF pour différencier le trafic routier, les poussières minérales et les émissions locales.",
    },
    {
      authors: "Organisation mondiale de la Santé (OMS)",
      title: "WHO Global Air Quality Guidelines (Lignes directrices mondiales)",
      journal: "Rapport OMS 2021",
      note: "Seuils sanitaires de référence : PM2.5 = 15 µg/m³ (24h) et 5 µg/m³ (annuel) ; PM10 = 45 µg/m³ (24h) et 15 µg/m³ (annuel).",
    },
    {
      authors: "Association Sénégalaise de Normalisation (ASN) & CGQA",
      title: "Norme sénégalaise NS 05-062 sur la pollution atmosphérique & Formule IQA",
      journal: "Référence réglementaire nationale",
      note: "Formule officielle IQA = (C / C_limite) × 100. Seuils : <100 Bon, 100-150 Moyen, 150-200 Mauvais, >200 Très Mauvais, >300 Alerte d'urgence.",
    },
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
    role: "Données météorologiques NASA POWER (T2M, RH2M, WS10M, WD10M, PRECTOTCORR)",
    status: "Reçu (16 584 heures valides 2025–2026)",
    fileTarget: "data/raw/meteo_dakar_2025_2026.csv",
  },
  {
    name: "Papa Ibrahima Samb",
    role: "Consolidation, nettoyage et production du fichier propre final",
    status: "À venir (emplacement prêt : donnees_propres.csv)",
    fileTarget: "donnees/donnees_propres.csv",
  },
  {
    name: "Sayon Sidibé",
    role: "Recherche scientifique, seuils réglementaires (CGQA / OMS) et bibliographie",
    status: "Reçu (Documenté & Validé)",
    fileTarget: "donnees/RECHERCHE SCIENTIFIQUE COMPLEMENTAIRE.docx",
  },
];
