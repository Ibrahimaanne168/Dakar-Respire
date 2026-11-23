# ==============================================================================
# PROJET DAKAR RESPIRE - CONFIGURATION CENTRALE
# Responsable Modèle & Interface : Ibrahima Anne
# Concours : Mathématiques et Modélisation
# ==============================================================================
"""
Ce fichier centralise l'ensemble des paramètres, chemins, seuils et variables
du projet Dakar Respire. Il est conçu pour intégrer directement les apports :
- De Papa Ibrahima Samb (colonnes et formats du fichier CSV nettoyé)
- De Sayon Sidibé (seuils d'alerte officiels, références scientifiques, limites)
"""

from pathlib import Path

# ------------------------------------------------------------------------------
# 1. CHEMINS DU PROJET
# ------------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = BASE_DIR / "saved_models"

# Fichier par défaut : basculera automatiquement sur le fichier de Papa Ibrahima Samb dès réception
CLEAN_DATA_FILE = PROCESSED_DATA_DIR / "dakar_respire_hourly_clean.csv"
SIMULATED_DATA_FILE = PROCESSED_DATA_DIR / "dakar_respire_simulated.csv"

# ------------------------------------------------------------------------------
# 2. COORDONNÉES GÉOGRAPHIQUES & CADRE TECHNIQUE (DAKAR)
# ------------------------------------------------------------------------------
LATITUDE = 14.6928
LONGITUDE = -17.4467
TIMEZONE = "UTC"  # Dakar = UTC+00:00 (aucun décalage horaire nécessaire)

# Bounding Box recommandée par Lamine Cissé pour Copernicus CAMS / Sentinel-5P
BBOX_DAKAR = {
    "lat_min": 14.55,
    "lat_max": 14.85,
    "lon_min": -17.55,
    "lon_max": -17.10,
}

# ------------------------------------------------------------------------------
# 3. SPÉCIFICATION DU FORMAT CIBLE (Contrat d'interface avec Papa Ibrahima Samb)
# ------------------------------------------------------------------------------
# Colonne temporelle obligatoire (pas horaire UTC)
DATETIME_COL = "timestamp"

# Variable cible à prédire (PM2.5 au sol en µg/m³)
TARGET_COL = "pm25"

# Station de mesure
STATION_COL = "station"

# Colonnes météorologiques attendues (optionnelles : le modèle s'adapte si absentes)
METEO_COLS = [
    "temp_c",          # Température de l'air à 2m (°C)
    "rh_pct",          # Humidité relative à 2m (%)
    "wind_ms",         # Vitesse du vent à 2m ou 10m (m/s)
    "wind_dir_deg",    # Direction du vent (0-360°, Nord-Est = Harmattan)
    "precip_mm",       # Précipitations (mm/h)
    "pressure_kpa",    # Pression atmosphérique au sol (kPa)
]

# Colonnes satellitaires / modèles CAMS attendues (optionnelles)
SATELLITE_COLS = [
    "aod",             # Épaisseur optique des aérosols (AOD 550nm - CAMS/MODIS)
    "dust_aod",        # AOD spécifique poussières désertiques (CAMS)
    "no2",             # Colonne troposphérique NO2 (Sentinel-5P TROPOMI)
    "co",              # Colonne monoxyde de carbone CO (Sentinel-5P TROPOMI)
    "cams_pm25_raw",   # Prévision brute PM2.5 issue de CAMS (sert de baseline)
]

# Code pour les valeurs manquantes issues de réanalyses NASA POWER
NA_CODES = [-999, -999.0, "-999"]

# ------------------------------------------------------------------------------
# 4. INGÉNIERIE DES VARIABLES (FEATURE ENGINEERING)
# ------------------------------------------------------------------------------
HORIZON_HOURS = 24  # Prévision sur les 24 prochaines heures

# Retards temporels (lags) en heures
LAG_HOURS = [1, 2, 3, 6, 12, 24, 48]

# Fenêtres de moyennes mobiles (rolling means) en heures
ROLLING_WINDOWS = [6, 12, 24]

# Définition du vent d'Harmattan (secteur Nord-Est : 20° à 70°)
HARMATTAN_WIND_DIR_MIN = 20.0
HARMATTAN_WIND_DIR_MAX = 70.0

# Période de saison sèche à Dakar (novembre à mai) vs saison des pluies (juillet à octobre)
# Note scientifique Alioune Badara Sarr : Lessivage maximal en juillet-septembre
DRY_SEASON_MONTHS = [11, 12, 1, 2, 3, 4, 5]
WET_SEASON_MONTHS = [7, 8, 9, 10]

# ------------------------------------------------------------------------------
# 5. SEUILS D'ALERTE SANITAIRES (Section 7 - Réservée à Sayon Sidibé)
# ------------------------------------------------------------------------------
"""
Hypothèse de travail alignée sur les 4 couleurs de l'IQA du CGQA Sénégal
et les recommandations OMS 2021 (valeur guide 24h = 15 µg/m³).
À mettre à jour dès transmission des résultats de Sayon Sidibé.
"""
ALERT_LEVELS = {
    "BON": {
        "min": 0.0,
        "max": 15.0,
        "color": "#10B981",       # Vert
        "iqa_range": "0 – 50",
        "label": "Bon",
        "description": "Peu ou pas de risque sanitaire pour la population.",
        "recommandation": "La qualité de l'air est satisfaisante. Activités extérieures libres.",
    },
    "MOYEN": {
        "min": 15.0,
        "max": 35.0,
        "color": "#FBBF24",       # Jaune
        "iqa_range": "51 – 100",
        "label": "Moyen",
        "description": "Risques légers pour un nombre limité de personnes très sensibles.",
        "recommandation": "Les personnes très vulnérables (asthmatiques, enfants) doivent limiter les efforts intenses prolongés.",
    },
    "MAUVAIS": {
        "min": 35.0,
        "max": 55.0,
        "color": "#F97316",       # Orange
        "iqa_range": "101 – 200",
        "label": "Mauvais",
        "description": "Les personnes sensibles sont soumises à un risque élevé. Effets possibles sur tous.",
        "recommandation": "Réduire les activités sportives extérieures. Port de masque recommandé pour les personnes sensibles.",
    },
    "TRES_MAUVAIS": {
        "min": 55.0,
        "max": 1000.0,
        "color": "#EF4444",       # Rouge
        "iqa_range": "> 200",
        "label": "Très Mauvais (Alerte)",
        "description": "Alerte sanitaire : toute la population est susceptible d'être affectée.",
        "recommandation": "Éviter toute exposition prolongée à l'air ambiant. Fermer les fenêtres, port du masque obligatoire pour tous.",
    },
}

# ------------------------------------------------------------------------------
# 6. RÉFÉRENCES SCIENTIFIQUES & CONTEXTE LOCAL (Sayon Sidibé & Alioune Sarr)
# ------------------------------------------------------------------------------
REFERENCES = {
    "OMS_2021": "OMS (2021) - Seuil moyen journalier PM2.5 recommandé : 15 µg/m³ (annuel : 5 µg/m³).",
    "CGQA_DAKAR": "CGQA (Centre de Gestion de la Qualité de l'Air) - Ministère de l'Environnement du Sénégal.",
    "POLCA_2023": "Étude POLCA sur Bamako et Dakar (Atmosphere, 2023, mdpi.com/2073-4433/14/4/684).",
    "RAMP_2024": "Étude RAMP Abidjan et Accra (Environmental Science: Atmospheres, 2024, DOI: 10.1039/D4EA00012A).",
    "CATBOOST_BENCHMARK": "Étude de référence ML Dakar : CatBoost (R² = 0.931, RMSE = 11.50 µg/m³). Note : R² non garanti sur données réelles restreintes.",
    "SATELLITE_LIMIT": "ATTENTION : Les données satellites (AOD, NO2, CO) sont des intégrales sur la colonne d'air, JAMAIS des mesures directes au sol.",
}
