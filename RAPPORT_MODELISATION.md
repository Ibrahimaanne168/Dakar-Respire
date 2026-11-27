# PROJET DAKAR RESPIRE — RAPPORT DE MODÉLISATION MATHÉMATIQUE ET MACHINE LEARNING

**Concours :** Mathématiques et Modélisation  
**Projet :** Prévision de la pollution aux particules fines (PM2.5) à Dakar sur un horizon de 24 heures  
**Équipe :** Alioune Badara Sarr, El Hadji Ibrahima Diop Sow, Lamine Cissé, Mously Sow, Papa Ibrahima Samb, Sayon Sidibé  
**Date :** Novembre 2026  

---

## RÉSUMÉ EXÉCUTIF

La presqu'île de Dakar est confrontée à des épisodes récurrents et sévères de dégradation de la qualité de l'air causés par la conjonction du trafic urbain dense (49 % des particules), de la vétusté du parc automobile et des apports massifs de poussières désertiques transportées par l'Harmattan en saison sèche. En l'absence d'un réseau dense de stations de référence au sol, ce projet développe une approche open source d'apprentissage automatique supervisé pour prévoir la concentration horaire en PM2.5 sur un horizon de 24 heures.

Ce rapport détaille la formulation mathématique du problème, la chaîne de prétraitement, l'ingénierie des variables physiques, la comparaison de plusieurs familles d'algorithmes (Régression Ridge, Random Forest, HistGradientBoosting, XGBoost, CatBoost) face à deux baselines (Persistance journalière et prévision brute Copernicus CAMS), ainsi qu'une évaluation rigoureusement chronologique.

---

## 1. CONTEXTE ET PROBLÉMATIQUE LOCALE DAKAROISE

### 1.1 Risques sanitaires et normes internationales
Les particules fines (PM2.5, diamètre $\le 2{,}5\ \mu\text{m}$) pénètrent profondément dans l'arbre respiratoire jusqu'aux alvéoles et à la circulation sanguine. Elles induisent des pathologies respiratoires aiguës (asthme, bronchites) et cardiovasculaires. Les seuils de référence sont :
- **Recommandation OMS 2021 :** $15\ \mu\text{g/m}^3$ en moyenne sur 24 heures ($5\ \mu\text{g/m}^3$ en moyenne annuelle).
- **Situation à Dakar :** La moyenne annuelle 2024 s'élevait à environ $22{,}3\ \mu\text{g/m}^3$ (IQAir), soit plus de 4 fois la valeur guide annuelle de l'OMS. Lors des épisodes d'Harmattan, les concentrations horaires dépassent régulièrement $150\ \mu\text{g/m}^3$.

### 1.2 Répartition des sources de pollution
D'après les études de caractérisation à Dakar (notamment la campagne de 2009 et les données du CGQA) :
1. **Trafic routier :** $\approx 49\ \%$ des PM2.5 et PM10 (pics marqués aux heures de pointe : 07h-09h et 18h-21h).
2. **Poussières minérales et désertiques :** $16$ à $25\ \%$.
3. **Aérosols marins :** $15$ à $20\ \%$ (situation de presqu'île bordée par l'Océan Atlantique).
4. **Activités industrielles et brûlage :** $10$ à $11\ \%$.

### 1.3 Régimes climatiques contrastés
- **Saison sèche (Novembre à Mai) :** Dominance de l'Harmattan, vent chaud et sec de secteur Nord-Est (20° à 70°) charriant des brumes sèches sahariennes. Absence totale de précipitations.
- **Saison des pluies / Hivernage (Juillet à Octobre) :** Mousson de secteur Sud-Ouest, averses intenses lessivant l'atmosphère (*scavenging effect*).

---

## 2. SOURCES DE DONNÉES ET CIRCUITS D'INTÉGRATION

| Source | Paramètres | Résolution | Responsable | Statut / Limites |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAQ / kaikai.dev** (AirGradient) | Mesures PM2.5 au sol (Grand Dakar & Tiaroye) | Horaire (depuis fin 2025) | Mously Sow | Capteurs optiques low-cost, sensibles à l'humidité |
| **NASA POWER** | Météo réanalyse : T2M, RH2M, WS2M, PRECTOT | Journalière (2019-2024) | El Hadji Diop Sow | Réanalyse physique, s'arrête à fin 2024 |
| **Copernicus CAMS** | AOD (550nm), poussières désertiques, prévision PM2.5 brute | Grille ~40 km, horaire | Lamine Cissé | Modèle global, sous-estime les pics locaux |
| **Sentinel-5P TROPOMI** | Colonne troposphérique NO2, CO, indice UVAI | 1 passage/jour | Lamine Cissé | Données de colonne, lacunes nuageuses |
| **Fichier consolidé** | CSV unique horaire UTC nettoyé | Horaire UTC | Papa Ibrahima Samb | **À intégrer sans modification de code** |
| **Seuils & Études** | Cadre sanitaire et validation | Documentaire | Sayon Sidibé | **À intégrer dans `config.py`** |

### 2.1 La règle d'or scientifique de l'équipe
> **Les données satellitaires ne sont pas des mesures directes au sol.**  
> L'AOD (Épaisseur Optique des Aérosols) mesure l'atténuation lumineuse sur l'ensemble de la colonne atmosphérique verticale. Elle est corrélée aux particules de surface mais ne peut être assimilée à une mesure de concentration respirée au sol.

### 2.2 Problème de recouvrement temporel identifié
La série météo NASA POWER actuellement documentée s'arrête au 31 décembre 2024, tandis que les stations OpenAQ actives démarrent en novembre-décembre 2025. L'extension de la météo et du satellite sur l'année 2026 par El Hadji et Lamine est nécessaire pour finaliser l'entraînement réel. En attendant, la plateforme utilise un simulateur physique conforme aux observations documentées.

---

## 3. FORMULATION MATHÉMATIQUE DU PROBLÈME

Soit $y_t \in \mathbb{R}^+$ la concentration horaire en PM2.5 mesurée à Dakar à l'instant $t$.  
L'objectif est de prédire le vecteur multi-horizon des 24 heures futures :
$$\mathbf{Y}_t = [y_{t+1}, y_{t+2}, \dots, y_{t+24}]^T \in \mathbb{R}^{24}$$
à partir de l'historique disponible $\mathbf{X}_t \in \mathbb{R}^D$ constitué des retards temporels et des covariables météorologiques et satellitaires :
$$\widehat{\mathbf{Y}}_t = f(\mathbf{X}_t ; \mathbf{\Theta})$$

### 3.1 Ingénierie des variables (Feature Engineering)
1. **Encodage trigonométrique des cycles périodiques :**
   $$\sin\left(\frac{2\pi h}{24}\right),\ \cos\left(\frac{2\pi h}{24}\right),\quad \sin\left(\frac{2\pi m}{12}\right),\ \cos\left(\frac{2\pi m}{12}\right)$$
2. **Décomposition vectorielle du vent :**
   $$u = -v_{\text{vent}} \cdot \sin(\theta_{\text{rad}}),\quad v = -v_{\text{vent}} \cdot \cos(\theta_{\text{rad}})$$
3. **Indicateur booléen Harmattan :**
   $$\mathbb{I}_{\text{Harmattan}} = \mathbb{I}(20^\circ \le \theta \le 70^\circ) \times \mathbb{I}(\text{Mois} \in \text{Saison Sèche})$$
4. **Retards autorégressifs :** $y_{t-1}, y_{t-2}, y_{t-3}, y_{t-6}, y_{t-12}, y_{t-24}, y_{t-48}$
5. **Statistiques glissantes :** Moyenne, écart-type, maximum et minimum sur des fenêtres de 6h, 12h et 24h.

---

## 4. MODÈLES EXPÉRIMENTÉS ET BASELINES DE RÉFÉRENCE

### 4.1 Modèles de référence (Baselines)
- **Persistance journalière (24h) :** $\widehat{y}_{t+h} = y_{t+h-24}$ (suppose que demain à la même heure sera identique à aujourd'hui).
- **Prévision CAMS brute :** $\widehat{y}_{t+h} = \text{PM}_{2.5}^{\text{CAMS}}(t+h)$ issue du modèle physique européen.

### 4.2 Algorithmes d'apprentissage automatique
- **Régression Ridge (L2) :** Modèle linéaire régularisé pénalisant les grands coefficients : $\min_{\mathbf{w}} \|\mathbf{Y} - \mathbf{X}\mathbf{w}\|_2^2 + \alpha \|\mathbf{w}\|_2^2$.
- **Random Forest Regressor :** Forêt d'arbres de décision non-linéaires réduisant la variance par ensachage (bagging).
- **Gradient Boosting (HistGradientBoosting / XGBoost / CatBoost) :** Optimisation itérative des résidus d'arbres avec régularisation.

---

## 5. PROTOCOLE D'ÉVALUATION EXPÉRIMENTALE

### 5.1 Découpage temporel strict
Tout découpage aléatoire (shuffle split ou K-Fold classique) est formellement banni pour éliminer toute fuite temporelle (*lookahead bias*). Les données sont scindées chronologiquement :
- **Ensemble d'entraînement :** Premiers 80 % de la série temporelle.
- **Ensemble de test :** Derniers 20 % les plus récents.

### 5.2 Métriques quantitatives d'évaluation
Pour chaque horizon $h \in [1, 24]$ :
- **Coefficient de détermination :** $R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$
- **Erreur quadratique moyenne (Root Mean Squared Error) :** $\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}$
- **Erreur absolue moyenne :** $\text{MAE} = \frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i|$

### 5.3 Métriques de détection des seuils sanitaires
Pour les seuils d'alerte (15, 35 et 55 $\mu\text{g/m}^3$) :
- **Précision :** Capacité à éviter les fausses alertes intempestives.
- **Rappel :** Capacité à ne pas manquer un pic de pollution dangereux pour la population.
- **F1-Score :** Moyenne harmonique de la précision et du rappel.

---

## 6. LIMITES SCIENTIFIQUES ET PERSPECTIVES

1. **Sensibilité hygrométrique des capteurs optiques :** Les capteurs AirGradient (OpenAQ) ont tendance à surestimer les PM2.5 en période de forte humidité relative (> 80 %).
2. **Lissage des tempêtes brutales :** Comme souligné par Alioune Badara Sarr, les algorithmes statistiques sous-estiment les pics violents d'Harmattan (> 200 $\mu\text{g/m}^3$).
3. **Perspectives :** Intégration future d'un modèle hybride couplant réanalyse CAMS et correction de biais par gradient boosting local dès réception du fichier de Papa Ibrahima Samb.
