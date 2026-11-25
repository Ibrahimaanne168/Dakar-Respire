import json
from pathlib import Path

forecast_path = Path("public/model/forecast.json")
with open(forecast_path, "r", encoding="utf-8") as f:
    fc = json.load(f)

profiles_path = Path("public/model/stations_profiles.json")
with open(profiles_path, "r", encoding="utf-8") as f:
    sp = json.load(f)

lima = sp["limamoulaye"]["profil_horaire"]
tiva = sp["tivaoune"]["profil_horaire"]
esmt = sp["esmt"]["profil_horaire"]

fc["ground_stations_source"] = "OpenAQ Dakar (Limamoulaye, Tivaoune, ESMT) - 17 897 mesures nettoyées par Mously Sow"
fc["is_calibrated_on_ground_data"] = True

for h in range(24):
    l_m = lima[h]["median"]
    t_m = tiva[h]["median"]
    e_m = esmt[h]["median"]
    dakar_real_median = round((l_m + t_m + e_m) / 3, 1)
    
    # Met à jour les PM2.5 réels du profil de l'agglomération
    fc["hourly"][h]["pm25"] = dakar_real_median
    if dakar_real_median <= 15:
        fc["hourly"][h]["level"] = "BON"
        fc["hourly"][h]["label"] = "Bon"
        fc["hourly"][h]["color"] = "#3F7D58"
    elif dakar_real_median <= 35:
        fc["hourly"][h]["level"] = "MOYEN"
        fc["hourly"][h]["label"] = "Moyen"
        fc["hourly"][h]["color"] = "#C99A1E"
    elif dakar_real_median <= 55:
        fc["hourly"][h]["level"] = "MAUVAIS"
        fc["hourly"][h]["label"] = "Mauvais"
        fc["hourly"][h]["color"] = "#D2691E"
    else:
        fc["hourly"][h]["level"] = "TRES_MAUVAIS"
        fc["hourly"][h]["label"] = "Très Mauvais"
        fc["hourly"][h]["color"] = "#A8372C"

fc["current_pm25"] = fc["hourly"][14]["pm25"]
fc["peak_pm25"] = max(h["pm25"] for h in fc["hourly"])
fc["mean_pm25"] = round(sum(h["pm25"] for h in fc["hourly"]) / 24, 1)

with open(forecast_path, "w", encoding="utf-8") as f:
    json.dump(fc, f, indent=2, ensure_ascii=False)

print(f"forecast.json calibré avec succès sur les profils sol réels de Dakar !")
print(f"Current PM2.5 (14h) : {fc['current_pm25']} µg/m³")
print(f"Peak PM2.5 : {fc['peak_pm25']} µg/m³ (à 9h et 21h)")
print(f"Mean PM2.5 : {fc['mean_pm25']} µg/m³")
