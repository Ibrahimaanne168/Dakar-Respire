# ==============================================================================
# PROJET DAKAR RESPIRE - INGÉNIERIE DES VARIABLES (FEATURE ENGINEERING)
# ==============================================================================
import numpy as np
import pandas as pd
from typing import Tuple, List, Optional
import config


class FeatureEngineer:
    """
    Construit les variables explicatives pour la prévision horaire des PM2.5 :
    - Encodage cyclique (heure, jour, mois)
    - Décomposition vectorielle du vent (U, V) & détection de l'Harmattan
    - Retards temporels (lags) et statistiques glissantes (rolling)
    - Précipitations cumulées et indicateur de lessivage
    - Intégration adaptative des colonnes satellites si présentes
    """

    def __init__(self, horizon_hours: int = config.HORIZON_HOURS):
        self.horizon_hours = horizon_hours
        self.feature_names: List[str] = []

    def create_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Génère la matrice des variables explicatives X et les cibles futures Y (1 à 24h).
        """
        data = df.copy()

        # ----------------------------------------------------------------------
        # 1. ENCODAGE TEMPOREL CYCLIQUE
        # ----------------------------------------------------------------------
        hour = data.index.hour
        month = data.index.month
        dayofyear = data.index.dayofyear

        data["sin_hour"] = np.sin(2 * np.pi * hour / 24.0)
        data["cos_hour"] = np.cos(2 * np.pi * hour / 24.0)
        data["sin_month"] = np.sin(2 * np.pi * month / 12.0)
        data["cos_month"] = np.cos(2 * np.pi * month / 12.0)

        # Indicateur de saison sèche (1) vs saison des pluies (0)
        data["is_dry_season"] = np.isin(month, config.DRY_SEASON_MONTHS).astype(int)

        # ----------------------------------------------------------------------
        # 2. VECTORISATION DU VENT & INDICATION HARMATTAN
        # ----------------------------------------------------------------------
        if "wind_ms" in data.columns and "wind_dir_deg" in data.columns:
            # Composantes zonale (U) et méridienne (V) en m/s
            rad = np.deg2rad(data["wind_dir_deg"])
            data["wind_u"] = -data["wind_ms"] * np.sin(rad)
            data["wind_v"] = -data["wind_ms"] * np.cos(rad)

            # Indicateur Harmattan : vent provenant du secteur Nord-Est (20° à 70°)
            is_ne_wind = (data["wind_dir_deg"] >= config.HARMATTAN_WIND_DIR_MIN) & (
                data["wind_dir_deg"] <= config.HARMATTAN_WIND_DIR_MAX
            )
            data["is_harmattan"] = (is_ne_wind & (data["is_dry_season"] == 1)).astype(int)
            data["harmattan_intensity"] = data["is_harmattan"] * data["wind_ms"]

        # ----------------------------------------------------------------------
        # 3. PRÉCIPITATIONS ET LESSIVAGE
        # ----------------------------------------------------------------------
        if "precip_mm" in data.columns:
            data["rain_accum_6h"] = data["precip_mm"].rolling(6, min_periods=1).sum()
            data["rain_accum_24h"] = data["precip_mm"].rolling(24, min_periods=1).sum()
            data["is_raining"] = (data["precip_mm"] > 0.1).astype(int)

        # ----------------------------------------------------------------------
        # 4. RETARDS TEMPORELS (LAGS) DE LA CIBLE PM2.5
        # ----------------------------------------------------------------------
        for lag in config.LAG_HOURS:
            data[f"pm25_lag_{lag}h"] = data[config.TARGET_COL].shift(lag)

        # ----------------------------------------------------------------------
        # 5. MOYENNES ET VARIABILITÉS GLISSANTES
        # ----------------------------------------------------------------------
        for window in config.ROLLING_WINDOWS:
            # Shift de 1 pour éviter la fuite d'information (data leakage)
            rolled = data[config.TARGET_COL].shift(1).rolling(window, min_periods=window // 2)
            data[f"pm25_roll_mean_{window}h"] = rolled.mean()
            data[f"pm25_roll_std_{window}h"] = rolled.std()
            data[f"pm25_roll_max_{window}h"] = rolled.max()
            data[f"pm25_roll_min_{window}h"] = rolled.min()

        # Ratio entre le niveau récent (6h) et la tendance de fond (24h)
        data["pm25_ratio_6_24"] = (
            data["pm25_roll_mean_6h"] / (data["pm25_roll_mean_24h"] + 1e-4)
        )

        # ----------------------------------------------------------------------
        # 6. SATELLITE (AOD, NO2, CO) SI DISPONIBLES
        # ----------------------------------------------------------------------
        for sat_col in config.SATELLITE_COLS:
            if sat_col in data.columns and sat_col != "cams_pm25_raw":
                data[f"{sat_col}_lag_1h"] = data[sat_col].shift(1)
                data[f"{sat_col}_roll_mean_24h"] = data[sat_col].shift(1).rolling(24, min_periods=4).mean()

        # ----------------------------------------------------------------------
        # 7. CONSTRUCTION DES CIBLES MULTI-HORIZONS Y (t+1 à t+24)
        # ----------------------------------------------------------------------
        y_cols = []
        for h in range(1, self.horizon_hours + 1):
            target_name = f"pm25_lead_{h}h"
            data[target_name] = data[config.TARGET_COL].shift(-h)
            y_cols.append(target_name)

        # ----------------------------------------------------------------------
        # 8. SÉLECTION ET NETTOYAGE DES LIGNES COMPLÈTES
        # ----------------------------------------------------------------------
        drop_cols = [config.TARGET_COL, "station", "is_simulated"] + y_cols
        feature_cols = [c for c in data.columns if c not in drop_cols]
        self.feature_names = feature_cols

        # Retrait des lignes contenant des NaN dus aux retards (début) ou avances (fin)
        clean_mask = ~(data[feature_cols].isna().any(axis=1) | data[y_cols].isna().any(axis=1))
        clean_data = data[clean_mask]

        X = clean_data[feature_cols]
        Y = clean_data[y_cols]

        return X, Y
