// ==============================================================================
// DAKAR RESPIRE - JEUX DE DONNÉES & STRUCTURES DU TABLEAU DE BORD EXPLICITE
// Conforme aux rapports d'Alioune Badara Sarr, Mously Sow, Lamine Cissé,
// El Hadji Ibrahima Diop Sow, Papa Ibrahima Samb & Sayon Sidibé.
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
    location: "Grand Dakar",
    instrument: "Capteur d'air certifié en continu",
    reportedSince: "Novembre 2025",
    license: "Données ouvertes OpenAQ",
    latestValue: 24.7,
    status: "Mesure disponible",
    statusType: "Mesuré",
    x: 42,
    y: 48,
    note: "Zone urbaine dense. Air pur en début de matinée, pic d'émissions le soir vers 21h lié à la circulation.",
  },
  {
    id: "esmt",
    name: "Campus ESMT Dakar",
    location: "Fann / Point E",
    instrument: "Capteur universitaire de référence",
    reportedSince: "Octobre 2025",
    license: "Données ouvertes OpenAQ",
    latestValue: 10.3,
    status: "Mesure disponible",
    statusType: "Mesuré",
    x: 38,
    y: 52,
    note: "Quartier côtier tempéré par les brises marines. Niveau de particules généralement le plus bas de la ville.",
  },
  {
    id: "tivaoune",
    name: "Mairie de Tivaoune Diacksao",
    location: "Pikine / Tiaroye",
    instrument: "Capteur d'air certifié en continu",
    reportedSince: "Décembre 2025",
    license: "Données ouvertes OpenAQ",
    latestValue: 21.6,
    status: "Mesure disponible",
    statusType: "Mesuré",
    x: 68,
    y: 35,
    note: "Secteur de banlieue exposé aux axes routiers majeurs et aux poussières au sol. Pic marqué le matin vers 9h.",
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
    source: "Relevés météo & force du vent",
    start: "01/01/2025",
    end: "22/11/2026",
    startPct: 75,
    widthPct: 24,
    periodLabel: "2025 – 2026",
    frequency: "Relevé chaque heure",
    status: "Mesuré",
    statusText: "Température, humidité et direction des vents d'Harmattan et alizés maritimes",
  },
  {
    source: "Capteurs au sol dans les quartiers",
    start: "15/10/2025",
    end: "22/11/2026",
    startPct: 84,
    widthPct: 16,
    periodLabel: "2025 – 2026",
    frequency: "Relevé chaque heure",
    status: "Mesuré",
    statusText: "Mesures réelles de particules fines à Grand Dakar, Fann et Pikine",
  },
  {
    source: "Base de données complète unifiée",
    start: "01/01/2025",
    end: "22/11/2026",
    startPct: 75,
    widthPct: 25,
    periodLabel: "2025 – 2026",
    frequency: "Relevé chaque heure",
    status: "Mesuré",
    statusText: "Série continue météo et qualité de l'air combinées sur près de deux ans",
  },
  {
    source: "Imagerie satellite de la région",
    start: "23/11/2026",
    end: "25/11/2026",
    startPct: 92,
    widthPct: 8,
    periodLabel: "Novembre 2026",
    frequency: "Survol quotidien",
    status: "Mesuré",
    statusText: "Cartographie vue de l'espace des nuages de poussière du désert et de la pollution urbaine",
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

// 8. Synthèse complète des recherches scientifiques
export const SAYON_RESEARCH_CONTENT = {
  title: "Dossier scientifique · Comprendre les particules fines",
  document: "Synthèse des études de référence au Sénégal",
  date: "Novembre 2026",
  parts: [
    {
      id: "partie1",
      number: "Partie I",
      title: "Ce que révèlent les études sur la qualité de l'air à Dakar",
      studies: [
        {
          citation: "Surveillance de l'air dans la métropole dakaroise (Sow et al.)",
          title: "Évolution saisonnière des concentrations en ville",
          journal: "Revue de référence en qualité de l'air",
          findings: "Les particules fines sont multipliées par deux ou trois durant la saison sèche sous l'effet du vent d'Harmattan, puis retombent fortement avec les pluies d'hivernage.",
          takeaway: "Les particules fines constituent la menace sanitaire n°1 à Dakar.",
        },
        {
          citation: "Impact respiratoire au Sénégal (Toure et al.)",
          title: "Lien direct entre poussières désertiques et consultations médicales",
          journal: "Santé publique & Climat",
          findings: "Chaque pic de poussière entre décembre et février s'accompagne d'une hausse immédiate des crises d'asthme et des infections respiratoires chez les enfants et les personnes âgées.",
          takeaway: "Anticiper la poussière permet de prévenir les crises respiratoires.",
        },
        {
          citation: "Observation sol et espace au Sahel (Léon et al.)",
          title: "Pourquoi le satellite seul ne suffit pas pour savoir ce qu'on respire",
          journal: "Revue internationale de télédétection",
          findings: "Le satellite voit les nuages de sable à 3 000 mètres d'altitude, mais seule une partie retombe au sol où nous respirons. Les capteurs de quartier sont donc indispensables.",
          takeaway: "Le satellite donne l'alerte générale, le capteur au sol donne la mesure exacte.",
        },
        {
          citation: "Origine des particules à Dakar et dans la sous-région",
          title: "Séparation du trafic routier et du sable désertique",
          journal: "Recherche sur l'atmosphère urbaine",
          findings: "La pollution dakaroise est un mélange permanent : un fond local causé par les moteurs diesel et le brûlage, sur lequel viennent se poser les vagues de poussière du Sahara.",
          takeaway: "Agir sur la circulation automobile réduirait immédiatement la moitié de la pollution urbaine.",
        },
      ],
    },
    {
      id: "partie2",
      number: "Partie II",
      title: "Comment l'intelligence artificielle prédit la qualité de l'air",
      methodsComparison: [
        { method: "Méthodes statistiques simples", type: "Classique", usage: "Moyennes et tendances des jours passés", limit: "Ne sait pas prévoir les changements brusques de vent" },
        { method: "Forêts d'arbres décisionnels", type: "IA moderne", usage: "Croisement automatique de la chaleur et du vent", limit: "Moins précise sur les tempêtes de poussière exceptionnelles" },
        { method: "Gradient Boosting (CatBoost)", type: "Algorithme retenu", usage: "Apprentissage progressif sur chaque erreur", limit: "Modèle le plus précis et le plus stable pour Dakar" },
        { method: "Réseaux neuronaux profonds", type: "Deep Learning", usage: "Mémoire continue heure par heure", limit: "Exige d'immenses historiques de données pour converger" },
      ],
      keyStudy: "L'apprentissage automatique permet d'anticiper 24 heures à l'avance les épisodes critiques pour protéger les populations vulnérables.",
    },
    {
      id: "partie3",
      number: "Partie III",
      title: "Les 5 défis pour surveiller l'air à Dakar",
      limits: [
        {
          point: "1. Le satellite regarde de très haut",
          detail: "Une nappe de sable qui survole Dakar à haute altitude peut ne pas toucher le sol. Les capteurs dans les rues sont nécessaires pour mesurer ce qui entre dans nos poumons.",
        },
        {
          point: "2. L'humidité de l'océan Atlantique",
          detail: "L'air marin humide fait gonfler certaines particules, ce qui peut fausser les micro-capteurs optiques non protégés lors des brumes côtières.",
        },
        {
          point: "3. La diversité des quartiers de Dakar",
          detail: "L'air n'est pas le même sur la corniche des Almadies, sur l'autoroute à hauteur de Pikine, ou au marché de Colobane. Chaque secteur a son micro-climat.",
        },
        {
          point: "4. Le rythme quotidien de la vie urbaine",
          detail: "Les satellites ne passent généralement qu'une fois par jour, ratant le grand pic du matin à 8h et celui du soir à 20h créés par les déplacements.",
        },
        {
          point: "5. L'intensité des tempêtes de sable",
          detail: "Lors d'un fort épisode d'Harmattan, les concentrations peuvent grimper en flèche en moins de deux heures, nécessitant des alertes en temps réel.",
        },
      ],
    },
    {
      id: "partie4",
      number: "Partie IV",
      title: "Les seuils de santé et l'indice de l'air à Dakar",
      standards: {
        who2021: "Repère sanitaire de l'OMS : Ne pas dépasser 15 µg/m³ sur une journée pour préserver sa santé.",
        snNorm: "Norme nationale sénégalaise : Cadre officiel d'application et de surveillance de la qualité de l'air.",
        cgqaFormula: "Calcul officiel de l'indice IQA : Permet de convertir les microgrammes en un score facile à lire de 0 à 500.",
        cgqaScale: [
          { range: "IQA < 100", label: "Bon (Vert)", action: "Air sain. Vous pouvez aérer et faire du sport dehors sans crainte." },
          { range: "100 ≤ IQA < 150", label: "Moyen (Jaune)", action: "Air acceptable. Les personnes sensibles (asthmatiques, jeunes enfants) doivent rester vigilantes." },
          { range: "150 ≤ IQA ≤ 200", label: "Mauvais (Orange)", action: "Air pollué. Réduisez les efforts physiques prolongés en plein air." },
          { range: "IQA > 200", label: "Très mauvais (Rouge)", action: "Alerte sanitaire. Évitez les sorties pour les personnes fragiles et portez un masque si nécessaire." },
          { range: "IQA > 300", label: "Dangereux (Violet)", action: "Situation critique. Fermez les fenêtres et limitez tout déplacement extérieur." },
        ],
      },
    },
  ],
};

// ==============================================================================
// IMAGERIE SATELLITE & OBSERVATION DE L'ESPACE
// ==============================================================================
export const LAMINE_SATELLITE_CONTENT = {
  author: "Imagerie Spatiale",
  title: "Surveillance par satellite — Gaz d'échappement & Poussières en suspension",
  date: "Novembre 2026",
  source: "Programme européen d'observation de la Terre Copernicus",
  sections: [
    {
      id: "no2_map",
      title: "1. Carte Satellite : Panache des gaz d'échappement urbains",
      lead: "Vue spatiale des concentrations de dioxyde d'azote sur la presqu'île de Dakar et le Sénégal.",
      image: "/satellite/sentinel5p_no2_dakar_20261125.webp",
      thumb: "/satellite/sentinel5p_no2_thumb.webp",
      originalResolution: "Haute résolution spatiale",
      sensor: "Spectromètre spatial Sentinel-5P",
      resolution: "Maillage haute précision",
      keyPoints: [
        "Le traceur direct de la circulation : Ce gaz provient principalement des moteurs diesel (cars rapides, taxis, camions) et de la production électrique.",
        "Les points chauds de la capitale : Les concentrations les plus denses se concentrent le long de l'autoroute, de la zone portuaire et des grands carrefours.",
        "Confirmation sur le terrain : Cette carte spatiale confirme que les transports motorisés génèrent près de la moitié de la pollution urbaine à Dakar.",
      ],
    },
    {
      id: "transparency_audit",
      title: "2. Pourquoi combiner le sol et l'espace ?",
      lead: "La complémentarité essentielle entre les capteurs dans les rues et les satellites en orbite.",
      auditPoints: [
        {
          label: "Les capteurs au sol dans les quartiers",
          status: "Au niveau de la rue",
          detail: "Ils mesurent exactement l'air respiré par les piétons, les automobilistes et les habitants, heure par heure tout au long de la journée.",
        },
        {
          label: "Les satellites en orbite",
          status: "Vue à 800 km d'altitude",
          detail: "Ils repèrent les tempêtes de poussière plusieurs jours à l'avance dans le désert, permettant d'alerter avant que le nuage n'atteigne Dakar.",
        },
        {
          label: "Le résultat combiné",
          status: "Prévision fiable à 24h",
          detail: "En unissant la vue d'ensemble du satellite et la précision des capteurs locaux, notre modèle d'IA prévoit avec justesse l'air que vous respirerez demain.",
        },
      ],
    },
  ],
};
