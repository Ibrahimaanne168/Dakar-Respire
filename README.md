# 🌬️ DAKAR RESPIRE — Plateforme de Prévision des PM2.5 à Dakar sur 24h

**Concours :** Mathématiques et Modélisation  
**Responsable Modélisation & Interface :** Ibrahima Anne  
**Équipe :** Alioune Badara Sarr, El Hadji Ibrahima Diop Sow, Lamine Cissé, Mously Sow, Papa Ibrahima Samb, Sayon Sidibé, Ibrahima Anne  

---

## 1. Vue d'ensemble du Projet

Le projet **Dakar Respire** développe une plateforme de surveillance et de prévision des concentrations en particules fines ($\text{PM}_{2.5}$) à Dakar sur un horizon glissant de 24 heures. Face à la rareté des stations de référence au sol et au coût prohibitif des analyseurs certifiés, notre solution combine des réanalyses météorologiques ouvertes (**NASA POWER**), des données atmosphériques et satellitaires (**Copernicus CAMS**, **Sentinel-5P**) et des mesures issues de micro-capteurs (**OpenAQ**) via des algorithmes d'apprentissage automatique supervisé.

---

## 2. Structure du Code

```
Dakar Respire/
├── config.py                 # Configuration centrale (seuils Sayon, colonnes Papa Samb, constantes)
├── requirements.txt          # Dépendances Python du projet
├── pipeline.py               # Script d'exécution CLI (entraînement, évaluation, métriques)
├── app.py                    # Interface web Streamlit interactive avec système d'alerte
├── RAPPORT_MODELISATION.md   # Trame complète du rapport de modélisation pour le jury
├── SCENARIO_VIDEO.md         # Scénario chronométré pour la vidéo de démonstration de 3 min
├── data/
│   ├── raw/                  # Dossier pour les fichiers sources bruts reçus
│   └── processed/            # Fichiers nettoyés et données simulées étiquetées
└── src/
    ├── __init__.py
    ├── data_loader.py        # Chargeur robuste (UTC, codes -999, zéros suspects, agrégation 1h)
    ├── data_generator.py     # Simulateur physique réaliste de Dakar (Harmattan, cycle 20h/04h)
    ├── features.py           # Feature engineering (lags, rolling stats, U/V vent, Harmattan flag)
    ├── baselines.py          # Modèles naïfs de référence (Persistance journalière & CAMS brut)
    ├── models.py             # Suite d'algorithmes (Ridge, Random Forest, HistGradientBoosting, XGBoost, CatBoost)
    └── evaluate.py           # Évaluation temporelle stricte, métriques R²/RMSE/MAE, séparation sèche/pluies
```

---

## 3. Installation et Lancement

### Étape 1 : Installer les dépendances
```bash
pip install -r requirements.txt
```

### Étape 2 : Lancer le pipeline d'entraînement et d'évaluation en CLI
```bash
python pipeline.py
```
*Le pipeline génère automatiquement les données simulées calibrées si le fichier de données propre n'est pas encore présent, entraîne tous les modèles et affiche le tableau comparatif.*

### Étape 3 : Lancer l'interface web interactive
```bash
streamlit run app.py
```
L'interface sera accessible sur `http://localhost:8501`.

---

## 4. Intégration Future des Membres de l'Équipe

### Fichier propre consolidé de Papa Ibrahima Samb :
Le chargeur `src/data_loader.py` et l'interface `app.py` sont conçus pour se brancher sans modification :
1. Déposez simplement le fichier CSV nettoyé sous le nom `data/processed/dakar_respire_hourly_clean.csv` (ou téléversez-le directement via la barre latérale de l'application).
2. Spécification attendue :
   - Pas horaire avec horodatage UTC : `timestamp` (ex: `2025-12-01 20:00:00`)
   - Cible au sol : `pm25` (en $\mu\text{g/m}^3$)
   - Météo optionnelle : `temp_c`, `rh_pct`, `wind_ms`, `wind_dir_deg`, `precip_mm`, `pressure_kpa`
   - Satellite optionnel : `aod`, `dust_aod`, `no2`, `co`, `cams_pm25_raw`
   - Les colonnes absentes sont automatiquement ignorées sans bloquer le système.

### Seuils d'alerte et Références de Sayon Sidibé :
Les seuils sanitaires et recommandations officielles sont modifiables directement dans le dictionnaire `ALERT_LEVELS` du fichier unique `config.py`.

---

## 5. Règle d'Or et Déontologie Scientifique

- **Données Satellitaires :** L'AOD et les gaz Sentinel-5P sont des intégrales sur la colonne d'air totale. Elles ne sont **jamais** présentées comme des mesures directes de surface.
- **Transparence :** Tant que les mesures réelles consolidées de 2026 ne sont pas injectées, un bandeau d'alerte orange/rouge signale explicitement le statut simulé des données.
