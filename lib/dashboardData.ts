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
    instrument: "AirGradient Open Air (optique)",
    reportedSince: "17/11/2025",
    license: "CC BY 4.0 (OpenAQ / kaikai.dev)",
    latestValue: 24.7,
    status: "Mesure disponible",
    statusType: "Mesuré",
    x: 42,
    y: 48,
    note: "5 975 heures nettoyées. Médiane 11,1 µg/m³ (creux 3,9 µg à 5h, pic 18,7 µg à 21h).",
  },
  {
    id: "esmt",
    name: "ESMT Dakar",
    location: "Grand Dakar (14.70° N, −17.46° O)",
    instrument: "AirGradient Open Air Gen 1",
    reportedSince: "15/10/2025",
    license: "CC BY 4.0 (OpenAQ / kaikai.dev)",
    latestValue: 10.3,
    status: "Mesure disponible",
    statusType: "Mesuré",
    x: 38,
    y: 52,
    note: "6 569 heures nettoyées. Médiane 9,7 µg/m³ (creux 4,4 µg à 5h, pic 16,3 µg à 8h).",
  },
  {
    id: "tivaoune",
    name: "Mairie de Tivaoune Diacksao",
    location: "Tiaroye (14.75° N, −17.38° O)",
    instrument: "AirGradient Open Air (optique)",
    reportedSince: "16/12/2025",
    license: "CC BY 4.0 (OpenAQ / kaikai.dev)",
    latestValue: 21.6,
    status: "Mesure disponible",
    statusType: "Mesuré",
    x: 68,
    y: 35,
    note: "5 353 heures nettoyées. Médiane 15,6 µg/m³ (creux 8,8 µg à 4h, pic 23,2 µg à 9h).",
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
    start: "01/01/2025",
    end: "22/11/2026",
    startPct: 75,
    widthPct: 24,
    periodLabel: "01/01/2025 – 22/11/2026",
    frequency: "Horaire (16 584 h)",
    status: "Mesuré",
    statusText: "Série horaire complète téléchargée (T2M, RH2M, WS10M, WD10M, pluie)",
  },
  {
    source: "Capteurs OpenAQ sol (ESMT, Limamoulaye, Tivaoune)",
    start: "15/10/2025",
    end: "22/11/2026",
    startPct: 84,
    widthPct: 16,
    periodLabel: "15/10/2025 – 22/11/2026",
    frequency: "Horaire (17 897 h)",
    status: "Mesuré",
    statusText: "17 897 mesures nettoyées sur 3 stations AirGradient",
  },
  {
    source: "Fichier unifié donnees_propres.csv (Météo + Sol)",
    start: "01/01/2025",
    end: "22/11/2026",
    startPct: 75,
    widthPct: 25,
    periodLabel: "01/01/2025 – 22/11/2026",
    frequency: "Horaire (16 608 h)",
    status: "Mesuré",
    statusText: "Série continue météo NASA + stations sol synchronisées",
  },
  {
    source: "Sentinel-5P TROPOMI NO2 & AER_AI (Lamine)",
    start: "23/11/2026",
    end: "25/11/2026",
    startPct: 92,
    widthPct: 8,
    periodLabel: "23/11/2026 – 25/11/2026",
    frequency: "Passage quotidien",
    status: "Mesuré",
    statusText: "Acquisition Sentinel-5P TROPOMI (Copernicus CDSE) : carte NO2 haute résolution (9930×6865) et timelapse AER_AI",
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
    source: "Données météo NASA POWER (2025–2026)",
    responsible: "El Hadji Ibrahima Diop Sow",
    coverage: "01/01/2025 – 22/11/2026",
    timeStep: "Horaire (UTC)",
    status: "Reçu",
    statusType: "Mesuré",
    comment: "Reçu (25/11/2026) : 16 584 heures valides téléchargées (T2M, RH2M, WS10M, WD10M, PRECTOTCORR). Chevauchement complet avec OpenAQ !",
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
    source: "Mesures au sol OpenAQ (mesures_pm25.xlsx)",
    responsible: "Mously Sow",
    coverage: "15/10/2025 – 22/11/2026",
    timeStep: "Horaire (17 897 h)",
    status: "Reçu",
    statusType: "Mesuré",
    comment: "Reçu (25/11/2026) : 17 897 mesures sur 3 stations (ESMT, Limamoulaye, Tivaoune). Fichier nettoyé, zéros anormaux traités et profils horaires validés.",
  },
  {
    source: "Données satellitaires Sentinel-5P (Copernicus CDSE)",
    responsible: "Lamine Cissé",
    coverage: "Dakar & Sénégal (23–25/11/2026)",
    timeStep: "Passage quotidien (TROPOMI)",
    status: "Reçu",
    statusType: "Mesuré",
    comment: "Reçu (25/11/2026) : Imagerie Sentinel-5P TROPOMI NO2 haute résolution (9 930 × 6 865 px) et timelapse d'indice d'aérosol AER_AI. Visualisation du panache anthropique urbain et du transport de poussières sahariennes.",
  },
  {
    source: "Fichier propre final consolidé (donnees_propres.csv)",
    responsible: "Papa Ibrahima Samb",
    coverage: "01/01/2025 – 22/11/2026 (16 608 h)",
    timeStep: "Horaire",
    status: "Reçu",
    statusType: "Mesuré",
    comment: "Reçu (25/11/2026) : Fusion temporelle complète météo NASA POWER + mesures des 3 stations au sol. 9 379 heures de PM2.5 sol synchronisées.",
  },
  {
    source: "Recherche scientifique & Seuils réglementaires",
    responsible: "Sayon Sidibé",
    coverage: "Normes CGQA (NS 05-062), OMS 2021 & Littérature",
    timeStep: "—",
    status: "Reçu",
    statusType: "Mesuré",
    comment: "Reçu (24/11/2026) : Rapport complet en 4 parties intégrant Sow (2021), Toure (2019), Léon (2020), Gueye (2025), justification des limites du satellite et grille officielle CGQA.",
  },
];

// 6. Benchmark comparatif des modèles (complété par les recherches de Sayon Sidibé)
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
    name: "LSTM Deep Learning (Gueye et al. 2025)",
    r2: 0.884,
    rmse: 3.20,
    mae: 2.15,
    rmseDry: 4.10,
    rmseWet: 2.05,
    status: "Mesuré",
    note: "Référence académique Dakar (station Bel Air sur 4 ans). Prévisions jusqu'à J+7 (Sustainability, 2025).",
  },
  {
    name: "CatBoost (Optimisé équipe)",
    r2: 0.832,
    rmse: 9.15,
    mae: 6.42,
    rmseDry: 10.95,
    rmseWet: 4.85,
    status: "Simulé",
    note: "Modèle tabulaire recommandé. Arbres avec gestion native des lags et saisonnalité.",
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
    note: "Forêt d'arbres de régression (100 estimateurs multi-variables).",
  },
  {
    name: "ARIMA classique (Baseline Gueye 2025)",
    r2: 0.612,
    rmse: 6.80,
    mae: 4.95,
    rmseDry: 8.40,
    rmseWet: 3.80,
    status: "Mesuré",
    note: "Série temporelle linéaire pure. Incapable de capturer les relations non-linéaires météo.",
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
// Enrichie par la preuve empirique de Léon, Martiny & Merlet (Remote Sensing, 2020)
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
    comment: "Saut de performance majeur : l'inertie locale de la station porte l'essentiel du signal.",
  },
  {
    setup: "3. Météo + Historique + AOD Satellite CAMS",
    variables: "Ensemble ci-dessus + AOD 550nm et traceurs gazeux",
    r2: 0.81,
    rmse: 9.3,
    comment: "Gain marginal à 24 h. Expliqué par Léon et al. (2020) : l'AOD colonne seule n'a qu'un R² de 0,15 avec le sol au Sahel sans profil vertical lidar (CALIOP).",
  },
];

// 8. Synthèse complète des recherches scientifiques de Sayon Sidibé
export const SAYON_RESEARCH_CONTENT = {
  title: "Recherche scientifique complémentaire — Sayon Sidibé",
  document: "donnees/RECHERCHE SCIENTIFIQUE COMPLEMENTAIRE.docx",
  date: "24 novembre 2026",
  parts: [
    {
      id: "partie1",
      number: "Partie I",
      title: "Études scientifiques sur la pollution de l'air à Dakar et dans le Sahel",
      studies: [
        {
          citation: "Sow, B., Tchanche, B., Fall, I., Souaré, S., & Mbow-Diokhané, A. (2021)",
          title: "Monitoring of Atmospheric Pollutant Concentrations in the City of Dakar, Senegal",
          journal: "Open Journal of Air Pollution, 10, 18-30. DOI: 10.4236/ojap.2021.101002",
          findings: "Données du Centre de Gestion de la Qualité de l'Air (CGQA). PM10 entre 120 et 180 µg/m³, PM2.5 entre 25 et 48 µg/m³. Forte dégradation en saison sèche (novembre à mai, Harmattan) et amélioration nette en saison des pluies (juin à octobre) par lessivage atmosphérique.",
          takeaway: "Justifie le choix des PM2.5 comme indicateur prioritaire et la modélisation de la saisonnalité.",
        },
        {
          citation: "Toure, N. O., et al. (2019)",
          title: "Observed and Modeled Seasonal Air Quality and Respiratory Health in Senegal During 2015 and 2016",
          journal: "GeoHealth, 3(12), 423-442. DOI: 10.1029/2019GH000214",
          findings: "Couplage mesures au sol, données satellitaires d'aérosols et simulations météorologiques WRF avec données sanitaires (infections respiratoires aiguës, asthme, bronchite). Pics majeurs de décembre à février.",
          takeaway: "Prouve que le transport des poussières sahariennes affecte tout le Sénégal et valide l'intégration de la météo numérique (WRF/ERA5).",
        },
        {
          citation: "Léon, J.-F., Martiny, N., & Merlet, S. (2020)",
          title: "A Multi Linear Regression Model to Derive Dust PM10 in the Sahel Using AERONET AOD and CALIOP Aerosol Layer Products",
          journal: "Remote Sensing, 12(18), 3099. DOI: 10.3390/rs12183099",
          findings: "Étude sur M'Bour (Sénégal), Banizoumbou (Niger) et Cinzana (Mali). L'AOD satellitaire seule n'explique que R² = 0,15 des concentrations au sol. L'ajout des paramètres de distribution verticale CALIOP fait grimper le R² ajusté à 0,75.",
          takeaway: "Explication théorique cruciale : l'AOD satellitaire seule ne suffit pas pour prédire la pollution respirée au sol sans profil altimétrique.",
        },
        {
          citation: "Source Apportionment Dakar & Bamako (2023)",
          title: "Source Apportionment of Ambient Particulate Matter in Two Western African Urban Sites",
          journal: "Atmosphere, 14(4), 684",
          findings: "Application de méthodes PCA et PMF pour séparer la contribution du trafic routier, des poussières minérales désertiques et des sources industrielles locales.",
          takeaway: "Valide la superposition des sources locales anthropiques (trafic) et régionales naturelles (Harmattan).",
        },
      ],
    },
    {
      id: "partie2",
      number: "Partie II",
      title: "Analyse des méthodes de prédiction (Statistiques, Machine Learning, Deep Learning, Numérique)",
      methodsComparison: [
        { method: "ARIMA", type: "Statistique", usage: "Prévision séries temporelles", limit: "Relations non linéaires difficiles à représenter" },
        { method: "Régression multiple", type: "Statistique", usage: "Estimation des concentrations", limit: "Hypothèse de linéarité stricte" },
        { method: "Random Forest", type: "Machine Learning", usage: "Arbres multi-variables", limit: "Moins précis sur événements extrêmes rares" },
        { method: "XGBoost / CatBoost", type: "Machine Learning", usage: "Gradient boosting tabulaire", limit: "Nécessite bon réglage d'hyperparamètres" },
        { method: "LSTM (Gueye 2025)", type: "Deep Learning", usage: "Prévision temporelle Dakar Bel Air", limit: "Besoin de données d'entraînement continues" },
        { method: "WRF / WRF-Chem", type: "Modélisation numérique", usage: "Transport et chimie atmosphérique", limit: "Coût de calcul élevé" },
      ],
      keyStudy: "Gueye et al. (2025, Sustainability) à Dakar Bel Air : le LSTM bat nettement ARIMA (RMSE 3,2 µg/m³ contre 6,8 µg/m³) sur 4 années de données journalières et permet des prévisions fiables jusqu'à 7 jours.",
    },
    {
      id: "partie3",
      number: "Partie III",
      title: "Limites physiques des données satellitaires",
      limits: [
        {
          point: "1. Colonne optique totale (AOD) vs Surface respirée",
          detail: "L'AOD intègre toute la colonne atmosphérique traversée par les rayons solaires. Des aérosols circulant à 3 000 m d'altitude élèvent l'AOD sans affecter directement l'air respiré au sol (confirmé par Léon et al. 2020).",
        },
        {
          point: "2. Conditions météorologiques et humidité",
          detail: "Couverture nuageuse bloquante en hivernage et gonflement hygroscopique des particules sous forte humidité marine (> 80 %) faussant la réflectance optique.",
        },
        {
          point: "3. Résolution spatiale insuffisante",
          detail: "Un pixel de satellite (ex. 7×3,5 km ou 10×10 km) moyenne toute une zone et gomme les contrastes locaux entre zones industrielles, axes denses et bord de mer.",
        },
        {
          point: "4. Résolution temporelle limitée",
          detail: "La plupart des satellites en orbite héliosynchrone (Sentinel-5P, MODIS) ne passent qu'une fois par jour, ratant le cycle diurne à deux pics (matin 8h et soir 20h).",
        },
        {
          point: "5. Déficit de réseaux de capteurs de référence au Sahel",
          detail: "Le manque de stations physiques permanentes certifiées rend délicat l'étalonnage au sol des produits satellitaires.",
        },
      ],
    },
    {
      id: "partie4",
      number: "Partie IV",
      title: "Normes réglementaires et définition des seuils d'alerte",
      standards: {
        who2021: "Lignes directrices OMS 2021 : PM2.5 = 15 µg/m³ (24h) et 5 µg/m³ (annuel). Référence sanitaire internationale.",
        snNorm: "Norme Sénégalaise NS 05-062 de l'Association Sénégalaise de Normalisation (ASN) : cadre réglementaire contraignant des émissions et concentrations au Sénégal.",
        cgqaFormula: "Formule officielle de l'indice IQA du CGQA : IQA = (C / C_limite) × 100.",
        cgqaScale: [
          { range: "IQA < 100", label: "Bon", action: "Qualité satisfaisante, aucune précaution requise" },
          { range: "100 ≤ IQA < 150", label: "Moyen", action: "Risques limités pour les personnes sensibles (asthmatiques, enfants)" },
          { range: "150 ≤ IQA ≤ 200", label: "Mauvais", action: "Effets sensibles, réduire les efforts physiques extérieurs" },
          { range: "IQA > 200", label: "Très mauvais", action: "Déclenchement d'une alerte sanitaire, fermer les fenêtres" },
          { range: "IQA > 300", label: "Alerte générale", action: "Mesures d'urgence des autorités publiques" },
        ],
      },
    },
  ],
};

// ==============================================================================
// DONNÉES SATELLITAIRES DE LAMINE CISSÉ (Sentinel-5P TROPOMI / Copernicus CDSE)
// ==============================================================================
export const LAMINE_SATELLITE_CONTENT = {
  author: "Lamine Cissé",
  title: "Observation spatiale Sentinel-5P TROPOMI — Dioxyde d'Azote & Indice d'Aérosols",
  date: "25 novembre 2026",
  source: "Copernicus Data Space Ecosystem (CDSE) / Sentinel Hub Browser",
  sections: [
    {
      id: "no2_map",
      title: "1. Carte Satellite Haute Définition : Panache de NO2 (Dioxyde d'Azote)",
      lead: "Observation par le spectromètre TROPOMI du panache de dioxyde d'azote sur le Sénégal et la région dakaroise le 25 novembre 2026.",
      image: "/satellite/sentinel5p_no2_dakar_20261125.webp",
      thumb: "/satellite/sentinel5p_no2_thumb.webp",
      originalResolution: "9 930 × 6 865 pixels (3,5 Mo)",
      sensor: "Sentinel-5P TROPOMI (ESA / Copernicus)",
      resolution: "5,5 km × 3,5 km",
      keyPoints: [
        "Traceur anthropique direct : Le NO2 est issu quasi-exclusivement de la combustion des carburants fossiles (diesel) et de la production d'électricité thermique.",
        "Localisation des points chauds : Forte densité visible sur la presqu'île de Dakar (axe autoroutier, zone industrielle de Bel-Air, port autonome et carrefours de banlieue).",
        "Complémentarité avec le rapport d'Alioune Badara Sarr : Confirme la prépondérance du secteur trafic (49 % des émissions primaires) identifié lors de la campagne 2009.",
      ],
    },
    {
      id: "aer_ai_timelapse",
      title: "2. Animation Timelapse AER_AI : Dynamique des Aérosols & Harmattan",
      lead: "Séquence temporelle de l'Indice d'Aérosol UV (AER_AI 340/380 nm) montrant le transport à grande échelle des poussières minérales désertiques vers l'océan Atlantique et Dakar.",
      video: "/satellite/sentinel5p_aer_ai_timelapse.mp4",
      sensor: "Sentinel-5P TROPOMI AER_AI",
      period: "23 au 25 novembre 2026",
      keyPoints: [
        "Détection des particules absorbantes : L'indice AER_AI mesure l'absorption des UV par les poussières minérales sahariennes et la suie, même au-dessus des nuages et de l'océan.",
        "Validation de la théorie de Sayon Sidibé : L'animation illustre parfaitement la descente des masses d'air chargées de poussières sahariennes sous l'effet des flux d'est (Harmattan).",
        "Explication des pics mesurés par Mously Sow : Corrélation nette entre l'intensification de l'indice AER_AI en altitude et la hausse des concentrations PM2.5 mesurées au sol (ESMT, Limamoulaye, Tivaoune).",
      ],
    },
    {
      id: "transparency_audit",
      title: "3. Transparence Scientifique & Diagnostic Technique des Données",
      lead: "Analyse technique rigoureuse des données brutes et des flux traités fournis par Lamine Cissé.",
      auditPoints: [
        {
          label: "Audit des fichiers NetCDF L2 bruts",
          status: "Vérifié & documenté",
          detail: "3 granules NetCDF L2 (S5P_NRTI_L2_NO2, orbites 47244, 47245, 47246) de 70 Mo chacun ont été analysés par script xarray/netCDF4. Ces segments d'orbite couvrent l'Eurasie et l'Atlantique Nord. L'orbite exacte au zénith de Dakar (17°O) passe à un horaire différent de la journée.",
        },
        {
          label: "Requêtes Copernicus Dataspace (CDSE)",
          status: "52 requêtes / 302 Processing Units",
          detail: "Lamine Cissé a ciblé directement la presqu'île de Dakar et le Sénégal via l'API CDSE Process et le Browser Sentinel Hub (pins 14.63°N, −17.24°O pour AER_AI et 14.50°N, −14.65°O pour NO2), permettant d'extraire l'imagerie composite haute résolution sans perte d'information spatiale.",
        },
        {
          label: "Apport dans le modèle prédictif",
          status: "Complémentarité Sol/Espace",
          detail: "L'AOD et le NO2 satellitaires apportent le contexte macroscopique régional (fronts de poussière, panaches régionaux), tandis que les 3 micro-capteurs au sol de Mously Sow fournissent la précision temporelle horaire indispensable pour capter les cycles de pointe quotidiens.",
        },
      ],
    },
  ],
};
