"""
DAKAR RESPIRE — Téléchargement des données météorologiques NASA POWER
Responsable : El Hadji Ibrahima Diop Sow

Télécharge les séries horaires pour Dakar :
- 2025-01-01 au 2025-12-31
- 2026-01-01 au 2026-11-23 (dernière journée complète avant le 24/11/2026)

Dépendances :
    pip install requests pandas

Exécution :
    python telecharger_meteo_dakar_nasa_power.py

Sorties :
    meteo_dakar_2025.csv
    meteo_dakar_2026.csv
    meteo_dakar_2025_2026.csv

Les valeurs manquantes NASA (-999) sont converties en cellules vides.
Les horodatages sont conservés en UTC.
"""

from pathlib import Path
import requests
import pandas as pd

LATITUDE = 14.7167
LONGITUDE = -17.4677
BASE_URL = "https://power.larc.nasa.gov/api/temporal/hourly/point"
PARAMETERS = ["T2M", "RH2M", "WS10M", "WD10M", "PRECTOTCORR"]
COMMUNITY = "RE"
OUTPUT_DIR = Path(__file__).resolve().parent

COLUMN_NAMES = {
    "T2M": "temperature_2m_C",
    "RH2M": "humidite_relative_2m_pct",
    "WS10M": "vitesse_vent_10m_m_s",
    "WD10M": "direction_vent_10m_deg",
    "PRECTOTCORR": "precipitations_corrigees_mm_h",
}


def fetch_period(start: str, end: str) -> pd.DataFrame:
    params = {
        "parameters": ",".join(PARAMETERS),
        "community": COMMUNITY,
        "longitude": LONGITUDE,
        "latitude": LATITUDE,
        "start": start,
        "end": end,
        "format": "JSON",
        "time-standard": "UTC",
    }
    response = requests.get(BASE_URL, params=params, timeout=120)
    response.raise_for_status()
    payload = response.json()

    try:
        parameter_data = payload["properties"]["parameter"]
    except (KeyError, TypeError):
        raise RuntimeError(
            "Réponse NASA POWER inattendue : " + str(payload)[:1500]
        )

    frames = []
    for code in PARAMETERS:
        if code not in parameter_data:
            raise RuntimeError(
                f"Paramètre {code} absent de la réponse NASA POWER. "
                f"Paramètres reçus : {list(parameter_data.keys())}"
            )
        series = pd.Series(parameter_data[code], name=COLUMN_NAMES[code])
        frames.append(series)

    df = pd.concat(frames, axis=1).reset_index(names="date_heure_utc")
    df["date_heure_utc"] = pd.to_datetime(
        df["date_heure_utc"], format="%Y%m%d%H", utc=True, errors="coerce"
    )
    df = df.dropna(subset=["date_heure_utc"])
    df = df.sort_values("date_heure_utc").reset_index(drop=True)

    # NASA POWER utilise -999 pour signaler certaines valeurs indisponibles.
    for col in COLUMN_NAMES.values():
        df[col] = pd.to_numeric(df[col], errors="coerce").replace(-999, pd.NA)

    df.insert(1, "latitude", LATITUDE)
    df.insert(2, "longitude", LONGITUDE)
    df["source"] = "NASA POWER Hourly API"
    return df


def main():
    periods = [
        ("20250101", "20251231", "meteo_dakar_2025.csv"),
        ("20260101", "20261123", "meteo_dakar_2026.csv"),
    ]
    all_frames = []

    for start, end, filename in periods:
        print(f"Téléchargement NASA POWER : {start} à {end} ...")
        df = fetch_period(start, end)
        path = OUTPUT_DIR / filename
        df.to_csv(path, index=False, encoding="utf-8-sig")
        print(f"Fichier créé : {path} — {len(df)} lignes")
        all_frames.append(df)

    combined = pd.concat(all_frames, ignore_index=True)
    combined = combined.sort_values("date_heure_utc").reset_index(drop=True)
    combined_path = OUTPUT_DIR / "meteo_dakar_2025_2026.csv"
    combined.to_csv(combined_path, index=False, encoding="utf-8-sig")

    print("\nTéléchargement terminé.")
    print(f"Fichier consolidé : {combined_path}")
    print(f"Nombre total de lignes : {len(combined)}")
    print("\nContrôle rapide des valeurs manquantes :")
    print(combined.isna().sum())


if __name__ == "__main__":
    main()
