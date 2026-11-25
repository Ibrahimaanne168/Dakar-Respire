import pandas as pd
import numpy as np

df = pd.read_excel('donnees/mesures_pm25.xlsx', sheet_name='PM2.5 horaire')
df['dt'] = pd.to_datetime(df['datetime_utc'])

print("=== Distribution détaillée des zéros ===")
for st, grp in df.groupby('station'):
    zeros = grp[grp['pm25_ugm3'] == 0]
    print(f"\nStation: {st}")
    print(f"Total zéros: {len(zeros)} / {len(grp)} ({len(zeros)/len(grp)*100:.2f}%)")
    if len(zeros) > 0:
        print("Exemples de dates avec zéro:")
        print(zeros['dt'].head(10).tolist())

print("\n=== Analyse des trous temporels (gaps > 1h) ===")
for st, grp in df.groupby('station'):
    grp = grp.sort_values('dt').reset_index(drop=True)
    diffs = grp['dt'].diff()
    gaps = diffs[diffs > pd.Timedelta(hours=1)]
    print(f"\nStation: {st}")
    print(f"Nombre de sauts temporels > 1h: {len(gaps)}")
    if len(gaps) > 0:
        print(f"Plus grand saut: {gaps.max()}")
        print("Top 5 plus grands sauts:")
        print(gaps.nlargest(5))

print("\n=== Analyse des valeurs très élevées (> 100 µg/m³) ===")
for st, grp in df.groupby('station'):
    high = grp[grp['pm25_ugm3'] > 100]
    print(f"\nStation: {st} -> {len(high)} heures > 100 µg/m³ ({len(high)/len(grp)*100:.2f}%)")
    if len(high) > 0:
        print(high[['dt', 'pm25_ugm3']].head(5))
