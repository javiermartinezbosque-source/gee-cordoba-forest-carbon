# 🌳 Carbon Stock Quantification in Native Forests of Córdoba, Argentina

> **Google Earth Engine · Remote Sensing · Forest Carbon · IPCC Methodology**  
> *Quantifying aboveground biomass and CO₂ equivalent stored in native forests using ESA CCI Biomass v6.0 and standard IPCC conversion factors.*

---

## 📋 Overview

This project quantifies the **carbon stock** stored in the native forests of **Córdoba Province, Argentina**, using the most recent global biomass dataset (**ESA CCI Biomass v6.0**, released April 2025) combined with the **Hansen Global Forest Change** mask and standard **IPCC conversion factors**. The analysis estimates aboveground biomass (AGB), total carbon stock, and CO₂ equivalent at the provincial scale — providing a baseline assessment relevant for carbon credit pre-feasibility, REDD+ project scoping, and forest conservation reporting.

The methodology follows **Route A (Global Datasets)** of the standard biomass estimation workflow, appropriate for **diagnostic and exploratory purposes**. For carbon credit certification under Verra, Gold Standard, or similar schemes, Route B (field-calibrated models) or Route C (LiDAR/SAR integration) would be required.

---

## 📊 Key Results — Córdoba Province (2022)

| Indicator | Value |
|---|---|
| Total forested area (≥10% tree cover) | **2,588,274 ha** |
| Total aboveground biomass | 186 million Mg |
| Total carbon stock (above + belowground) | 108 million Mg C |
| **Total CO₂ equivalent stored** | **398 million Mg CO₂eq** |

For context, this CO₂ stock is comparable in magnitude to the annual greenhouse gas emissions of an entire mid-sized country, highlighting the significance of Córdoba's native forests as a regional carbon sink.

---

## 🗂️ Repository Structure

```
📦 gee-cordoba-forest-carbon/
├── 📄 README.md                       # This file
├── 📜 carbono_bosque_cordoba.js       # Main GEE script (v5)
└── 📁 outputs/                        # Exported from GEE (not included)
    ├── AGB_BosqueNativo_Cordoba_2022.tif
    ├── CO2_Total_Cordoba_2022.tif
    ├── Carbono_Total_Cordoba_2022.tif
    ├── Categorias_Cobertura_Cordoba.tif
    └── Estadisticas_Carbono_Cordoba_2022.csv
```

---

## 🛰️ Data Sources

| Dataset | Source | Resolution | Use |
|---|---|---|---|
| **ESA CCI Biomass v6.0** | ESA Climate Change Initiative (2025) | 100 m | Aboveground biomass (Mg/ha) |
| **Hansen Global Forest Change v1.11** | UMD / Google | 30 m | Forest cover mask (treecover2000) |
| **FAO GAUL 2015 Level 1** | FAO | Vector | Administrative boundary (Córdoba) |

All datasets are publicly available and directly accessible within Google Earth Engine.

---

## 🔬 Methodology

### 1. Study Area
Córdoba Province, Argentina (~165,000 km²), filtered from the FAO GAUL Level 1 dataset. This region includes the **Chaco Serrano** ecoregion — a semi-arid native forest ecosystem dominated by *Schinopsis*, *Aspidosperma*, and *Prosopis* species — along with patches of **Espinal** in the south.

### 2. Aboveground Biomass (AGB)
The **ESA CCI Biomass v6.0** dataset provides global AGB estimates derived from a combination of spaceborne radar (Sentinel-1, ALOS PALSAR-2, Envisat ASAR), spaceborne LiDAR (GEDI, ICESat-2), and optical data. Version 6.0, released in April 2025, uses revised allometric models based on the extended GEDI and ICESat-2 collections, with a refined cost function that better preserves temporal features.

Reference year: **2022** (most recent available in v6.0).
Units: **Mg/ha** (megagrams of dry biomass per hectare).

### 3. Forest Mask — Methodological Decision

A binary forest mask was generated from the Hansen **treecover2000** band using a threshold of **≥10%** canopy cover.

**Why 10% and not the global default of 30%?**

This is a critical methodological decision based on the **ecological reality of Córdoba's native forests**:

- The default FAO threshold of 30% is designed for **dense and temperate forests**
- The **Chaco Serrano** is a **semi-arid open forest** with typical canopy cover between **10–25%**
- Applying a 30% threshold filters out virtually all native forest in the province (result: 0 ha — empirically tested)
- The **10% threshold** aligns with FAO criteria for semi-arid forests and with the operational thresholds used by Argentina's **Inventario Nacional de Bosques Nativos (INBN)**

This decision was validated empirically: tests with thresholds of 30%, 20%, 15%, and 10% confirmed that only at ≤15% does the dataset begin to capture the actual forest distribution of Chaco Serrano.

### 4. Conversion to Carbon and CO₂ Equivalent

Standard **IPCC conversion factors** were applied:

| Conversion | Factor | Source |
|---|---|---|
| Carbon fraction in dry biomass | **0.47** | IPCC AFOLU Guidelines |
| CO₂ molecular weight ratio (CO₂/C) | **3.67** | Chemical stoichiometry (44/12) |
| Belowground/aboveground biomass ratio | **0.24** | IPCC default for semi-arid forests |

**Calculation chain:**

```
AGB (Mg/ha)            ── ESA CCI Biomass v6.0
   │
   ├── × 0.47 ──→ Aboveground Carbon (Mg C/ha)
   │                 │
   │                 └── × 3.67 ──→ Aboveground CO₂ eq (Mg CO₂/ha)
   │
   └── × 1.24 ──→ Total Biomass (AGB + BGB) (Mg/ha)
                     │
                     └── × 0.47 × 3.67 ──→ Total CO₂ eq (Mg CO₂/ha)
```

### 5. Forest Cover Categories

Forest pixels are stratified into four density categories using Hansen `treecover2000`:

| Category | Tree cover (%) | Description |
|---|---|---|
| 1 | 10–29 | Open / sparse forest |
| 2 | 30–49 | Medium-density forest |
| 3 | 50–69 | Dense forest |
| 4 | 70–100 | Very dense forest |

This stratification allows comparing average biomass density across forest types within the province.

---

## 🗺️ Map Outputs

The script generates the following interactive layers in the GEE map panel:

| Layer | Description |
|---|---|
| 📍 Province boundary | Córdoba administrative limit |
| 🌳 Aboveground biomass | AGB in Mg/ha (ESA CCI 2022) |
| 🌲 Tree cover ≥10% | Hansen forest mask |
| 🌲 Cover categories | 4-class density classification |
| 💨 Aboveground CO₂ | CO₂ stored in aboveground biomass |
| 💨 Total CO₂ | CO₂ in aboveground + belowground biomass |

---

## 📤 Exported Outputs

All exports are configured to **Google Drive** (`GEE_Cordoba_Carbono/` folder), **EPSG:32720** (UTM Zone 20S):

| File | Format | Resolution | Description |
|---|---|---|---|
| `AGB_BosqueNativo_Cordoba_2022` | GeoTIFF | 100 m | Aboveground biomass (Mg/ha) |
| `CO2_Total_Cordoba_2022` | GeoTIFF | 100 m | Total CO₂ equivalent (Mg/ha) |
| `Carbono_Total_Cordoba_2022` | GeoTIFF | 100 m | Total carbon stock (Mg C/ha) |
| `Categorias_Cobertura_Cordoba` | GeoTIFF | 100 m | Forest density categories (1–4) |
| `Estadisticas_Carbono_Cordoba_2022` | CSV | — | Provincial summary statistics |

---

## ▶️ How to Run

1. Open the [Google Earth Engine Code Editor](https://code.earthengine.google.com/)
2. Create a new script and paste the contents of `carbono_bosque_cordoba.js`
3. Click **Run** — the map, charts, and provincial statistics will load
4. To export rasters and CSVs, open the **Tasks** panel and click **RUN** on each task
5. Files will appear in your Google Drive under `GEE_Cordoba_Carbono/`

**Requirements:** A free Google Earth Engine account.

---

## ⚠️ Limitations and Important Considerations

This analysis follows **Route A** (global datasets) and is suitable for **diagnostic and pre-feasibility purposes only**. The following limitations should be explicitly considered in any professional or scientific application:

### Forest mask limitations (Hansen)

| Limitation | Implication |
|---|---|
| **Reference year 2000** | Hansen's `treecover2000` reflects forest cover in the year 2000. Forests that have regenerated, been planted, or recovered since are not captured. |
| **Canopy height >5 m only** | Native shrublands (jarillales, fachinales) — ecologically valuable in the Chaco — are excluded because they don't meet the height threshold. |
| **Threshold sensitivity** | Even at 10%, some open Chaco Serrano areas (5–9% cover) and degraded native forests are missed. |
| **No alignment with OTBN** | Argentina's *Ordenamiento Territorial de Bosques Nativos* (OTBN) uses functional/ecological criteria that differ from Hansen's purely biophysical definition. |

### Biomass dataset limitations (ESA CCI v6.0)

| Limitation | Implication |
|---|---|
| **ESA CCI Biomass uncertainty** | Pixel-level RMSE can exceed 30–50% in heterogeneous semi-arid landscapes. The product is best for regional aggregates, not stand-level assessment. |
| **No field calibration for Chaco** | Without local plot data using allometric equations developed for Chaco Serrano species (e.g., Conti, Cabido, Verzino et al.), estimates may carry systematic biases. |

### Carbon estimation limitations

| Limitation | Implication |
|---|---|
| **Belowground biomass approximation** | The 0.24 BGB/AGB ratio is an IPCC default for semi-arid forests; site-specific values may differ significantly. |
| **No soil organic carbon (SOC)** | In semi-arid ecosystems, SOC can represent 50–70% of total ecosystem carbon and is not included here. |
| **No litter or dead wood** | Other carbon pools defined by IPCC are not quantified. |

### ⚠️ NOT CERTIFIABLE for carbon credits

This analysis produces **diagnostic estimates**, not certifiable carbon stocks. Verra, Gold Standard, ART TREES and similar carbon credit standards require Route B (field-validated regression models) or Route C (LiDAR/SAR integration). Use these results for pre-feasibility, regional reporting, and educational purposes — not for issuing or trading credits.

---

## 🔭 Potential Extensions

- **Integration with OTBN official polygons** — replace Hansen mask with the SAyDS official native forest layer for Argentina-specific reporting
- **MapBiomas Chaco integration** — leverage the regional land cover product for more accurate forest type discrimination
- **Route B implementation** — calibrate biomass with field plots from FCA/UNC and INTA studies using Chaco-specific allometries
- **GEDI L4A integration** — use spaceborne LiDAR footprints as training data for spatially explicit biomass modeling
- **Sentinel-1 SAR + Sentinel-2 fusion** — improve biomass estimates by combining active and passive sensors
- **Temporal analysis** — compare carbon stocks across ESA CCI Biomass years (2007–2022) to detect carbon loss and gain trends
- **Cross with fire history** — quantify carbon loss from wildfire events (links to my [wildfire analysis project](https://github.com/javiermartinez-gis/gee-cordoba-wildfires))
- **Soil Organic Carbon mapping** — integrate SoilGrids 2.0 or ISRIC datasets for complete carbon accounting

---

## 📚 References

- Santoro, M., Cartus, O. (2025). ESA Biomass Climate Change Initiative (Biomass_cci): Global datasets of forest above-ground biomass for the years 2007, 2010, 2015–2022, v6.0. *NERC EDS Centre for Environmental Data Analysis*. DOI: 10.5285/95913ffb6467447ca72c4e9d8cf30501
- Hansen, M.C. et al. (2013). High-resolution global maps of 21st-century forest cover change. *Science*, 342, 850–853.
- IPCC (2019). *2019 Refinement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories*. Volume 4: Agriculture, Forestry and Other Land Use.
- Conti, G., Gorné, L.D., Zeballos, S.R., et al. (2019). Developing allometric models to predict the individual aboveground biomass of shrubs worldwide. *Global Ecology and Biogeography*, 28(7), 961–975.
- Gorelick, N. et al. (2017). Google Earth Engine: Planetary-scale geospatial analysis for everyone. *Remote Sensing of Environment*, 202, 18–27.
- FAO (2020). *Global Forest Resources Assessment 2020: Main report*. Rome.

---

## 👤 Author

**Javier Ignacio Martínez**  
Agronomist Engineer · Native Forest Specialist · GIS & Remote Sensing  
Diplomatura en Geomática Aplicada — Instituto Gulich (CONAE/UNC) *(in progress)*  
Ministry of Environment, Córdoba Province, Argentina

🔗 [LinkedIn](https://linkedin.com/in/javier-martinez-bosque) · [GitHub](https://github.com/javiermartinezbosque-source)

---

## 📄 License

This project is released under the [MIT License](LICENSE). Data sources are publicly available and subject to their respective terms of use (ESA, UMD/Google, FAO).

---

*Last updated: June 2026*
