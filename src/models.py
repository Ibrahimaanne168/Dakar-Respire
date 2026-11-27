# ==============================================================================
# PROJET DAKAR RESPIRE - SUITE DE MODÈLES PRÉDICTIFS
# Modèles : Régression Linéaire/Ridge, Random Forest, Gradient Boosting (XGB/LGB/Hist)
# ==============================================================================
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
import pickle
from pathlib import Path

from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor

import config

# Import optionnel des bibliothèques avancées si installées sur la machine
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

try:
    import catboost as cb
    HAS_CATBOOST = True
except ImportError:
    HAS_CATBOOST = False


class AirQualityModelSuite:
    """
    Gère la construction, l'entraînement et l'inférence des différents modèles de ML
    pour la prévision simultanée des 24 prochaines heures à Dakar.
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.models: Dict[str, Any] = {}
        self._init_models()

    def _init_models(self) -> None:
        """Initialise la gamme d'algorithmes à comparer."""
        # 1. Modèle linéaire régularisé (Baseline statistique paramétrique)
        self.models["Ridge Regression"] = MultiOutputRegressor(
            Ridge(alpha=10.0, random_state=self.random_state)
        )

        # 2. Random Forest (Robuste, capture les non-linéarités et interactions)
        self.models["Random Forest"] = MultiOutputRegressor(
            RandomForestRegressor(
                n_estimators=100,
                max_depth=12,
                min_samples_split=6,
                n_jobs=-1,
                random_state=self.random_state,
            )
        )

        # 3. Gradient Boosting : HistGradientBoosting (Scikit-Learn natif et ultra rapide)
        # Utilisé comme référence Gradient Boosting toujours disponible sans dépendance externe
        self.models["HistGradientBoosting"] = MultiOutputRegressor(
            HistGradientBoostingRegressor(
                max_iter=120,
                max_depth=8,
                learning_rate=0.08,
                random_state=self.random_state,
            )
        )

        # 4. XGBoost (si disponible)
        if HAS_XGBOOST:
            self.models["XGBoost"] = MultiOutputRegressor(
                xgb.XGBRegressor(
                    n_estimators=120,
                    max_depth=6,
                    learning_rate=0.07,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    random_state=self.random_state,
                    n_jobs=-1,
                )
            )

        # 5. LightGBM (si disponible)
        if HAS_LIGHTGBM:
            self.models["LightGBM"] = MultiOutputRegressor(
                lgb.LGBMRegressor(
                    n_estimators=120,
                    max_depth=7,
                    learning_rate=0.07,
                    random_state=self.random_state,
                    verbose=-1,
                    n_jobs=-1,
                )
            )

        # 6. CatBoost (modèle de l'étude de référence à Dakar)
        if HAS_CATBOOST:
            self.models["CatBoost"] = MultiOutputRegressor(
                cb.CatBoostRegressor(
                    iterations=150,
                    depth=6,
                    learning_rate=0.08,
                    random_seed=self.random_state,
                    verbose=0,
                )
            )

    def train_all(self, X_train: pd.DataFrame, Y_train: pd.DataFrame) -> None:
        """Entraîne tous les modèles de la suite sur les données d'apprentissage."""
        for name, model in self.models.items():
            model.fit(X_train, Y_train)

    def predict(self, model_name: str, X: pd.DataFrame) -> np.ndarray:
        """Prédit les 24 heures pour un modèle donné."""
        if model_name not in self.models:
            raise ValueError(f"Modèle inconnu : {model_name}. Disponibles : {list(self.models.keys())}")
        return self.models[model_name].predict(X)

    def get_feature_importances(self, model_name: str, feature_names: List[str]) -> Optional[pd.Series]:
        """Extrait l'importance des variables pour les modèles arborescents."""
        if model_name not in self.models:
            return None

        model = self.models[model_name]
        # Dans un MultiOutputRegressor, on moyenne les importances des 24 estimateurs
        if hasattr(model, "estimators_"):
            importances = []
            for est in model.estimators_:
                if hasattr(est, "feature_importances_"):
                    importances.append(est.feature_importances_)
            if importances:
                mean_imp = np.mean(importances, axis=0)
                return pd.Series(mean_imp, index=feature_names).sort_values(ascending=False)

        return None

    def save_model(self, model_name: str, file_path: Path) -> None:
        """Sérialise un modèle entraîné sur disque."""
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            pickle.dump(self.models[model_name], f)

    def load_model(self, model_name: str, file_path: Path) -> None:
        """Charge un modèle sérialisé."""
        with open(file_path, "rb") as f:
            self.models[model_name] = pickle.load(f)
