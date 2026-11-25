import pandas as pd
import numpy as np

df = pd.read_excel('donnees/mesures_pm25.xlsx', sheet_name='PM2.5 horaire')
df['dt'] = pd.to_datetime(df['datetime_utc'])
df['hour'] = df['dt'].dt.hour

station_map = {
    'Complexe Scolaire Limamoulaye -6103781': 'Limamoulaye (Grand Dakar)',
    'Dakar, Mairie Tivaoune Diacksao-6137166': 'Tivaoune Diacksao (Tiaroye)',
    'ESMT Dakar-6066018': 'ESMT (Grand Dakar)'
}

for raw_name, clean_name in station_map.items():
    sub = df[df['station'] == raw_name]
    hourly = sub.groupby('hour')['pm25_ugm3'].agg(['median', 'mean', 'count']).round(2)
    print(f"\n=== Profil horaire réel (0h-23h) : {clean_name} ===")
    print(hourly.to_string())
