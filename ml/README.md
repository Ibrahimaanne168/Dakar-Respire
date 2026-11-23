# Dakar Respire — Pôle Machine Learning (Python Hors-Ligne)

Ce dossier contient l'ensemble du pipeline scientifique et des modèles de prévision des PM2.5 à Dakar.

## Rôle dans le projet
Le modèle tourne en **mode hors-ligne (offline)** : il s'entraîne sur votre machine Python et exporte les résultats directement dans le dossier `public/model/` du site Next.js pour un déploiement 100% autonome sur Vercel.

## Exécution
```bash
# 1. Installer les dépendances
pip install -r requirements.txt

# 2. Lancer l'entraînement et l'évaluation comparative
python pipeline.py

# 3. Exporter les modèles et métriques vers le site web Next.js
python export_to_web.py
```

## Fichiers exportés dans public/model/ :
- `meta.json` : Métadonnées, statut des membres, liste ordonnée des variables, drapeau `synthetic: true/false`.
- `metrics.json` : Tableau des métriques comparatives ($R^2$, RMSE, MAE) globales et par saison (Sèche vs Pluies) face aux baselines.
- `forecast.json` : Prévision heure par heure sur 24h avec indicateurs météo et niveaux d'alerte.
- `model_weights.json` : Coefficients mathématiques permettant au moteur TypeScript du navigateur de recalculer la prévision en direct si un nouveau fichier CSV est importé !
