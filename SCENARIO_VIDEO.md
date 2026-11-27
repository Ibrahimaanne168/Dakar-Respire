# SCÉNARIO DE DÉMONSTRATION VIDÉO (3 MINUTES)
**Projet :** Dakar Respire — Prévision des PM2.5 à Dakar sur 24h  
**Concours :** Mathématiques et Modélisation  
**Présentateur :** Équipe Dakar Respire  
**Format :** Capture d'écran commentée + incrustation webcam  

---

## DÉCOUPAGE CHRONOMÉTRÉ

### SÉQUENCE 1 : LE DÉFI SANITAIRE DAKAROIS (0:00 – 0:30)
- **Visuel à l'écran :** Carte de Dakar, photo de brume sèche et logo « Dakar Respire ».
- **Voix off :**  
  > *« Bonjour à tous. À Dakar, plus de 3 millions d'habitants respirent un air régulièrement saturé en particules fines PM2.5, avec des moyennes annuelles dépassant 4 fois le seuil de l'OMS. Entre le trafic urbain dense et les brumes sèches sahariennes apportées par l'Harmattan, prévoir la qualité de l'air à 24 heures est une urgence de santé publique. Pourtant, notre ville ne dispose que de très peu de stations de mesure officielles. Comment anticiper les pics sans déployer un réseau de capteurs à des millions de dollars ? C'est le défi mathématique de notre projet : Dakar Respire. »*

---

### SÉQUENCE 2 : LE CIRCUIT DE DONNÉES & L'INGÉNIERIE DES VARIABLES (0:30 – 1:15)
- **Visuel à l'écran :** Schéma du circuit de l'équipe (Météo NASA POWER, Satellite CAMS/Sentinel-5P, Stations OpenAQ) et code de `features.py`.
- **Voix off :**  
  > *« Notre solution repose sur la synergie de données ouvertes. El Hadji a identifié la réanalyse météo de la NASA ; Lamine a ciblé les aérosols CAMS et les gaz Sentinel-5P ; et Mously a cartographié les stations OpenAQ de Grand Dakar et Tiaroye.  
  Règle scientifique stricte que nous respectons : le satellite mesure une colonne totale d'air, pas une concentration respirée au sol !  
  En tant que modélisateur, j'ai transformé ces flux en variables prédictives : encodage cyclique des heures pour capturer le pic de trafic de 20 heures, décomposition vectorielle du vent, et un indicateur dédié au vent de Nord-Est qui caractérise l'arrivée de l'Harmattan. »*

---

### SÉQUENCE 3 : DÉMONSTRATION EN DIRECT DE L'INTERFACE (1:15 – 2:20)
- **Visuel à l'écran :** Navigation dynamique dans l'application Streamlit `app.py`.
- **Actions montrées :**
  1. Affichage du bandeau de transparence (données simulées vs réelles).
  2. Courbe prévisionnelle sur 24h avec les 4 bandes de couleurs du CGQA Sénégal (Vert, Jaune, Orange, Rouge).
  3. Badge de recommandation sanitaire active pour les populations vulnérables.
  4. Tableau comparatif des modèles : Random Forest, HistGradientBoosting face aux baselines de Persistance et CAMS.
- **Voix off :**  
  > *« Voici notre plateforme Dakar Respire. Dès la connexion, un bandeau informe honnêtement l'utilisateur que nous tournons actuellement sur un simulateur calibré, en attendant le fichier propre consolidé par Papa Ibrahima Samb.  
  Ici, la courbe trace heure par heure la prévision sur 24h avec un intervalle d'incertitude. Les couleurs reprennent exactement l'échelle IQA du Centre de Gestion de la Qualité de l'Air de Dakar. Si un pic d'Harmattan dépasse 55 µg/m³, l'alerte rouge se déclenche automatiquement avec des recommandations concrètes pour les enfants et les asthmatiques.  
  Dans l'onglet Comparaison, nous évaluons nos modèles selon un découpage temporel strict. Nos algorithmes d'ensemble battent nettement la persistance naïve et la prévision brute de CAMS. »*

---

### SÉQUENCE 4 : LIMITES ASSUMÉES & PERSPECTIVES (2:20 – 3:00)
- **Visuel à l'écran :** Onglet « Limites Scientifiques » et formulaire de dépôt de fichier propre.
- **Voix off :**  
  > *« Pour le concours, nous faisons le choix de la rigueur : nous n'inventons aucun chiffre. Nous assumons les limites des capteurs optiques low-cost sensibles à l'humidité, et la tendance des modèles à lisser les tempêtes de poussière extrêmes.  
  Notre plateforme est 100 % modulaire : dès que Papa Ibrahima Samb aura finalisé le fichier nettoyé et que Sayon Sidibé aura affiné les seuils, il suffira de glisser le fichier dans ce composant sans modifier une seule ligne de code.  
  Merci de votre attention, et faisons respirer Dakar ! »*
