=========================================================
PROJET DAKAR RESPIRE - DOCUMENTATION DES DONNÉES MÉTÉO
Responsable : El Hadji Ibrahima Diop Sow
Destinataire : Papa Ibrahima Samb (Responsable Data)
=========================================================

1. SOURCE DES DONNÉES
- Fournisseur : NASA POWER (Prediction Of Worldwide Energy Resources)
- API utilisée : https://power.larc.nasa.gov/api/temporal/daily/point
- Communauté : AG (Agroclimatology)
- Type de données : Réanalyse météorologique (modèle physique, pas une station au sol physique).

2. LOCALISATION
- Ville : Dakar, Sénégal
- Latitude : 14.6928° N
- Longitude : -17.4467° O

3. PÉRIODE COUVERTE
- Du : 1er janvier 2019
- Au : 31 décembre 2024
- Fréquence : Journalière

4. DESCRIPTION DES COLONNES DU FICHIER CSV
- date : Date au format AAAA-MM-JJ
- temp_moy_C : Température moyenne de l'air à 2 mètres (°C)
- temp_max_C : Température maximale de l'air à 2 mètres (°C)
- temp_min_C : Température minimale de l'air à 2 mètres (°C)
- humidite_rel_pct : Humidité relative à 2 mètres (%)
- vent_ms : Vitesse du vent à 2 mètres (m/s)
- precipitations_mm : Précipitations totales (mm/jour)

5. QUALITÉ DES DONNÉES ET LIMITES
- Les données sont globalement complètes. Les rares valeurs manquantes (-999) ont été vérifiées et correspondent à des erreurs de calcul du modèle (très rares sur Dakar).
- Attention : Ces données météo doivent être croisées avec les données satellitaires (CAMS/Sentinel-5P) de Lamine et les mesures réelles de Mously. 
- Rappel important : La météo explique la dispersion ou l'accumulation des polluants, mais n'est pas une mesure directe de PM2.5.

6. SCRIPT D'EXTRACTION (Pour référence)
Les données ont été extraites via un script Python utilisant la bibliothèque `requests`. Si besoin de mettre à jour les données (ex: ajouter 2025), le script est disponible sur demande.