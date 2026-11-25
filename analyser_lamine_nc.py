"""
DAKAR RESPIRE — Analyse des fichiers NetCDF Sentinel-5P de Lamine Cissé
Responsable : Lamine Cissé

Passes orbitales : 3 fichiers NRTI L2 NO2 du 25/11/2026
Bbox Dakar     : lat [14.55, 14.85], lon [-17.55, -17.10]
"""

import xarray as xr
import numpy as np
import pandas as pd
from pathlib import Path
import json

DONNEES_DIR = Path(__file__).resolve().parent / "donnees"
DATA_DIR    = Path(__file__).resolve().parent / "data"
PROCESSED   = DATA_DIR / "processed"
PROCESSED.mkdir(parents=True, exist_ok=True)

# Fichiers NetCDF de Lamine
NC_FILES = [
    "S5P_NRTI_L2_NO2_20261125T095052_20261125T095552_47244_03_030000.nc",
    "S5P_NRTI_L2_NO2_20261125T113052_20261125T113552_47245_03_030000.nc",
    "S5P_NRTI_L2_NO2_20261125T131552_20261125T132052_47246_03_030000.nc",
]

# Bbox Dakar
LAT_MIN, LAT_MAX = 14.45, 14.95
LON_MIN, LON_MAX = -17.65, -16.95

def inspect_nc(filepath: Path):
    """Ouvre un fichier NetCDF et affiche ses variables disponibles."""
    print(f"\n{'='*70}")
    print(f"Fichier : {filepath.name}")
    try:
        ds = xr.open_dataset(filepath, engine="netcdf4", group="PRODUCT")
    except Exception as e1:
        print(f"  Echec group=PRODUCT : {e1}")
        try:
            ds = xr.open_dataset(filepath, engine="netcdf4")
        except Exception as e2:
            print(f"  Echec sans groupe : {e2}")
            return None
    
    print(f"  Dimensions : {dict(ds.dims)}")
    print(f"  Variables  : {list(ds.data_vars)}")
    print(f"  Coordonnées: {list(ds.coords)}")
    return ds

def extract_dakar_pixels(filepath: Path, orbit_id: str) -> pd.DataFrame | None:
    """
    Extrait les pixels NO2 dans la bbox de Dakar depuis un fichier NC.
    Retourne un DataFrame ou None si aucune donnée.
    """
    # Sentinel-5P L2 : group PRODUCT
    try:
        ds = xr.open_dataset(filepath, engine="netcdf4", group="PRODUCT")
    except Exception as e:
        print(f"  Erreur ouverture {filepath.name}: {e}")
        return None

    # Coordonnées standard S5P L2
    lat_var = "latitude"
    lon_var = "longitude"
    no2_var = None
    
    # Chercher la variable NO2 principale
    for candidate in ["nitrogendioxide_tropospheric_column", 
                       "nitrogendioxide_total_column",
                       "NO2_column_number_density",
                       "tropospheric_NO2_column_number_density"]:
        if candidate in ds.data_vars:
            no2_var = candidate
            break
    
    if no2_var is None:
        print(f"  Variable NO2 non trouvée. Variables : {list(ds.data_vars)}")
        # Prendre la première variable float
        for v in ds.data_vars:
            if ds[v].dtype in [np.float32, np.float64]:
                no2_var = v
                print(f"  → Utilisation de {v} à la place")
                break
    
    if lat_var not in ds and "latitude" not in ds.coords:
        # Parfois latitude/longitude sont dans SUPPORT_DATA/GEOLOCATIONS
        try:
            geo = xr.open_dataset(filepath, engine="netcdf4", 
                                  group="PRODUCT/SUPPORT_DATA/GEOLOCATIONS")
            lat_arr = geo["latitude_bounds"].values
            lon_arr = geo["longitude_bounds"].values
        except Exception:
            print(f"  Coordonnées introuvables dans {filepath.name}")
            return None
    else:
        try:
            lat_arr = ds[lat_var].values  # shape (time, scanline, ground_pixel)
            lon_arr = ds[lon_var].values
        except Exception as e:
            print(f"  Erreur lecture lat/lon : {e}")
            return None

    # Récupération valeur NO2
    try:
        no2_arr = ds[no2_var].values  # mol/m² ou 1/m²
    except Exception as e:
        print(f"  Erreur lecture NO2 : {e}")
        return None

    # Aplatissement
    lat_flat = lat_arr.ravel()
    lon_flat = lon_arr.ravel()
    no2_flat = no2_arr.ravel()

    # Masque bbox Dakar
    mask = (
        (lat_flat >= LAT_MIN) & (lat_flat <= LAT_MAX) &
        (lon_flat >= LON_MIN) & (lon_flat <= LON_MAX) &
        np.isfinite(no2_flat) &
        (no2_flat >= 0)
    )

    n_pixels = int(mask.sum())
    print(f"  Pixels dans bbox Dakar : {n_pixels}")
    
    if n_pixels == 0:
        return None

    # Timestamp de la passe
    if "time" in ds.coords:
        t = pd.to_datetime(str(ds["time"].values[0]))
    else:
        # Extraire du nom de fichier : T095052
        import re
        m = re.search(r"T(\d{6})_", filepath.name)
        if m:
            hms = m.group(1)
            t = pd.Timestamp(f"2026-11-25T{hms[:2]}:{hms[2:4]}:{hms[4:6]}Z")
        else:
            t = pd.Timestamp("2026-11-25T12:00:00Z")

    df = pd.DataFrame({
        "timestamp_utc": t,
        "latitude":      lat_flat[mask],
        "longitude":     lon_flat[mask],
        "no2_mol_m2":    no2_flat[mask],
        "orbit_id":      orbit_id,
        "source":        "Sentinel-5P NRTI L2 NO2 (Lamine Cissé)",
    })

    # Conversion mol/m² → µmol/m² pour affichage
    df["no2_umol_m2"] = df["no2_mol_m2"] * 1e6
    
    # Statistiques
    print(f"  NO2 médiane : {df['no2_umol_m2'].median():.4f} µmol/m²")
    print(f"  NO2 max     : {df['no2_umol_m2'].max():.4f} µmol/m²")
    
    ds.close()
    return df


def main():
    all_dfs = []
    orbit_ids = ["47244", "47245", "47246"]
    
    for nc_file, orbit_id in zip(NC_FILES, orbit_ids):
        fp = DONNEES_DIR / nc_file
        if not fp.exists():
            print(f"MANQUANT : {nc_file}")
            continue
        
        print(f"\nInspection de {nc_file}...")
        ds = inspect_nc(fp)
        if ds is not None:
            ds.close()
        
        print(f"\nExtraction bbox Dakar pour orbite {orbit_id}...")
        df = extract_dakar_pixels(fp, orbit_id)
        if df is not None:
            all_dfs.append(df)

    if not all_dfs:
        print("\nAucune donnée extraite pour Dakar — vérifier les fichiers NC.")
        return

    combined = pd.concat(all_dfs, ignore_index=True)
    combined = combined.sort_values("timestamp_utc").reset_index(drop=True)
    
    out_csv = PROCESSED / "satellite_lamine_dakar.csv"
    combined.to_csv(out_csv, index=False, encoding="utf-8-sig")
    print(f"\nFichier produit : {out_csv} ({len(combined)} pixels)")

    # Statistiques globales
    stats = {
        "source": "Sentinel-5P NRTI L2 NO2",
        "responsable": "Lamine Cissé",
        "date": "2026-11-25",
        "passes": [
            {"orbit": "47244", "time_utc": "09:50 UTC", "file": NC_FILES[0]},
            {"orbit": "47245", "time_utc": "11:30 UTC", "file": NC_FILES[1]},
            {"orbit": "47246", "time_utc": "13:15 UTC", "file": NC_FILES[2]},
        ],
        "bbox_dakar": {
            "lat_min": LAT_MIN, "lat_max": LAT_MAX,
            "lon_min": LON_MIN, "lon_max": LON_MAX
        },
        "n_pixels_total": int(len(combined)),
        "no2_mediane_umol_m2": float(combined["no2_umol_m2"].median()),
        "no2_max_umol_m2":     float(combined["no2_umol_m2"].max()),
        "no2_min_umol_m2":     float(combined["no2_umol_m2"].min()),
        "note": "NO2 troposphérique. Valeurs > 0,2 µmol/m² indiquent pollution anthropique significative."
    }
    
    out_json = PROCESSED / "satellite_lamine_stats.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"Stats JSON : {out_json}")
    print(f"\n--- Résumé ---")
    print(f"NO2 médiane : {stats['no2_mediane_umol_m2']:.4f} µmol/m²")
    print(f"NO2 max     : {stats['no2_max_umol_m2']:.4f} µmol/m²")
    print(f"Pixels total: {stats['n_pixels_total']}")


if __name__ == "__main__":
    main()
