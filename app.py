# ==============================================================================
# PROJET DAKAR RESPIRE - INTERFACE STREAMLIT DE PRÉVISION & SURVEILLANCE
# Concours : Mathématiques et Modélisation
# ==============================================================================
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime, timezone

import config
from src.data_loader import DataLoader
from src.data_generator import ensure_simulated_data_file
from src.features import FeatureEngineer
from src.models import AirQualityModelSuite
from src.baselines import BaselinePredictor
from src.evaluate import ModelEvaluator

# Configuration de la page Streamlit
st.set_page_config(
    page_title="Dakar Respire | Prévision PM2.5 à 24h",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ------------------------------------------------------------------------------
# 1. GESTION DES DONNÉES & CACHE STREAMLIT
# ------------------------------------------------------------------------------
@st.cache_data(ttl=3600)
def load_and_prepare_data(file_override=None):
    if file_override is not None:
        loader = DataLoader(file_override)
    else:
        # Priorité au fichier propre de Papa Ibrahima Samb s'il existe
        data_path = config.CLEAN_DATA_FILE if config.CLEAN_DATA_FILE.exists() else config.SIMULATED_DATA_FILE
        if not data_path.exists():
            ensure_simulated_data_file()
            data_path = config.SIMULATED_DATA_FILE
        loader = DataLoader(data_path)

    df = loader.load_data()
    return df, loader.audit_report


@st.cache_resource
def train_models_cached(df):
    fe = FeatureEngineer(horizon_hours=config.HORIZON_HOURS)
    X, Y = fe.create_features(df)

    # Découpage temporel (80% train, 20% test)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    Y_train, Y_test = Y.iloc[:split_idx], Y.iloc[split_idx:]

    suite = AirQualityModelSuite(random_state=42)
    suite.train_all(X_train, Y_train)

    evaluator = ModelEvaluator()
    eval_results = {}
    for name in suite.models.keys():
        pred = suite.predict(name, X_test)
        eval_results[name] = evaluator.evaluate_model(Y_test, pred, X_test.index)

    # Baselines
    persist_pred = BaselinePredictor.persistence_24h(df, horizon=config.HORIZON_HOURS).loc[X_test.index].values
    eval_results["Baseline (Persistance 24h)"] = evaluator.evaluate_model(Y_test, persist_pred, X_test.index)

    if "cams_pm25_raw" in df.columns:
        cams_pred = BaselinePredictor.cams_raw_forecast(df, horizon=config.HORIZON_HOURS).loc[X_test.index].values
        eval_results["Baseline (CAMS brut)"] = evaluator.evaluate_model(Y_test, cams_pred, X_test.index)

    return suite, eval_results, fe, X_test, Y_test


# ------------------------------------------------------------------------------
# 2. BARRE LATÉRALE : CONTEXTE DU PROJET & CONFIGURATION
# ------------------------------------------------------------------------------
st.sidebar.image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/320px-Flag_of_Senegal.svg.png",
    width=60,
)
st.sidebar.title("Dakar Respire")
st.sidebar.caption("Plateforme de prévision des PM2.5 à 24h | Concours Mathématiques & Modélisation")

st.sidebar.markdown("---")
st.sidebar.subheader("⚙️ Source des Données")

uploaded_file = st.sidebar.file_uploader(
    "Déposer un nouveau fichier propre (Papa Ibrahima Samb)",
    type=["csv"],
    help="Format requis : pas horaire UTC, colonnes timestamp, pm25 et variables météo/satellites optionnelles.",
)

try:
    if uploaded_file is not None:
        df_hourly, audit = load_and_prepare_data(uploaded_file)
        st.sidebar.success("Fichier téléversé chargé avec succès !")
    else:
        df_hourly, audit = load_and_prepare_data()
except Exception as e:
    st.error(f"Erreur de chargement des données : {e}")
    st.stop()

is_simulated = audit.get("is_simulated", True)

# Avertissement bien visible
if is_simulated:
    st.sidebar.warning("⚠️ Mode Données Simulées Actif")
else:
    st.sidebar.success("✅ Données Réelles Consolidées")

# Sélection du modèle de prévision actif
suite, eval_results, fe, X_test, Y_test = train_models_cached(df_hourly)
available_models = list(suite.models.keys())
selected_model = st.sidebar.selectbox("Modèle actif de prévision :", available_models, index=1 if len(available_models) > 1 else 0)

st.sidebar.markdown("---")
st.sidebar.subheader("👥 Circuit de l'Équipe")
st.sidebar.markdown("""
- **Alioune B. Sarr** : Étude poussières & Harmattan *(Reçu)*
- **El Hadji I. D. Sow** : Météo NASA POWER *(Reçu)*
- **Lamine Cissé** : CAMS / Sentinel-5P *(Sources reçues)*
- **Mously Sow** : Mesures OpenAQ *(Rapport reçu)*
- **Papa I. Samb** : Consolidation & Nettoyage *(À venir)*
- **Sayon Sidibé** : Seuils d'alerte & Limites *(À venir)*
""")

# ------------------------------------------------------------------------------
# 3. EN-TÊTE PRINCIPAL & BANDEAU D'AVERTISSEMENT
# ------------------------------------------------------------------------------
st.title("🌬️ Dakar Respire — Surveillance & Prévision des PM2.5")
st.markdown("**Plateforme d'intelligence artificielle pour l'anticipation de la qualité de l'air à Dakar sur 24 heures.**")

if is_simulated:
    st.error(
        "⚠️ **AVERTISSEMENT SCIENTIFIQUE** : Cette interface utilise actuellement des **données simulées calibrées**, "
        "en attente du fichier propre consolidé de Papa Ibrahima Samb. Les données reproduisent fidèlement le cycle journalier "
        "(creux à 04h, pic à 20h) et les brumes sèches d'Harmattan, mais ne doivent pas être considérées comme des mesures réelles validées."
    )

# ------------------------------------------------------------------------------
# 4. PRÉVISION IMMÉDIATE SUR LES 24 PROCHAINES HEURES
# ------------------------------------------------------------------------------
# Inférence sur le dernier échantillon disponible
last_sample = X_test.iloc[[-1]]
forecast_24h = suite.predict(selected_model, last_sample)[0]

# Dates futures prévues
last_timestamp = last_sample.index[0]
forecast_timestamps = pd.date_range(start=last_timestamp + pd.Timedelta(hours=1), periods=24, freq="1h")
max_pm25 = float(np.max(forecast_24h))
mean_pm25 = float(np.mean(forecast_24h))

# Détermination du niveau d'alerte selon l'échelle CGQA / OMS
alert_level = "BON"
for lvl, params in config.ALERT_LEVELS.items():
    if params["min"] <= max_pm25 <= params["max"]:
        alert_level = lvl
        break

alert_info = config.ALERT_LEVELS[alert_level]

# Affichage des métriques clés
col1, col2, col3, col4 = st.columns(4)
col1.metric("Pic PM2.5 Prévu (24h)", f"{max_pm25:.1f} µg/m³", delta=f"{max_pm25 - 15.0:+.1f} vs seuil OMS")
col2.metric("Moyenne 24h Prévue", f"{mean_pm25:.1f} µg/m³", delta="Objectif OMS: 15 µg/m³", delta_color="inverse")
col3.metric("Indice IQA CGQA Prévu", alert_info["iqa_range"])
col4.markdown(
    f"<div style='background-color: {alert_info['color']}; color: white; padding: 12px; border-radius: 8px; text-align: center; font-weight: bold;'>"
    f"Niveau : {alert_info['label']}<br><span style='font-size: 11px;'>{alert_info['description']}</span>"
    f"</div>",
    unsafe_allow_html=True,
)

# Recommandation sanitaire contextuelle
st.info(f"💡 **Recommandation sanitaire pour Dakar** : {alert_info['recommandation']}")

# ------------------------------------------------------------------------------
# 5. COURBE INTERACTIVE DE PRÉVISION SUR 24 HEURES
# ------------------------------------------------------------------------------
st.subheader("📈 Trajectoire Prévisionnelle des PM2.5 sur 24 heures")

fig = go.Figure()

# Bandes d'alerte colorées en arrière-plan
fig.add_hrect(y0=0, y1=15, fillcolor="rgba(16, 185, 129, 0.12)", line_width=0, annotation_text="Bon (Guide OMS)", annotation_position="top left")
fig.add_hrect(y0=15, y1=35, fillcolor="rgba(251, 191, 36, 0.12)", line_width=0, annotation_text="Moyen (CGQA)", annotation_position="top left")
fig.add_hrect(y0=35, y1=55, fillcolor="rgba(249, 115, 22, 0.12)", line_width=0, annotation_text="Mauvais", annotation_position="top left")
fig.add_hrect(y0=55, y1=max(250, max_pm25 + 30), fillcolor="rgba(239, 68, 68, 0.12)", line_width=0, annotation_text="Très Mauvais (Alerte)", annotation_position="top left")

# Courbe prévisionnelle
fig.add_trace(
    go.Scatter(
        x=forecast_timestamps,
        y=forecast_24h,
        mode="lines+markers",
        name=f"Prévision {selected_model}",
        line=dict(color="#1e3a8a", width=3.5),
        marker=dict(size=7, color="#2563eb"),
    )
)

# Intervalle d'incertitude simulé (+/- RMSE du modèle)
model_rmse = eval_results[selected_model]["global"]["RMSE"]
fig.add_trace(
    go.Scatter(
        x=np.concatenate([forecast_timestamps, forecast_timestamps[::-1]]),
        y=np.concatenate([forecast_24h + model_rmse, (forecast_24h - model_rmse)[::-1]]),
        fill="toself",
        fillcolor="rgba(37, 99, 235, 0.15)",
        line=dict(color="rgba(255,255,255,0)"),
        hoverinfo="skip",
        showlegend=True,
        name=f"Incertitude estimée (±{model_rmse:.1f} µg/m³)",
    )
)

fig.update_layout(
    xaxis_title="Heure locale (UTC+0 Dakar)",
    yaxis_title="Concentration PM2.5 (µg/m³)",
    hovermode="x unified",
    margin=dict(l=20, r=20, t=30, b=20),
    height=420,
)
st.plotly_chart(fig, use_container_width=True)

# ------------------------------------------------------------------------------
# 6. ONGLETS D'ANALYSE DÉTAILLÉE : MODÈLES, VARIABLES, LIMITES SCIENTIFIQUES
# ------------------------------------------------------------------------------
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Comparaison des Algorithmes",
    "🔍 Facteurs d'Influence (Explainability)",
    "⚠️ Limites Scientifiques & Satellite",
    "📚 Références & Équipe",
])

# ONGLET 1 : COMPARAISON DES ALGORITHMES & BASELINES
with tab1:
    st.subheader("Performance Quantitative sur l'Échantillon de Test Temporel")
    st.markdown("""
    Évaluation effectuée selon les règles strictes de modélisation :
    - **Découpage temporel** : aucun mélange aléatoire passé/futur.
    - **Deux baselines à battre** : la *Persistance journalière (24h)* et la *Prévision brute CAMS*.
    """)

    # Construction du tableau de synthèse
    rows = []
    for m_name, res in eval_results.items():
        glob = res["global"]
        seasons = res["seasons"]
        dry = seasons.get("Saison Sèche (Harmattan / Poussières)", {})
        wet = seasons.get("Saison des Pluies (Hivernage / Lessivage)", {})
        rows.append({
            "Algorithme / Baseline": m_name,
            "R² Global": glob.get("R2"),
            "RMSE (µg/m³)": glob.get("RMSE"),
            "MAE (µg/m³)": glob.get("MAE"),
            "Biais (µg/m³)": glob.get("Bias"),
            "RMSE Saison Sèche": dry.get("RMSE"),
            "RMSE Saison Pluies": wet.get("RMSE"),
        })

    eval_df = pd.DataFrame(rows).sort_values("RMSE (µg/m³)")
    st.dataframe(eval_df.style.highlight_min(subset=["RMSE (µg/m³)", "MAE (µg/m³)"], color="#bbf7d0"), use_container_width=True)

    # Détection des pics sanitaires (Dépassement du seuil de 35 µg/m³)
    st.subheader("Capacité à Détecter les Alertes Polluantes (> 35 µg/m³)")
    cols_th = st.columns(len(eval_results))
    for idx, (m_name, res) in enumerate(eval_results.items()):
        th_info = res["thresholds"].get("CGQA_Moyen (35 µg/m³)", {})
        with cols_th[idx % len(cols_th)]:
            st.metric(
                label=m_name.replace("Regression", "Reg"),
                value=f"F1: {th_info.get('F1', 0):.2f}",
                help=f"Précision: {th_info.get('Precision', 0):.2f} | Rappel: {th_info.get('Recall', 0):.2f}",
            )

# ONGLET 2 : FACTEURS D'INFLUENCE (EXPLAINABILITY)
with tab2:
    st.subheader("Importance des Variables dans la Prédiction")
    st.markdown("Analyse des coefficients et des gains d'information des variables issues des travaux d'Alioune Badara Sarr :")

    importances = suite.get_feature_importances(selected_model, fe.feature_names)
    if importances is not None:
        top_features = importances.head(10)
        fig_imp = go.Figure(go.Bar(
            x=top_features.values,
            y=top_features.index,
            orientation="h",
            marker=dict(color="#1e3a8a"),
        ))
        fig_imp.update_layout(
            yaxis=dict(autorange="reversed"),
            xaxis_title="Poids relatif d'importance",
            height=350,
            margin=dict(l=20, r=20, t=20, b=20),
        )
        st.plotly_chart(fig_imp, use_container_width=True)
    else:
        st.info("L'importance des variables n'est pas disponible pour ce type d'estimateur linéaire.")

    st.markdown("""
    **Interprétation physique :**
    - Les **retards temporels (lags 1h et 24h)** capturent l'inertie locale de la masse d'air.
    - L'indicateur **Harmattan (vent NE sec)** signale l'apport massif de poussières sahariennes.
    - L'**encodage horaire (sin_hour / cos_hour)** reproduit le pic de trafic de 20h identifié par Mously Sow.
    """)

# ONGLET 3 : LIMITES SCIENTIFIQUES & DONNÉES SATELLITAIRES (Transparence Concours)
with tab3:
    st.subheader("Déclaration de Transparence et Limites du Modèle")
    st.warning("""
    **Règle d'or de l'équipe :** Les données satellitaires (CAMS, Sentinel-5P) ne sont **pas des mesures directes au sol**.
    Il s'agit d'intégrales sur la colonne totale d'air (AOD) ou de réanalyses modélisées.
    """)

    st.markdown("""
    ### 1. Limites des capteurs optiques bon marché (AirGradient / OpenAQ)
    - Les stations de Limamoulaye et Tivaoune Diacksao utilisent des capteurs optiques à bas coût.
    - **Biais hygrométrique** : En forte humidité relative (hivernage), les particules d'eau gonflent optiquement les particules fines et peuvent surestimer les PM2.5.
    - **Séries courtes** : Historique disponible inférieur à 1 an, ne couvrant pas la variabilité interannuelle du Sahel.

    ### 2. Sous-estimation des pics brutaux de poussière
    - Les tempêtes d'Harmattan et brumes sèches arrivent parfois en quelques heures.
    - Comme documenté par Alioune Badara Sarr, les algorithmes de ML tendent à lisser les extrêmes et **sous-estiment les pics très violents (> 150 µg/m³)**.

    ### 3. Rupture temporelle des données météo
    - Le fichier NASA POWER d'El Hadji Diop Sow s'arrête au 31/12/2024 alors que les mesures OpenAQ démarrent fin 2025.
    - La prolongation de la météo sur 2025-2026 par l'équipe est indispensable pour l'entraînement sur données 100% réelles.
    """)

# ONGLET 4 : RÉFÉRENCES & CONTEXTE LOCAL
with tab4:
    st.subheader("Références Scientifiques & Collaborations")
    for key, text in config.REFERENCES.items():
        st.markdown(f"- **{key}** : {text}")

    st.markdown("---")
    st.subheader("Échelle Officielle de l'Indice de la Qualité de l'Air (CGQA Sénégal)")
    st.markdown("""
    D'après la présentation de Mme Aminata Mbow Diokhané (Chef du CGQA, 2019) :
    - **0 – 50 (Vert)** : Bon — Peu ou pas de risque sanitaire.
    - **51 – 100 (Jaune)** : Moyen — Risques légers pour personnes vulnérables.
    - **101 – 200 (Orange)** : Mauvais — Risque élevé pour personnes sensibles.
    - **> 200 (Rouge)** : Très mauvais — Alerte sanitaire collective.
    """)
