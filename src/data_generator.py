# ==============================================================================
# PROJET DAKAR RESPIRE - GÉNÉRATEUR DE DONNÉES SIMULÉES RÉALISTES
# Basé sur les connaissances de domaine d'Alioune Badara Sarr et du CGQA
# ==============================================================================
"""
Ce générateur produit une série temporelle synthétique mais rigoureusement
calibrée sur la physique et la météorologie réelles de Dakar :
1. Cycle journalier : creux nocturne à 03h-04h (~4-8 µg/m³), pic du soir à ~20h (~18-35 µg/m³).
2. Deux régimes saisonniers :
   - Saison sèche (Nov-Mai) : Harmattan (vent NE), poussières désertiques, épisodes de brume sèche.
   - Saison des pluies (Juil-Oct) : lessivage atmosphérique par les averses.
3. Données satellites et CAMS synthétiques cohérentes avec les poussières au sol.
4. ÉTIQUETAGE OBLIGATOIRE : 'is_simulated = True'.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timezone
import config


def generate_synthetic_dakar_data(
    start_date: str = "2025-11-01 00:00:00",
    end_date: str = "2026-11-23 23:00:00",
    seed: int = 42,
) -> pd.DataFrame:
    """
    Génère un jeu de données horaire pour Dakar intégrant la dynamique
    météo, satellitaire et particulaire documentée par l'équipe.
    """
    np.random.seed(seed)
    time_index = pd.date_range(start=start_date, end=end_date, freq="1h", tz="UTC")
    n = len(time_index)

    df = pd.DataFrame(index=time_index)
    df.index.name = config.DATETIME_COL

    hours = time_index.hour.values
    months = time_index.month.values
    day_of_year = time_index.dayofyear.values

    # --------------------------------------------------------------------------
    # 1. MÉTÉOROLOGIE SIMULÉE (Inspirée du climat de Dakar)
    # --------------------------------------------------------------------------
    # Température : plus chaude de mai à octobre (26-32°C), plus fraîche de janvier à mars (18-24°C)
    base_temp = 25.0 + 4.0 * np.sin(2 * np.pi * (day_of_year - 120) / 365.25)
    diurnal_temp = 3.5 * np.sin(2 * np.pi * (hours - 9) / 24)
    temp_c = base_temp + diurnal_temp + np.random.normal(0, 1.2, n)
    df["temp_c"] = np.round(temp_c, 1)

    # Humidité relative : élevée en hivernage (75-90%), modérée en saison sèche (40-65%)
    base_rh = 65.0 - 15.0 * np.sin(2 * np.pi * (day_of_year - 60) / 365.25)
    diurnal_rh = -12.0 * np.sin(2 * np.pi * (hours - 9) / 24)
    rh_pct = np.clip(base_rh + diurnal_rh + np.random.normal(0, 4.0, n), 25.0, 98.0)
    df["rh_pct"] = np.round(rh_pct, 1)

    # Vent : vitesse moyenne 3 à 7 m/s, plus fort l'après-midi (brise marine)
    base_wind = 4.5 + 1.5 * np.sin(2 * np.pi * (hours - 12) / 24)
    wind_ms = np.clip(base_wind + np.random.normal(0, 1.0, n), 0.8, 14.0)
    df["wind_ms"] = np.round(wind_ms, 1)

    # Direction du vent :
    # En saison sèche (novembre à avril), dominante alizé / Harmattan Nord-Est (20° à 60°)
    # En saison des pluies (juillet à septembre), mousson Sud-Ouest (180° à 240°)
    is_dry_season = np.isin(months, config.DRY_SEASON_MONTHS)
    wind_dir = np.where(
        is_dry_season,
        np.random.normal(45, 25, n),   # Nord-Est (Harmattan dominant)
        np.random.normal(210, 30, n),  # Sud-Ouest (Mousson humide)
    ) % 360.0
    df["wind_dir_deg"] = np.round(wind_dir, 0)

    # Précipitations : concentrées en juillet, août et septembre
    precip_mm = np.zeros(n)
    is_rainy_season = np.isin(months, [7, 8, 9])
    rain_probability = np.where(is_rainy_season, 0.05, 0.001)
    rain_mask = np.random.random(n) < rain_probability
    precip_mm[rain_mask] = np.random.exponential(scale=6.0, size=rain_mask.sum())
    df["precip_mm"] = np.round(precip_mm, 1)

    # Pression atmosphérique (~101.3 kPa à Dakar au niveau de la mer)
    df["pressure_kpa"] = np.round(101.3 + 0.3 * np.sin(2 * np.pi * hours / 12) + np.random.normal(0, 0.1, n), 2)

    # --------------------------------------------------------------------------
    # 2. PARTICULES PM2.5 (Physique locale, trafic et poussière saharienne)
    # --------------------------------------------------------------------------
    # Base saisonnière : ~30 µg/m³ en saison sèche (poussières), ~12 µg/m³ en saison des pluies
    seasonal_pm25 = np.where(is_dry_season, 28.0, 12.0)

    # Profil horaire exact d'Alioune & Mously (creux 03h-04h, pic 20h)
    # Approximation par combinaison d'harmoniques de Fourier
    diurnal_pm25 = (
        -8.0 * np.cos(2 * np.pi * (hours - 4) / 24)   # Creux vers 04h (-8 µg/m³)
        + 10.0 * np.sin(2 * np.pi * (hours - 14) / 24) # Pic vers 20h (+10 µg/m³)
    )

    # Effet Harmattan (vent NE entre 20° et 70° en saison sèche)
    is_harmattan = is_dry_season & (df["wind_dir_deg"] >= config.HARMATTAN_WIND_DIR_MIN) & (df["wind_dir_deg"] <= config.HARMATTAN_WIND_DIR_MAX)
    harmattan_factor = np.where(is_harmattan, df["wind_ms"] * 3.5, 0.0)

    # Épisodes brutaux de brume sèche (simulant 6 tempêtes de poussière majeures dans l'année)
    dust_events = np.zeros(n)
    for _ in range(6):
        event_start = np.random.randint(0, n - 72)
        # Uniquement en saison sèche (décembre à mars)
        if months[event_start] in [12, 1, 2, 3]:
            event_duration = np.random.randint(24, 72)  # Dure 1 à 3 jours
            profile = np.hanning(event_duration) * np.random.uniform(50.0, 130.0)
            dust_events[event_start : event_start + event_duration] += profile

    # Lessivage par la pluie (washout)
    washout_factor = np.where(df["precip_mm"] > 0.5, 0.35, 1.0)

    # Bruit stochastique
    noise = np.random.normal(0, 3.5, n)

    pm25 = (seasonal_pm25 + diurnal_pm25 + harmattan_factor + dust_events + noise) * washout_factor
    pm25 = np.clip(pm25, 2.0, 350.0)  # Valeurs physiquement réalistes (min 2, max 350 en pic)
    df[config.TARGET_COL] = np.round(pm25, 1)

    # --------------------------------------------------------------------------
    # 3. DONNÉES SATELLITAIRES & MODÈLES (CAMS / Sentinel-5P)
    # --------------------------------------------------------------------------
    # AOD (Épaisseur optique des aérosols) : corrélée avec la charge particulaire totale
    aod = (df[config.TARGET_COL] / 55.0) + np.random.normal(0, 0.08, n)
    df["aod"] = np.round(np.clip(aod, 0.05, 3.5), 3)

    # Dust AOD (composante spécifique poussières)
    dust_aod = np.where(is_dry_season, df["aod"] * 0.75, df["aod"] * 0.25)
    df["dust_aod"] = np.round(np.clip(dust_aod, 0.01, 3.0), 3)

    # Gaz Sentinel-5P (NO2 lié au trafic urbain, pic le matin et le soir)
    no2_cycle = np.clip(1.5 + np.sin(2 * np.pi * (hours - 8) / 24) * 0.8 + np.random.normal(0, 0.2, n), 0.2, 5.0)
    df["no2"] = np.round(no2_cycle, 3)

    # CO (monoxyde de carbone)
    df["co"] = np.round(0.035 + (df[config.TARGET_COL] / 1500.0) + np.random.normal(0, 0.005, n), 4)

    # Prévision CAMS brute (sert de baseline à battre) : modèle physique avec biais systématique
    # En pratique, les modèles globaux sous-estiment les pics d'Harmattan locaux
    cams_pm25 = df[config.TARGET_COL] * 0.78 + np.random.normal(0, 8.0, n)
    df["cams_pm25_raw"] = np.round(np.clip(cams_pm25, 3.0, 200.0), 1)

    # Métadonnées
    df["station"] = "Simulation_Dakar_Composite"
    df["is_simulated"] = True

    return df


def ensure_simulated_data_file() -> str:
    """Génère et sauvegarde le fichier simulé s'il n'existe pas encore."""
    config.PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_file = config.SIMULATED_DATA_FILE
    if not out_file.exists():
        df = generate_synthetic_dakar_data()
        df.to_csv(out_file)
    return str(out_file)


if __name__ == "__main__":
    path = ensure_simulated_data_file()
    print(f"Jeu de données simulé généré avec succès : {path}")
