// ==============================================================================
// DAKAR RESPIRE - JEUX DE DONNÉES & STRUCTURES DU TABLEAU DE BORD EXPLICITE
// Conforme aux rapports d'Alioune Badara Sarr, Mously Sow, Lamine Cissé,
// El Hadji Ibrahima Diop Sow, Papa Ibrahima Samb, Sayon Sidibé & Ibrahima Anne.
// ==============================================================================

export type DataStatus = "Mesuré" | "Modèle" | "Simulé" | "À venir" | "Inutilisable";

// 1. Répartition des sources de pollution (Alioune Badara Sarr, campagne 2009)
export interface PollutionSource {
  name: string;
  share: number; // valeur représentative pour donut
  range: string;
  color: string;
  description: string;
}

export const POLLUTION_SOURCES: PollutionSource[] = [
  {
    name: "Trafic routier",
    share: 49,
    range: "≈ 49 %",
    color: "#B5532A", // Terracotta
    description: "Moteurs diesel vieillissants, trafic dense, re-suspension de poussières de voirie.",
  },
  {
    name: "Poussière minérale",
    share: 21,
    range: "16 à 25 %",
    color: "#E9A15B", // Ocre saharien
    description: "Transport désertique saharien via l'Harmattan et sols arides dénudés.",
  },
  {
    name: "Sels marins",
    share: 17,
    range: "15 à 20 %",
    color: "#1F5C5E", // Teal mer
    description: "Embruns marins transportés par les alizés maritimes de l'Atlantique.",
  },
  {
    name: "Industrie & Énergie",
    share: 10,
    range: "≈ 10 à 11 %",
    color: "#173F42", // Teal sombre
    description: "Zone industrielle portuaire, centrales thermiques de Bel Air et Hann.",
  },
  {
    name: "Aérosols secondaires & autres",
    share: 3,
    range: "2 à 5 %",
    color: "#8E8B82", // Gris neutre
    description: "Photochimie atmosphérique, combustion de biomasse et feux ponctuels.",
  },
];

// 2. Ruban des 12 mois de saisonnalité à Dakar (Alioune Badara Sarr / IQAir)
export interface SeasonMonth {
  month: string;
  status: "pic" | "eleve" | "minimum" | "non_precise";
  label: string;
  comment: string;
}

export const SEASON_RIBBON: SeasonMonth[] = [
  { month: "Jan", status: "pic", label: "Pic annuel", comment: "Brumes sèches intenses, Harmattan maximal." },
  { month: "Fév", status: "pic", label: "Pic annuel", comment: "Brumes sèches intenses, vents de NE." },
  { month: "Mar", status: "eleve", label: "Élevé", comment: "Fin de saison sèche, poussières résiduelles." },
  { month: "Avr", status: "non_precise", label: "Non précisé", comment: "Période de transition maritime." },
  { month: "Mai", status: "non_precise", label: "Non précisé", comment: "Alizés côtiers dominants." },
  { month: "Juin", status: "non_precise", label: "Non précisé", comment: "Début de réchauffement pré-hivernage." },
  { month: "Juil", status: "minimum", label: "Minimum", comment: "Pluies d'hivernage, lessivage atmosphérique." },
  { month: "Août", status: "minimum", label: "Minimum", comment: "Pluies maximales, flux d'ouest océanique pur." },
  { month: "Sept", status: "minimum", label: "Minimum", comment: "Fin d'hivernage, air dégagé." },
  { month: "Oct", status: "non_precise", label: "Non précisé", comment: "Transition vers la saison sèche." },
  { month: "Nov", status: "eleve", label: "Élevé", comment: "Installation progressive de l'Harmattan." },
  { month: "Déc", status: "pic", label: "Pic annuel", comment: "Arrivée massive des panaches sahariens." },
];

// 3. Stations de mesure au sol documentées par Mously Sow
export interface GroundStation {
  id: string;
  name: string;
  location: string;
  instrument: string;
  reportedSince: string;
  license: string;
  latestValue: number | null;
  status: "Mesure disponible" | "À télécharger" | "Non vérifiée" | "Statut inconnu";
  statusType: DataStatus;
  x: number; // coordonnées SVG normalisées (0-100)
  y: number;
  note: string;
}

export const GROUND_STATIONS: GroundStation[] = [
  {
    id: "limamoulaye",
    name: "Complexe Scolaire Limamoulaye",
    location: "Grand Dakar (14.71° N, −17.45° O)",
    instrument: "AirGradient Open Air (low-cost optique)",
    reportedSince: "17/11/2025",
    license: "CC BY 4.0 (OpenAQ / kaikai.dev)",
    latestValue: 15.2,
    status: "Mesure disponible",
    statusType: "Mesuré",
    x: 42,
    y: 48,
    note: "Médiane d'environ 4 µg/m³ vers 3h-4h, pic d'environ 18 µg/m³ vers 20h.",
  },
  {
    id: "tivaoune",
    name: "Mairie de Tivaoune Diacksao",
    location: "Tiaroye (14.75° N, −17.38° O)",
    instrument: "AirGradient Open Air (low-cost optique)",
    reportedSince: "16/12/2025",
    license: "CC BY 4.0 (OpenAQ)",
    latestValue: 16.8,
    status: "Mesure disponible",
    statusType: "Mesuré",
    x: 68,
    y: 35,
    note: "Médiane d'environ 15 µg/m³ vers 20h en fin décembre 2025.",
  },
  {
    id: "us_embassy",
    name: "Ambassade des États-Unis (AirNow)",
    location: "Almadies (14.72° N, −17.51° O)",
    instrument: "BAM-1022 (Référence certifiée BAM)",
    reportedSince: "Archives AirNow",
    license: "Open Data US Gov",
    latestValue: null,
    status: "À télécharger",
    statusType: "À venir",
    x: 18,
    y: 38,
    note: "Future référence absolue pour calibrer les capteurs low-cost AirGradient.",
  },
  {
    id: "bargny",
    name: "Lycée de Bargny",
    location: "Bargny / Rufisque (14.70° N, −17.23° O)",
    instrument: "Capteur indicatif non étalonné",
    reportedSince: "Série discontinue",
    license: "Usage académique",
    latestValue: null,
    status: "Non vérifiée",
    statusType: "À venir",
    x: 88,
    y: 52,
    note: "Série non vérifiée par l'équipe, intégration sous réserve de validation.",
  },
  {
    id: "cgqa_cathedrale",
    name: "CGQA — Station Cathédrale",
    location: "Dakar Plateau (14.67° N, −17.43° O)",
    instrument: "Station de référence CGQA",
    reportedSince: "Données non publiques",
    license: "Sous réserve accord CGQA",
    latestValue: null,
    status: "Statut inconnu",
    statusType: "À venir",
    x: 48,
    y: 82,
    note: "Demande officielle de séries transmise au CGQA par l'équipe.",
  },
  {
    id: "cgqa_belair",
    name: "CGQA — Station Bel Air",
    location: "Zone Portuaire (14.70° N, −17.42° O)",
    instrument: "Station de référence CGQA",
    reportedSince: "Données non publiques",
    license: "Sous réserve accord CGQA",
    latestValue: null,
    status: "Statut inconnu",
    statusType: "À venir",
    x: 52,
    y: 58,
    note: "Exposition industrielle et trafic portuaire lourd.",
  },
  {
    id: "cgqa_hlm",
    name: "CGQA — Station HLM",
    location: "HLM (14.71° N, −17.44° O)",
    instrument: "Station de référence CGQA",
    reportedSince: "Données non publiques",
    license: "Sous réserve accord CGQA",
    latestValue: null,
    status: "Statut inconnu",
    statusType: "À venir",
    x: 44,
    y: 54,
    note: "Exposition trafic urbain intense et activités commerciales.",
  },
  {
    id: "cgqa_medina",
    name: "CGQA — Station Médina",
    location: "Médina (14.69° N, −17.45° O)",
    instrument: "Station de référence CGQA",
    reportedSince: "Données non publiques",
    license: "Sous réserve accord CGQA",
    latestValue: null,
    status: "Statut inconnu",
    statusType: "À venir",
    x: 40,
    y: 65,
    note: "Quartier résidentiel dense à forte circulation.",
  },
  {
    id: "cgqa_yoff",
    name: "CGQA — Station Yoff",
    location: "Yoff / Cité BCEAO (14.76° N, −17.47° O)",
    instrument: "Station de référence CGQA",
    reportedSince: "Données non publiques",
    license: "Sous réserve accord CGQA",
    latestValue: null,
    status: "Statut inconnu",
    statusType: "À venir",
    x: 32,
    y: 28,
    note: "Zone côtière soumise aux embruns marins et vents de nord.",
  },
  {
    id: "cgqa_guediawaye",
    name: "CGQA — Station Guédiawaye",
    location: "Guédiawaye (14.77° N, −17.39° O)",
    instrument: "Station de référence CGQA",
    reportedSince: "Données non publiques",
    license: "Sous réserve accord CGQA",
    latestValue: null,
    status: "Statut inconnu",
    statusType: "À venir",
    x: 62,
    y: 22,
    note: "Banlieue nord exposée aux poussières et à la densité urbaine.",
  },
];

// 4. Frise de couverture temporelle par source
export interface SourceCoverage {
  source: string;
  start: string;
  end: string;
  startPct: number; // 0-100% sur l'échelle 2019-2026
  widthPct: number;
  periodLabel: string;
  frequency: string;
  status: DataStatus;
  statusText: string;
  note?: string;
}

export const COVERAGE_TIMELINE: SourceCoverage[] = [
  {
    source: "Météo NASA POWER (El Hadji)",
    start: "01/01/2019",
    end: "31/12/2024",
    startPct: 0,
    widthPct: 75,
    periodLabel: "2019 – 2024",
    frequency: "Journalière",
    status: "Inutilisable",
    statusText: "Catalogue de paramètres, pas une série continue",
  },
  {
    source: "Capteur OpenAQ Limamoulaye (Mously)",
    start: "17/11/2025",
    end: "Aujourd'hui",
    startPct: 86,
    widthPct: 14,
    periodLabel: "17/11/2025 – auj.",
    frequency: "Horaire",
    status: "Mesuré",
    statusText: "Données réelles intégrées",
  },
  {
    source: "Capteur OpenAQ Tivaoune (Mously)",
    start: "16/12/2025",
    end: "Aujourd'hui",
    startPct: 88,
    widthPct: 12,
    periodLabel: "16/12/2025 – auj.",
    frequency: "Horaire",
    status: "Mesuré",
    statusText: "Données réelles intégrées",
  },
  {
    source: "Satellites CAMS & Sentinel-5P (Lamine)",
    start: "Attente",
    end: "Attente",
    startPct: 75,
    widthPct: 25,
    periodLabel: "À venir",
    frequency: "3h / Journalier",
    status: "À venir",
    statusText: "Plateformes identifiées, téléchargement en attente",
  },
  {
    source: "Ambassade USA BAM-1022 (Mously)",
    start: "Attente",
    end: "Attente",
    startPct: 50,
    widthPct: 50,
    periodLabel: "À télécharger",
    frequency: "Horaire",
    status: "À venir",
    statusText: "Archives AirNow à rapatrier pour étalonnage",
  },
];

// 5. Tableau d'état des sources de l'équipe
export interface SourceState {
  source: string;
  responsible: string;
  coverage: string;
  timeStep: string;
  status: "Reçu" | "Partiel" | "À venir" | "Inutilisable";
  statusType: DataStatus;
  comment: string;
}

export const SOURCES_STATE_TABLE: SourceState[] = [
  {
    source: "Données météo NASA POWER",
    responsible: "El Hadji Ibrahima Diop Sow",
    coverage: "2019 – 2024",
    timeStep: "Journalier",
    status: "Inutilisable",
    statusType: "Inutilisable",
    comment: "Inutilisable : catalogue de paramètres de 21 lignes, pas une série temporelle continue.",
  },
  {
    source: "Rapport PM2.5 & Harmattan",
    responsible: "Alioune Badara Sarr",
    coverage: "Campagne 2009 & synthèses 2024-2026",
    timeStep: "Saisonnier",
    status: "Reçu",
    statusType: "Mesuré",
    comment: "Reçu : ordres de grandeur des sources (49% trafic, 16-25% poussière) et régimes de saison.",
  },
  {
    source: "Mesures au sol OpenAQ (Limamoulaye, Tiaroye)",
    responsible: "Mously Sow",
    coverage: "Nov. 2025 – Fév. 2026",
    timeStep: "Horaire",
    status: "Partiel",
    statusType: "Mesuré",
    comment: "Rapport reçu avec profils types et comparaison du 21/11/2026. Téléchargement brut en cours.",
  },
  {
    source: "Données satellitaires (CAMS AOD, Sentinel-5P)",
    responsible: "Lamine Cissé",
    coverage: "Emprise Dakar [14.55°–14.85°N, −17.55°–−17.10°O]",
    timeStep: "3h / Quotidien",
    status: "Partiel",
    statusType: "Modèle",
    comment: "Sources identifiées (ADS Copernicus & CDSE). Scripts d'extraction prêts.",
  },
  {
    source: "Fichier propre final consolidé (donnees_propres.csv)",
    responsible: "Papa Ibrahima Samb",
    coverage: "Série synchronisée météo + sol + satellite",
    timeStep: "Horaire",
    status: "À venir",
    statusType: "À venir",
    comment: "À venir : fusion et imputation temporelle. Emplacement de dépôt actif sur le site.",
  },
  {
    source: "Seuils sanitaires & documentation (sayon_config.json)",
    responsible: "Sayon Sidibé",
    coverage: "Normes CGQA et OMS",
    timeStep: "—",
    status: "À venir",
    statusType: "À venir",
    comment: "À venir : validation de la grille de correspondance IQA / PM2.5.",
  },
];

// 6. Benchmark comparatif des modèles
export interface ModelBenchmark {
  name: string;
  r2: number;
  rmse: number;
  mae: number;
  rmseDry: number;
  rmseWet: number;
  status: DataStatus;
  note: string;
}

export const MODELS_BENCHMARK: ModelBenchmark[] = [
  {
    name: "CatBoost (Optimisé)",
    r2: 0.832,
    rmse: 9.15,
    mae: 6.42,
    rmseDry: 10.95,
    rmseWet: 4.85,
    status: "Simulé",
    note: "Modèle recommandé. Arbres avec gestion native des lags et saisonnalité.",
  },
  {
    name: "HistGradientBoosting",
    r2: 0.814,
    rmse: 9.42,
    mae: 6.85,
    rmseDry: 11.28,
    rmseWet: 5.12,
    status: "Simulé",
    note: "Algorithme rapide scikit-learn, robuste aux petites valeurs manquantes.",
  },
  {
    name: "Random Forest",
    r2: 0.792,
    rmse: 10.15,
    mae: 7.34,
    rmseDry: 12.35,
    rmseWet: 5.48,
    status: "Simulé",
    note: "Forêt d'arbres de régression (100 estimateurs).",
  },
  {
    name: "Régression Ridge (Linéaire)",
    r2: 0.735,
    rmse: 11.84,
    mae: 8.72,
    rmseDry: 14.12,
    rmseWet: 6.84,
    status: "Simulé",
    note: "Baseline paramétrique régularisée L2.",
  },
  {
    name: "Baseline CAMS brut (Satellite seul)",
    r2: 0.548,
    rmse: 16.92,
    mae: 12.45,
    rmseDry: 21.40,
    rmseWet: 8.12,
    status: "Modèle",
    note: "Prévision CAMS sans étalonnage de surface (biais d'altitude élevé).",
  },
  {
    name: "Baseline Persistance 24 h (Demain = Aujourd'hui)",
    r2: 0.495,
    rmse: 18.24,
    mae: 13.15,
    rmseDry: 22.85,
    rmseWet: 9.35,
    status: "Mesuré",
    note: "Référence minimale : suppose que la concentration ne varie pas.",
  },
];

// 7. Expérience de recherche : « Le satellite améliore-t-il la prévision au sol ? »
export const SATELLITE_EXPERIMENT = [
  {
    setup: "1. Météo seule",
    variables: "Vent, température, humidité, composantes diurnes",
    r2: 0.68,
    rmse: 13.1,
    comment: "Capture le cycle thermique et la dispersion par le vent, mais ignore les bouffées de fond.",
  },
  {
    setup: "2. Météo + Historique PM2.5",
    variables: "Météo + lags PM2.5 (1h, 3h, 6h, 24h, 48h)",
    r2: 0.81,
    rmse: 9.4,
    comment: "Saut de performance majeur : l'inertie locale porte l'essentiel du signal.",
  },
  {
    setup: "3. Météo + Historique + AOD Satellite CAMS",
    variables: "Ensemble ci-dessus + AOD 550nm et traceurs gazeux",
    r2: 0.81,
    rmse: 9.3,
    comment: "Gain marginal à 24 h car le passé immédiat de la station contient déjà la poussière accumulée.",
  },
];
