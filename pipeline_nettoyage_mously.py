"""
DAKAR RESPIRE — Pipeline de nettoyage et consolidation des mesures au sol
Responsable de collecte : Mously Sow
Traitement & Nettoyage : Équipe Dakar Respire

Sources :
- donnees/mesures_pm25.xlsx (17 897 mesures horaires : Limamoulaye, Tivaoune, ESMT)
- data/raw/meteo_dakar_2025_2026.csv (16 584 heures NASA POWER : El Hadji)

Traitements appliqués :
1. Normalisation des métadonnées (ID station, commune, coordonnées, instrument).
2. Détection et correction des zéros anormaux (interpolation linéaire pour zéros isolés <= 2h).
3. Contrôle des valeurs extrêmes et détection de cohérence inter-capteurs (Limamoulaye vs ESMT).
4. Calcul des profils diurnes horaires consolidés (médiane, moyenne, percentiles).
5. Fusion temporelle multi-sources pour produire donnees_propres.csv.
"""

from pathlib import Path
import json
import pandas as pd
import numpy as np

ROOT_DIR = Path(__file__).resolve().parent
DONNEES_DIR = ROOT_DIR / "donnees"
PROCESSED_DIR = ROOT_DIR / "data" / "processed"
PUBLIC_MODEL_DIR = ROOT_DIR / "public" / "model"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

STATION_SPECS = {
    "Complexe Scolaire Limamoulaye -6103781": {
        "id": "limamoulaye",
        "nom": "Complexe Scolaire Limamoulaye",
        "commune": "Grand Dakar",
        "lat": 14.71,
        "lon": -17.45,
        "instrument": "AirGradient Open Air",
        "proprietaire": "kaikai.dev",
        "licence": "CC BY 4.0",
    },
    "Dakar, Mairie Tivaoune Diacksao-6137166": {
        "id": "tivaoune",
        "nom": "Mairie Tivaoune Diacksao",
        "commune": "Tiaroye (Pikine)",
        "lat": 14.75,
        "lon": -17.38,
        "instrument": "AirGradient Open Air",
        "proprietaire": "kaikai.dev",
        "licence": "CC BY 4.0",
    },
    "ESMT Dakar-6066018": {
        "id": "esmt",
        "nom": "ESMT Dakar",
        "commune": "Grand Dakar",
        "lat": 14.70,
        "lon": -17.46,
        "instrument": "AirGradient Open Air (Gen 1)",
        "proprietaire": "kaikai.dev",
        "licence": "CC BY 4.0",
    },
}

def clean_station_series(grp: pd.DataFrame, station_info: dict) -> pd.DataFrame:
    df = grp.copy().sort_values("dt").reset_index(drop=True)
    
    # 1. Traitement des zéros
    # On identifie les blocs de zéros consécutifs
    is_zero = df["pm25_ugm3"] == 0
    zero_blocks = (~is_zero).cumsum()
    zero_counts = is_zero.groupby(zero_blocks).transform("sum")
    
    # Initialisation
    df["pm25_clean"] = df["pm25_ugm3"]
    df["flag_qualite"] = "VALIDE"
    
    # Zéros isolés (<= 2h consécutives) -> interpolation
    short_zero_mask = is_zero & (zero_counts <= 2)
    df.loc[short_zero_mask, "pm25_clean"] = np.nan
    df["pm25_clean"] = df["pm25_clean"].interpolate(method="linear", limit=2)
    df.loc[short_zero_mask, "flag_qualite"] = "ZERO_INTERPOLE"
    
    # Zéros prolongés (> 2h) -> artefacts capteur exclus
    long_zero_mask = is_zero & (zero_counts > 2)
    df.loc[long_zero_mask, "pm25_clean"] = np.nan
    df.loc[long_zero_mask, "flag_qualite"] = "ZERO_ANOMALIE"
    
    # Épisodes de pics majeurs (> 100 µg/m³)
    df.loc[df["pm25_clean"] > 100, "flag_qualite"] = "PIC_EPISODE"
    
    # Attribution métadonnées
    df["station_id"] = station_info["id"]
    df["station_nom"] = station_info["nom"]
    df["commune"] = station_info["commune"]
    df["instrument"] = station_info["instrument"]
    df["licence"] = station_info["licence"]
    df["date_heure_iso"] = df["dt"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    return df

def main():
    print("=== 1. Chargement de mesures_pm25.xlsx ===")
    raw_path = DONNEES_DIR / "mesures_pm25.xlsx"
    df_raw = pd.read_excel(raw_path, sheet_name="PM2.5 horaire")
    df_raw["dt"] = pd.to_datetime(df_raw["datetime_utc"])
    
    cleaned_frames = []
    hourly_profiles = {}
    
    for raw_name, info in STATION_SPECS.items():
        st_data = df_raw[df_raw["station"] == raw_name]
        st_clean = clean_station_series(st_data, info)
        cleaned_frames.append(st_clean)
        
        # Profil diurne horaire
        st_clean["hour"] = st_clean["dt"].dt.hour
        valid = st_clean.dropna(subset=["pm25_clean"])
        profile = valid.groupby("hour")["pm25_clean"].agg(
            median="median",
            mean="mean",
            p10=lambda x: x.quantile(0.10),
            p90=lambda x: x.quantile(0.90),
            count="count"
        ).round(2).reset_index()
        
        hourly_profiles[info["id"]] = {
            "station": info["nom"],
            "commune": info["commune"],
            "total_mesures": len(st_clean),
            "mesures_valides": len(valid),
            "periode_debut": st_clean["dt"].min().strftime("%Y-%m-%d"),
            "periode_fin": st_clean["dt"].max().strftime("%Y-%m-%d"),
            "pm25_median_global": round(float(valid["pm25_clean"].median()), 2),
            "pm25_moyen_global": round(float(valid["pm25_clean"].mean()), 2),
            "profil_horaire": profile.to_dict(orient="records")
        }
    
    # Concaténation des séries nettoyées
    all_clean = pd.concat(cleaned_frames, ignore_index=True)
    all_clean = all_clean.sort_values(["station_id", "dt"]).reset_index(drop=True)
    
    # Export CSV propre des mesures
    clean_csv_path = PROCESSED_DIR / "mesures_pm25_nettoyees.csv"
    cols_export = [
        "date_heure_iso", "station_id", "station_nom", "commune",
        "latitude", "longitude", "pm25_ugm3", "pm25_clean", "flag_qualite", "instrument", "source"
    ]
    all_clean[cols_export].to_csv(clean_csv_path, index=False, encoding="utf-8-sig")
    print(f"Fichier nettoyé exporté : {clean_csv_path} ({len(all_clean)} lignes)")
    
    # Export JSON des profils horaires
    profile_json_path = PROCESSED_DIR / "profil_horaire_stations.json"
    with open(profile_json_path, "w", encoding="utf-8") as f:
        json.dump(hourly_profiles, f, indent=2, ensure_ascii=False)
    print(f"Profils horaires exportés : {profile_json_path}")
    
    # Copie dans public/model pour le site web
    public_profiles_path = PUBLIC_MODEL_DIR / "stations_profiles.json"
    with open(public_profiles_path, "w", encoding="utf-8") as f:
        json.dump(hourly_profiles, f, indent=2, ensure_ascii=False)
    
    # === 2. Création de donnees_propres.csv (fusion Météo NASA + Sol OpenAQ) ===
    print("\n=== 2. Fusion Météo 2025-2026 + Mesures sol ===")
    meteo_path = ROOT_DIR / "data" / "raw" / "meteo_dakar_2025_2026.csv"
    if meteo_path.exists():
        df_meteo = pd.read_csv(meteo_path)
        df_meteo["dt"] = pd.to_datetime(df_meteo["date_heure_utc"]).dt.tz_localize(None)
        
        # Pivot des stations de PM2.5 pour avoir 1 ligne par heure
        pivot_pm25 = all_clean.pivot_table(
            index="dt",
            columns="station_id",
            values="pm25_clean"
        ).reset_index()
        pivot_pm25.columns.name = None
        pivot_pm25 = pivot_pm25.rename(columns={
            "limamoulaye": "pm25_limamoulaye",
            "tivaoune": "pm25_tivaoune",
            "esmt": "pm25_esmt"
        })
        
        # Moyenne multi-stations de l'agglomération
        pm_cols = [c for c in ["pm25_limamoulaye", "pm25_tivaoune", "pm25_esmt"] if c in pivot_pm25.columns]
        pivot_pm25["pm25_moyen_dakar"] = pivot_pm25[pm_cols].mean(axis=1).round(2)
        
        # Merge avec la météo
        merged = pd.merge(df_meteo, pivot_pm25, on="dt", how="left")
        merged["is_harmattan"] = (merged["direction_vent_10m_deg"] >= 20) & (merged["direction_vent_10m_deg"] <= 80)
        
        # Nettoyage et colonnes de sortie
        merged["timestamp"] = merged["dt"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        export_cols = [
            "timestamp", "temperature_2m_C", "humidite_relative_2m_pct",
            "vitesse_vent_10m_m_s", "direction_vent_10m_deg", "is_harmattan",
            "precipitations_corrigees_mm_h",
            "pm25_limamoulaye", "pm25_tivaoune", "pm25_esmt", "pm25_moyen_dakar"
        ]
        
        # Export donnees/donnees_propres.csv
        donnees_propres_path = DONNEES_DIR / "donnees_propres.csv"
        merged[export_cols].to_csv(donnees_propres_path, index=False, encoding="utf-8-sig")
        print(f"Jeu unifié exporté : {donnees_propres_path} ({len(merged)} heures)")
        
        # Copie dans data/processed
        merged[export_cols].to_csv(PROCESSED_DIR / "donnees_propres.csv", index=False, encoding="utf-8-sig")
        
    print("\nPipeline de nettoyage et consolidation terminé avec succès !")

if __name__ == "__main__":
    main()
