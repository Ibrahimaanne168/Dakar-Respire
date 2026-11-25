import json

with open('public/model/forecast.json', encoding='utf-8') as f:
    fc = json.load(f)
with open('public/model/stations_profiles.json', encoding='utf-8') as f:
    sp = json.load(f)

lima_prof = sp['limamoulaye']['profil_horaire']
tiva_prof = sp['tivaoune']['profil_horaire']
esmt_prof = sp['esmt']['profil_horaire']

print("Heure | Limamoulaye | Tivaoune | ESMT | Moyenne Dakar (sol réel) | FC actuel")
print("-" * 75)
for h in range(24):
    l_m = lima_prof[h]['median']
    t_m = tiva_prof[h]['median']
    e_m = esmt_prof[h]['median']
    mean_dakar = round((l_m + t_m + e_m) / 3, 2)
    cur_fc = fc['hourly'][h]['pm25']
    print(f"{h:02d}h   | {l_m:6.2f} µg    | {t_m:6.2f} µg | {e_m:4.2f} µg | {mean_dakar:8.2f} µg/m³         | {cur_fc:5.1f} µg")
