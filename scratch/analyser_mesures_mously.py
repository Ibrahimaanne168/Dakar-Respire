import pandas as pd
import numpy as np

df = pd.read_excel('donnees/mesures_pm25.xlsx', sheet_name='PM2.5 horaire')
print('=== Aperçu global ===')
print('Dimensions:', df.shape)
print('Colonnes:', df.columns.tolist())
print(df.head())

print('\n=== Stations et comptages ===')
print(df['station'].value_counts())

df['dt'] = pd.to_datetime(df['datetime_utc'], errors='coerce')

print('\n=== Diagnostic détaillé par station ===')
for st, grp in df.groupby('station'):
    print(f'\n--- Station: {st} ---')
    print(f'Nombre de lignes: {len(grp)}')
    print(f'Dates non nulles: {grp["dt"].notna().sum()}')
    print(f'Période: {grp["dt"].min()} --> {grp["dt"].max()}')
    print(f'Doublons datetime: {grp.duplicated(subset=["dt"]).sum()}')
    pm = grp['pm25_ugm3']
    print(f'PM2.5 min: {pm.min():.2f} | 25%: {pm.quantile(0.25):.2f} | médiane: {pm.median():.2f} | moyenne: {pm.mean():.2f} | 75%: {pm.quantile(0.75):.2f} | max: {pm.max():.2f}')
    zeros = (pm == 0).sum()
    print(f'Valeurs = 0: {zeros} ({zeros/len(grp)*100:.2f}%)')
    print(f'Valeurs < 0: {(pm < 0).sum()}')
    print(f'Valeurs > 500: {(pm > 500).sum()}')
    print(f'Valeurs NaN: {pm.isna().sum()}')

print('\n=== Doublons globaux (station, datetime) ===')
print('Doublons st+dt:', df.duplicated(subset=['station', 'dt']).sum())
