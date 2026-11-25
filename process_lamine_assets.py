from PIL import Image
from pathlib import Path
import shutil
import json

pub_sat = Path("public/satellite")
pub_sat.mkdir(parents=True, exist_ok=True)

# 1. Copier la vidéo timelapse
video_src = Path("donnees/Sentinel-5P_AER_AI-110352632362226-timelapse.mp4")
if video_src.exists():
    dst = pub_sat / "sentinel5p_aer_ai_timelapse.mp4"
    shutil.copy(video_src, dst)
    print(f"Copied video ({video_src.stat().st_size} bytes) -> {dst}")

# 2. Traiter l'image haute définition PNG (9930 x 6865)
img_src = Path("donnees/2026_11_25_00_00_2026_11_25_23_59_Sentinel_5P_NO2_Nitrogen_Dioxide.png")
if img_src.exists():
    im = Image.open(img_src)
    w, h = im.size
    print(f"Original image size: {w}x{h}")

    # Version web 1920px (webp)
    ratio = 1920 / w
    new_h = int(h * ratio)
    im_web = im.resize((1920, new_h), Image.Resampling.LANCZOS)
    im_web.save(pub_sat / "sentinel5p_no2_dakar_20261125.webp", format="WEBP", quality=85)
    print(f"Saved webp: 1920x{new_h}")

    # Miniature 800px (webp)
    ratio_thumb = 800 / w
    new_h_thumb = int(h * ratio_thumb)
    im_thumb = im.resize((800, new_h_thumb), Image.Resampling.LANCZOS)
    im_thumb.save(pub_sat / "sentinel5p_no2_thumb.webp", format="WEBP", quality=80)
    print(f"Saved thumbnail: 800x{new_h_thumb}")

# 3. Créer un fichier de métadonnées satellite pour le site web
meta = {
    "responsable": "Lamine Cissé",
    "satellite": "Sentinel-5P TROPOMI (Copernicus)",
    "fournisseur": "Copernicus Data Space Ecosystem (CDSE) / Sentinel Hub",
    "date_acquisition": "2026-11-25",
    "capteur": "TROPOMI (TROPOspheric Monitoring Instrument)",
    "resolution_spatiale": "5.5 km × 3.5 km",
    "produits": [
        {
            "code": "S5P_NO2",
            "nom": "Dioxyde d'azote troposphérique (NO2)",
            "description": "Traceur anthropique direct du trafic routier, des centrales thermiques et des activités industrielles.",
            "emprise": "Sénégal & Presqu'île du Cap-Vert",
            "date": "25 novembre 2026",
            "image_web": "/satellite/sentinel5p_no2_dakar_20261125.webp",
            "image_thumb": "/satellite/sentinel5p_no2_thumb.webp"
        },
        {
            "code": "S5P_AER_AI",
            "nom": "Indice d'aérosols UV (Aerosol Index 340/380 nm)",
            "description": "Détection optique des particules absorbantes en altitude (poussières sahariennes transportées par l'Harmattan).",
            "emprise": "Dakar [14.63°N, -17.24°O, Zoom 10] & Afrique de l'Ouest",
            "date": "23-25 novembre 2026",
            "video_timelapse": "/satellite/sentinel5p_aer_ai_timelapse.mp4"
        }
    ],
    "diagnostic_netcdf": {
        "fichiers_telecharges": [
            "S5P_NRTI_L2_NO2_20261125T095052_20261125T095552_47244_03_030000.nc",
            "S5P_NRTI_L2_NO2_20261125T113052_20261125T113552_47245_03_030000.nc",
            "S5P_NRTI_L2_NO2_20261125T131552_20261125T132052_47246_03_030000.nc"
        ],
        "analyse_technique": "Les 3 granules NetCDF L2 bruts téléchargés correspondent aux trajectoires 47244-47246 (Eurasie/Atlantique Nord). L'acquisition sur Dakar a été visualisée et exportée directement via l'API CDSE Process/WMS par Lamine Cissé (52 requêtes enregistrées le 25/11/2026)."
    }
}

with open(pub_sat / "satellite_lamine_metadata.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)
print("Saved metadata to public/satellite/satellite_lamine_metadata.json")
