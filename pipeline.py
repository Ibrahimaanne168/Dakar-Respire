# ==============================================================================
# PROJET DAKAR RESPIRE - PIPELINE D'ENTRAÎNEMENT ET D'ÉVALUATION (CLI)
# Auteur : Ibrahima Anne (Data / ML Lead)
# Concours : Mathématiques et Modélisation
# ==============================================================================
"""
Script d'orchestration exécutable en ligne de commande :
1. Charge ou génère les données.
2. Construit les variables (lags, météo, Harmattan).
3. Effectue un découpage temporel strict (Train / Test).
4. Entraîne tous les modèles et évalue les baselines.
5. Calcule les métriques globales, par horizon et par saison.
"""

import logging
import pandas as pd
import numpy as np

import config
from src.data_generator import ensure_simulated_data_file
from src.data_loader import DataLoader
from src.features import FeatureEngineer
from src.baselines import BaselinePredictor
from src.models import AirQualityModelSuite
from src.evaluate import ModelEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("Pipeline")


def run_pipeline(train_ratio: float = 0.8):
    logger.info("=== DÉMARRAGE DU PIPELINE DAKAR RESPIRE ===")

    # 1. Préparation des données
    data_path = config.CLEAN_DATA_FILE if config.CLEAN_DATA_FILE.exists() else config.SIMULATED_DATA_FILE
    if not data_path.exists():
        logger.info("Génération des données simulées réalistes...")
        ensure_simulated_data_file()
        data_path = config.SIMULATED_DATA_FILE

    loader = DataLoader(data_path)
    df_hourly = loader.load_data()
    is_simulated = loader.audit_report.get("is_simulated", True)

    if is_simulated:
        logger.warning("ATTENTION : Utilisation de données simulées. Les résultats sont des exemples méthodologiques.")

    # 2. Ingénierie des variables
    fe = FeatureEngineer(horizon_hours=config.HORIZON_HOURS)
    X, Y = fe.create_features(df_hourly)

    # 3. Découpage temporel strict (Time-based split, jamais aléatoire)
    n_samples = len(X)
    split_idx = int(n_samples * train_ratio)

    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    Y_train, Y_test = Y.iloc[:split_idx], Y.iloc[split_idx:]
    test_index = X_test.index

    logger.info(
        f"Découpage temporel : Train = {len(X_train)} heures ({X_train.index.min()} à {X_train.index.max()}) | "
        f"Test = {len(X_test)} heures ({X_test.index.min()} à {X_test.index.max()})"
    )

    # 4. Entraînement de la suite de modèles
    suite = AirQualityModelSuite(random_state=42)
    logger.info("Entraînement des modèles en cours...")
    suite.train_all(X_train, Y_train)

    # 5. Évaluation comparative
    evaluator = ModelEvaluator()
    results = {}

    # Évaluation des modèles ML
    for model_name in suite.models.keys():
        y_pred = suite.predict(model_name, X_test)
        metrics = evaluator.evaluate_model(Y_test, y_pred, test_index)
        results[model_name] = metrics

    # Évaluation de la baseline de persistance journalière (Hier = Demain)
    df_test_full = df_hourly.loc[test_index]
    persist_pred = BaselinePredictor.persistence_24h(df_hourly, horizon=config.HORIZON_HOURS).loc[test_index].values
    results["Baseline (Persistance 24h)"] = evaluator.evaluate_model(Y_test, persist_pred, test_index)

    # Évaluation de la baseline CAMS si disponible
    if "cams_pm25_raw" in df_hourly.columns:
        cams_pred = BaselinePredictor.cams_raw_forecast(df_hourly, horizon=config.HORIZON_HOURS).loc[test_index].values
        results["Baseline (CAMS brut)"] = evaluator.evaluate_model(Y_test, cams_pred, test_index)

    # 6. Synthèse des résultats
    summary_rows = []
    for name, res in results.items():
        glob = res["global"]
        dry = res["seasons"].get("Saison Sèche (Harmattan / Poussières)", {})
        wet = res["seasons"].get("Saison des Pluies (Hivernage / Lessivage)", {})
        summary_rows.append({
            "Modèle": name,
            "R² Global": glob.get("R2"),
            "RMSE Global (µg/m³)": glob.get("RMSE"),
            "MAE Global (µg/m³)": glob.get("MAE"),
            "RMSE Saison Sèche": dry.get("RMSE"),
            "RMSE Saison Pluies": wet.get("RMSE"),
        })

    summary_df = pd.DataFrame(summary_rows).sort_values("RMSE Global (µg/m³)")
    print("\n" + "=" * 80)
    print("TABLEAU COMPARATIF DES MODÈLES - DAKAR RESPIRE (HORIZON 24 HEURES)")
    print(f"Statut des données : {'⚠️ SIMULÉES' if is_simulated else '✅ RÉELLES CONSOLIDÉES'}")
    print("=" * 80)
    print(summary_df.to_string(index=False))
    print("=" * 80 + "\n")

    return {
        "suite": suite,
        "results": results,
        "summary": summary_df,
        "X_test": X_test,
        "Y_test": Y_test,
        "feature_names": fe.feature_names,
        "is_simulated": is_simulated,
    }


if __name__ == "__main__":
    run_pipeline()
