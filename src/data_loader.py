# ==============================================================================
# PROJET DAKAR RESPIRE - CHARGEUR DE DONNÉES ROBUSTE
# Destiné à charger directement le fichier propre de Papa Ibrahima Samb
# ==============================================================================
import logging
from typing import Tuple, Dict, Any, Optional
import pandas as pd
import numpy as np

import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("DataLoader")


class DataLoader:
    """
    Chargeur robuste pour le fichier de données consolidé de Dakar Respire.
    Gère les valeurs manquantes (-999), les zéros anormaux, les doublons,
    l'harmonisation horaire UTC et la détection flexible des colonnes présentes.
    """

    def __init__(self, file_path: Optional[str] = None):
        self.file_path = file_path or (
            config.CLEAN_DATA_FILE if config.CLEAN_DATA_FILE.exists() else config.SIMULATED_DATA_FILE
        )
        self.audit_report: Dict[str, Any] = {}

    def load_data(self) -> pd.DataFrame:
        """
        Lit le fichier CSV, effectue le nettoyage et renvoie un DataFrame indexé par heure UTC.
        """
        if not self.file_path.exists():
            raise FileNotFoundError(
                f"Fichier de données introuvable : {self.file_path}. "
                "Veuillez générer les données simulées ou fournir le fichier propre de Papa Ibrahima Samb."
            )

        logger.info(f"Lecture des données depuis : {self.file_path}")
        df = pd.read_csv(self.file_path)

        # 1. Vérification de la colonne d'horodatage
        if config.DATETIME_COL not in df.columns:
            # Recherche d'alternatives possibles (ex: 'date', 'datetime', 'time')
            possible_time_cols = [c for c in df.columns if c.lower() in ["date", "datetime", "time", "horodatage"]]
            if possible_time_cols:
                df.rename(columns={possible_time_cols[0]: config.DATETIME_COL}, inplace=True)
            else:
                raise ValueError(f"Colonne temporelle obligatoire '{config.DATETIME_COL}' absente du fichier.")

        # Conversion en datetime UTC (fuseau Afrique/Dakar = UTC+00:00)
        df[config.DATETIME_COL] = pd.to_datetime(df[config.DATETIME_COL], utc=True)
        df.sort_values(config.DATETIME_COL, inplace=True)

        # 2. Vérification de la cible PM2.5
        if config.TARGET_COL not in df.columns:
            possible_target = [c for c in df.columns if "pm25" in c.lower() or "pm2.5" in c.lower()]
            if possible_target:
                df.rename(columns={possible_target[0]: config.TARGET_COL}, inplace=True)
            else:
                raise ValueError(f"Variable cible '{config.TARGET_COL}' absente du fichier.")

        # 3. Remplacement des codes manquants de réanalyse (-999)
        for na_val in config.NA_CODES:
            df.replace(na_val, np.nan, inplace=True)

        # 4. Traitement des valeurs anormales de PM2.5
        # Les capteurs bon marché peuvent renvoyer des valeurs négatives ou des zéros consécutifs suspects
        df[config.TARGET_COL] = pd.to_numeric(df[config.TARGET_COL], errors="coerce")
        df.loc[df[config.TARGET_COL] < 0, config.TARGET_COL] = np.nan

        # Si le 2e percentile descend à 0 µg/m³ ou zéro persistant pendant plusieurs heures,
        # on applique une interpolation linéaire prudente (max 3 heures consécutives)
        consecutive_zeros = (df[config.TARGET_COL] == 0) & (df[config.TARGET_COL].shift(1) == 0)
        df.loc[consecutive_zeros, config.TARGET_COL] = np.nan

        # 5. Gestion des doublons temporels (moyenne par heure si plusieurs mesures)
        if df[config.DATETIME_COL].duplicated().any():
            logger.warning("Doublons temporels détectés. Agrégation par moyenne horaire...")
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            agg_dict = {col: "mean" for col in numeric_cols}
            # Conserver la première valeur pour les colonnes non numériques (ex: station)
            non_numeric = [c for c in df.columns if c not in numeric_cols and c != config.DATETIME_COL]
            for col in non_numeric:
                agg_dict[col] = "first"
            df = df.groupby(config.DATETIME_COL).agg(agg_dict).reset_index()

        # 6. Rééchantillonnage strict au pas horaire (1H)
        df.set_index(config.DATETIME_COL, inplace=True)
        full_hourly_index = pd.date_range(start=df.index.min(), end=df.index.max(), freq="1h", tz="UTC")
        df = df.reindex(full_hourly_index)
        df.index.name = config.DATETIME_COL

        # 7. Interpolation prudente des petits trous (< 3h)
        df[config.TARGET_COL] = df[config.TARGET_COL].interpolate(method="time", limit=3)

        # 8. Génération du rapport d'audit qualité
        self._generate_audit_report(df)

        return df

    def _generate_audit_report(self, df: pd.DataFrame) -> None:
        """Produit un résumé statistique de la qualité du jeu de données."""
        total_rows = len(df)
        pm25_missing = df[config.TARGET_COL].isna().sum()
        pm25_missing_pct = (pm25_missing / total_rows) * 100 if total_rows > 0 else 0

        available_features = [c for c in df.columns if c != config.TARGET_COL]

        self.audit_report = {
            "source_file": str(self.file_path),
            "start_date": df.index.min().isoformat() if not df.empty else None,
            "end_date": df.index.max().isoformat() if not df.empty else None,
            "total_hours": total_rows,
            "pm25_missing_count": int(pm25_missing),
            "pm25_missing_percent": round(pm25_missing_pct, 2),
            "pm25_mean": round(df[config.TARGET_COL].mean(), 2) if not df.empty else None,
            "pm25_median": round(df[config.TARGET_COL].median(), 2) if not df.empty else None,
            "pm25_max": round(df[config.TARGET_COL].max(), 2) if not df.empty else None,
            "available_features": available_features,
            "is_simulated": bool("is_simulated" in df.columns or "simulated" in str(self.file_path).lower()),
        }

        logger.info(
            f"Audit données : {total_rows} heures couvertes du {self.audit_report['start_date']} "
            f"au {self.audit_report['end_date']} | Taux de manquant PM2.5 : {pm25_missing_pct:.1f}%"
        )
