# ==============================================================================
# PROJET DAKAR RESPIRE - MODÈLES DE RÉFÉRENCE (BASELINES)
# Auteur : Ibrahima Anne (Data / ML Lead)
# Deux références à battre : Persistance temporelle et Prévision CAMS brute
# ==============================================================================
import numpy as np
import pandas as pd
from typing import Dict, Any
import config


class BaselinePredictor:
    """
    Fournit les modèles naïfs de référence indispensables à toute modélisation sérieuse :
    1. Persistance 1h : Demain = Dernière mesure connue PM2.5(t)
    2. Persistance 24h (journalière) : Demain à l'heure H = Hier à l'heure H
    3. Prévision physique brute de Copernicus CAMS (si disponible)
    4. Climatologie horaire mensuelle
    """

    @staticmethod
    def persistence_last(df: pd.DataFrame, horizon: int = config.HORIZON_HOURS) -> pd.DataFrame:
        """
        Prédiction de persistance naïve : la concentration actuelle t
        est maintenue constante sur les h prochaines heures.
        """
        predictions = pd.DataFrame(index=df.index)
        current_val = df[config.TARGET_COL]
        for h in range(1, horizon + 1):
            predictions[f"lead_{h}h"] = current_val
        return predictions

    @staticmethod
    def persistence_24h(df: pd.DataFrame, horizon: int = config.HORIZON_HOURS) -> pd.DataFrame:
        """
        Persistance saisonnière/journalière : prévoit pour t+h la valeur observée à t+h-24.
        """
        predictions = pd.DataFrame(index=df.index)
        for h in range(1, horizon + 1):
            # Décalage par rapport à hier à la même heure
            shift_hours = 24 - h
            if shift_hours >= 0:
                predictions[f"lead_{h}h"] = df[config.TARGET_COL].shift(shift_hours)
            else:
                predictions[f"lead_{h}h"] = df[config.TARGET_COL]
        return predictions

    @staticmethod
    def cams_raw_forecast(df: pd.DataFrame, horizon: int = config.HORIZON_HOURS) -> pd.DataFrame:
        """
        Utilise la prévision brute issue du modèle CAMS (Copernicus) si la colonne existe.
        """
        predictions = pd.DataFrame(index=df.index)
        cams_col = "cams_pm25_raw"
        if cams_col in df.columns:
            for h in range(1, horizon + 1):
                predictions[f"lead_{h}h"] = df[cams_col].shift(-h)
        else:
            # Fallback si CAMS n'est pas fourni : persistance
            return BaselinePredictor.persistence_last(df, horizon)
        return predictions
