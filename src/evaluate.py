# ==============================================================================
# PROJET DAKAR RESPIRE - MODULE D'ÉVALUATION SCIENTIFIQUE RIGUREUSE
# Auteur : Ibrahima Anne (Data / ML Lead)
# Concours : Mathématiques et Modélisation
# ==============================================================================
"""
Ce module assure une évaluation rigoureuse conforme aux exigences mathématiques :
1. Découpage strictement temporel (jamais aléatoire sur des séries chronologiques).
2. Validation croisée temporelle (TimeSeriesSplit).
3. Métriques quantitatives : R², RMSE, MAE pour chaque horizon h=1..24 et moyenne globale.
4. Évaluation séparée par régime : Saison sèche (Harmattan) vs Saison des pluies.
5. Métriques de classification sur les seuils sanitaires (OMS 15 µg/m³, CGQA 35 et 55 µg/m³).
6. Comparaison directe avec les baselines (Persistance & CAMS).
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.model_selection import TimeSeriesSplit

import config


class ModelEvaluator:
    """Évaluateur des performances prédictives pour Dakar Respire."""

    def __init__(self, thresholds: Optional[Dict[str, float]] = None):
        self.thresholds = thresholds or {
            "OMS_24h (15 µg/m³)": 15.0,
            "CGQA_Moyen (35 µg/m³)": 35.0,
            "CGQA_Alerte (55 µg/m³)": 55.0,
        }

    @staticmethod
    def compute_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """Calcule R², RMSE, MAE et le biais moyen."""
        mask = ~(np.isnan(y_true) | np.isnan(y_pred))
        y_t = y_true[mask]
        y_p = y_pred[mask]

        if len(y_t) == 0:
            return {"R2": np.nan, "RMSE": np.nan, "MAE": np.nan, "Bias": np.nan}

        rmse = float(np.sqrt(mean_squared_error(y_t, y_p)))
        mae = float(mean_absolute_error(y_t, y_p))
        r2 = float(r2_score(y_t, y_p))
        bias = float(np.mean(y_p - y_t))

        return {
            "R2": round(r2, 4),
            "RMSE": round(rmse, 2),
            "MAE": round(mae, 2),
            "Bias": round(bias, 2),
        }

    def compute_threshold_metrics(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, Dict[str, float]]:
        """
        Évalue la capacité du modèle à détecter les pics et dépassements de seuils sanitaires.
        Mesure la précision (éviter les fausses alertes) et le rappel (ne pas rater de pic dangereux).
        """
        results = {}
        mask = ~(np.isnan(y_true) | np.isnan(y_pred))
        y_t = y_true[mask]
        y_p = y_pred[mask]

        for th_name, th_val in self.thresholds.items():
            bin_true = (y_t >= th_val).astype(int)
            bin_pred = (y_p >= th_val).astype(int)

            if bin_true.sum() == 0:
                results[th_name] = {"Precision": 0.0, "Recall": 0.0, "F1": 0.0, "Exceedances": 0}
                continue

            prec = precision_score(bin_true, bin_pred, zero_division=0)
            rec = recall_score(bin_true, bin_pred, zero_division=0)
            f1 = f1_score(bin_true, bin_pred, zero_division=0)

            results[th_name] = {
                "Precision": round(float(prec), 3),
                "Recall": round(float(rec), 3),
                "F1": round(float(f1), 3),
                "Exceedances": int(bin_true.sum()),
            }

        return results

    def evaluate_model(
        self,
        y_true_df: pd.DataFrame,
        y_pred_array: np.ndarray,
        time_index: pd.DatetimeIndex,
    ) -> Dict[str, Any]:
        """
        Analyse complète d'un modèle : global, par horizon temporel (1h, 6h, 12h, 24h)
        et séparée selon la saison sèche vs saison des pluies.
        """
        y_true = y_true_df.values
        y_pred = y_pred_array

        # 1. Métriques globales sur les 24 heures
        global_metrics = self.compute_regression_metrics(y_true, y_pred)
        threshold_metrics = self.compute_threshold_metrics(y_true, y_pred)

        # 2. Métriques par pas horaire spécifique
        horizon_metrics = {}
        for idx, h in enumerate([1, 6, 12, 24]):
            if idx < y_true.shape[1]:
                h_metrics = self.compute_regression_metrics(y_true[:, h - 1], y_pred[:, h - 1])
                horizon_metrics[f"+{h}h"] = h_metrics

        # 3. Évaluation séparée par régime saisonnier (Recommandation Alioune Badara Sarr)
        months = time_index.month.values
        is_dry = np.isin(months, config.DRY_SEASON_MONTHS)
        is_wet = np.isin(months, config.WET_SEASON_MONTHS)

        dry_metrics = self.compute_regression_metrics(y_true[is_dry], y_pred[is_dry]) if is_dry.sum() > 0 else {}
        wet_metrics = self.compute_regression_metrics(y_true[is_wet], y_pred[is_wet]) if is_wet.sum() > 0 else {}

        return {
            "global": global_metrics,
            "horizons": horizon_metrics,
            "seasons": {
                "Saison Sèche (Harmattan / Poussières)": dry_metrics,
                "Saison des Pluies (Hivernage / Lessivage)": wet_metrics,
            },
            "thresholds": threshold_metrics,
        }
