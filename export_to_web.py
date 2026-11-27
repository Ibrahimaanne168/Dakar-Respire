# ==============================================================================
# PROJET DAKAR RESPIRE - EXPORT DU MODÈLE ET DES RÉSULTATS POUR LE SITE WEB
# Produit les fichiers dans public/model/ pour Next.js et Vercel
# ==============================================================================
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
import numpy as np
import pandas as pd

import config
from src.data_generator import ensure_simulated_data_file
from src.data_loader import DataLoader
from src.features import FeatureEngineer
from src.baselines import BaselinePredictor
from src.models import AirQualityModelSuite
from src.evaluate import ModelEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ExportWeb")


def export_all():
    logger.info("=== DÉMARRAGE DE L'EXPORTATION POUR NEXT.JS / VERCEL ===")
    
    # 1. Dossier de destination dans Next.js
    web_model_dir = config.BASE_DIR / "public" / "model"
    web_model_dir.mkdir(parents=True, exist_ok=True)

    # 2. Chargement des données
    data_path = config.CLEAN_DATA_FILE if config.CLEAN_DATA_FILE.exists() else config.SIMULATED_DATA_FILE
    if not data_path.exists():
        ensure_simulated_data_file()
        data_path = config.SIMULATED_DATA_FILE

    loader = DataLoader(data_path)
    df_hourly = loader.load_data()
    is_simulated = loader.audit_report.get("is_simulated", True)

    # 3. Ingénierie des variables
    fe = FeatureEngineer(horizon_hours=config.HORIZON_HOURS)
    X, Y = fe.create_features(df_hourly)

    # Découpage temporel (80% train, 20% test)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    Y_train, Y_test = Y.iloc[:split_idx], Y.iloc[split_idx:]
    test_index = X_test.index

    # 4. Entraînement de la suite
    suite = AirQualityModelSuite(random_state=42)
    suite.train_all(X_train, Y_train)

    # 5. Évaluation complète
    evaluator = ModelEvaluator()
    eval_results = {}
    for name in suite.models.keys():
        pred = suite.predict(name, X_test)
        eval_results[name] = evaluator.evaluate_model(Y_test, pred, test_index)

    # Baselines
    persist_pred = BaselinePredictor.persistence_24h(df_hourly, horizon=config.HORIZON_HOURS).loc[test_index].values
    eval_results["Baseline (Persistance 24h)"] = evaluator.evaluate_model(Y_test, persist_pred, test_index)

    if "cams_pm25_raw" in df_hourly.columns:
        cams_pred = BaselinePredictor.cams_raw_forecast(df_hourly, horizon=config.HORIZON_HOURS).loc[test_index].values
        eval_results["Baseline (CAMS brut)"] = evaluator.evaluate_model(Y_test, cams_pred, test_index)

    # 6. EXPORT 1 : meta.json
    meta = {
        "project": "Dakar Respire",
        "author": "Plateforme Dakar Respire",
        "competition": "Concours Mathématiques et Modélisation",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "synthetic": bool(is_simulated),
        "target_col": config.TARGET_COL,
        "horizon_hours": config.HORIZON_HOURS,
        "feature_names": fe.feature_names,
        "n_train_samples": len(X_train),
        "n_test_samples": len(X_test),
        "start_date": str(df_hourly.index.min()),
        "end_date": str(df_hourly.index.max()),
        "thresholds": {k: {"min": v["min"], "max": v["max"], "color": v["color"], "label": v["label"], "recommandation": v["recommandation"]} for k, v in config.ALERT_LEVELS.items()},
        "team_status": {
            "Alioune Badara Sarr": {"role": "Étude PM2.5 & Harmattan", "status": "Reçu"},
            "El Hadji Ibrahima Diop Sow": {"role": "Météo NASA POWER", "status": "Reçu en partie (Série 2026 attendue)"},
            "Lamine Cissé": {"role": "Satellites CAMS / Sentinel-5P", "status": "Sources reçues (Fichiers attendus)"},
            "Mously Sow": {"role": "Mesures réelles OpenAQ", "status": "Rapport reçu (Séries complètes attendues)"},
            "Papa Ibrahima Samb": {"role": "Nettoyage & Fichier propre", "status": "À venir (Intégration directe)"},
            "Sayon Sidibé": {"role": "Seuils & Recherches", "status": "À venir (Intégration directe)"},
        }
    }
    with open(web_model_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    logger.info(f"Exporté : {web_model_dir / 'meta.json'}")

    # 7. EXPORT 2 : metrics.json
    summary_list = []
    for m_name, res in eval_results.items():
        glob = res["global"]
        seasons = res["seasons"]
        dry = seasons.get("Saison Sèche (Harmattan / Poussières)", {})
        wet = seasons.get("Saison des Pluies (Hivernage / Lessivage)", {})
        summary_list.append({
            "model_name": m_name,
            "r2": glob.get("R2"),
            "rmse": glob.get("RMSE"),
            "mae": glob.get("MAE"),
            "bias": glob.get("Bias"),
            "rmse_dry_season": dry.get("RMSE"),
            "rmse_wet_season": wet.get("RMSE"),
            "threshold_35_f1": res["thresholds"].get("CGQA_Moyen (35 µg/m³)", {}).get("F1", 0.0),
            "threshold_55_f1": res["thresholds"].get("CGQA_Alerte (55 µg/m³)", {}).get("F1", 0.0),
        })

    with open(web_model_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump({"summary": summary_list, "detailed": eval_results}, f, indent=2, ensure_ascii=False)
    logger.info(f"Exporté : {web_model_dir / 'metrics.json'}")

    # 8. EXPORT 3 : forecast.json (Dernier état prévisionnel pour affichage immédiat)
    best_model_name = "HistGradientBoosting" if "HistGradientBoosting" in suite.models else list(suite.models.keys())[0]
    last_sample = X_test.iloc[[-1]]
    pred_24h = suite.predict(best_model_name, last_sample)[0]

    last_ts = last_sample.index[0]
    hourly_forecasts = []
    
    for h in range(1, 25):
        val = float(pred_24h[h - 1])
        ts = last_ts + pd.Timedelta(hours=h)
        
        # Détermination du niveau
        lvl = "BON"
        for level_key, level_props in config.ALERT_LEVELS.items():
            if level_props["min"] <= val <= level_props["max"]:
                lvl = level_key
                break

        # Extraction météo si disponible dans le dernier échantillon
        wind_spd = float(last_sample.get("wind_ms", [4.5])[0]) if "wind_ms" in last_sample else 4.5
        wind_dir = float(last_sample.get("wind_dir_deg", [45.0])[0]) if "wind_dir_deg" in last_sample else 45.0
        temp = float(last_sample.get("temp_c", [24.0])[0]) if "temp_c" in last_sample else 24.0

        hourly_forecasts.append({
            "hour_offset": h,
            "timestamp": ts.isoformat(),
            "hour": ts.hour,
            "pm25": round(val, 1),
            "level": lvl,
            "color": config.ALERT_LEVELS[lvl]["color"],
            "label": config.ALERT_LEVELS[lvl]["label"],
            "wind_speed": round(wind_spd, 1),
            "wind_deg": round(wind_dir, 0),
            "is_harmattan": bool(config.HARMATTAN_WIND_DIR_MIN <= wind_dir <= config.HARMATTAN_WIND_DIR_MAX),
            "temp_c": round(temp, 1),
        })

    forecast_payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model_used": best_model_name,
        "synthetic": bool(is_simulated),
        "current_pm25": round(float(df_hourly[config.TARGET_COL].iloc[-1]), 1),
        "peak_pm25": round(float(np.max(pred_24h)), 1),
        "mean_pm25": round(float(np.mean(pred_24h)), 1),
        "hourly": hourly_forecasts,
    }

    with open(web_model_dir / "forecast.json", "w", encoding="utf-8") as f:
        json.dump(forecast_payload, f, indent=2, ensure_ascii=False)
    logger.info(f"Exporté : {web_model_dir / 'forecast.json'}")

    # 9. EXPORT 4 : model_weights.json (Pour le moteur d'inférence TypeScript client)
    # Exporte les coefficients du modèle Ridge multi-output et les moyennes/écarts types des variables
    ridge_model = suite.models.get("Ridge Regression")
    if ridge_model and hasattr(ridge_model, "estimators_"):
        coefs = [est.coef_.tolist() for est in ridge_model.estimators_]
        intercepts = [float(est.intercept_) for est in ridge_model.estimators_]
    else:
        coefs, intercepts = [], []

    feature_means = {col: float(X_train[col].mean()) for col in X_train.columns}
    feature_stds = {col: float(X_train[col].std()) if X_train[col].std() > 0 else 1.0 for col in X_train.columns}

    weights_payload = {
        "model_type": "Ridge",
        "feature_names": fe.feature_names,
        "coefficients": coefs,        # Matrice 24 x D
        "intercepts": intercepts,     # Vecteur 24
        "feature_means": feature_means,
        "feature_stds": feature_stds,
        "lags": config.LAG_HOURS,
        "rolling_windows": config.ROLLING_WINDOWS,
    }

    with open(web_model_dir / "model_weights.json", "w", encoding="utf-8") as f:
        json.dump(weights_payload, f, indent=2, ensure_ascii=False)
    logger.info(f"Exporté : {web_model_dir / 'model_weights.json'}")

    logger.info("=== EXPORTATION TERMINÉE AVEC SUCCÈS ===")


if __name__ == "__main__":
    export_all()
