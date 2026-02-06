# 📦 Sentinel-2A, Nighttime Lights, Demographic, Socioeconomic & Topographic Datasets (Google Earth Engine)

## 📌 Overview

This repository contains **Google Earth Engine (GEE) scripts** for downloading and preprocessing **multisource geospatial datasets** required for **urban analysis, spatial accessibility modeling, and SDG-11–oriented GeoAI research**.
The workflow integrates **remote sensing, demographic, socioeconomic, infrastructure, and topographic datasets** at multiple spatial resolutions.

The scripts are designed to be **modular, reproducible, and scalable**, allowing easy adaptation to other cities or regions.

---

## 🌍 Study Area

* **Example region**: *Islamabad (ADM1)*
* **Boundary source**: FAO GAUL (Level-1 Administrative Units)

The ROI can be changed by modifying the `ADM1_NAME` attribute.

---

## 🗂️ Datasets Included

### 1️⃣ Sentinel-2A Surface Reflectance (Optical Imagery)

* **Source**: `COPERNICUS/S2_SR_HARMONIZED`
* **Resolution**: 10 m
* **Processing**:

  * Cloud & cirrus masking (QA60)
  * Median composite (2025)
  * RGB + NIR bands (B2, B3, B4, B8)
* **Use cases**:

  * Built-up extraction
  * Land-cover mapping
  * Deep learning–based feature extraction

---

### 2️⃣ Nighttime Lights (VIIRS DNB)

* **Source**: `NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG`
* **Resolution**: ~500 m
* **Processing**:

  * Annual mean radiance (2025)
  * Summary statistics (mean, min, max)
* **Use cases**:

  * Urban intensity analysis
  * Economic activity proxy
  * Accessibility & spatial equity modeling

---

### 3️⃣ Topographic Data (ALOS Global DSM)

* **Source**: `JAXA/ALOS/AW3D30_V1_1`
* **Resolution**: ~12.5 m
* **Band**: `MED`
* **Use cases**:

  * Terrain constraints
  * Urban expansion analysis
  * Accessibility and network modeling

---

### 4️⃣ Rural Access Index (RAI)

* **Source**: `projects/sat-io/open-datasets/RAI/raimultiplier`
* **Description**:

  * Distribution of rural population with access to all-season roads
* **Use cases**:

  * Transport accessibility
  * SDG 9.1 & SDG 11.2 indicators
  * Infrastructure inequality assessment

---

### 5️⃣ Critical Infrastructure Spatial Index (CISI)

* **Source**: SAT-IO Open Datasets

  * `projects/sat-io/open-datasets/CISI/global_CISI`
  * `projects/sat-io/open-datasets/CISI/amount_infrastructure`
* **Infrastructure example**: Hospitals
* **Use cases**:

  * Infrastructure concentration analysis
  * Urban resilience & service availability
  * Post-disaster and conflict-sensitive studies

---

### 6️⃣ Relative Wealth Index (RWI)

* **Source**: Facebook Data for Good (SAT-IO)

  * `projects/sat-io/open-datasets/facebook/relative_wealth_index`
* **Data type**: Vector (FeatureCollection)
* **Export format**: GeoJSON
* **Use cases**:

  * Socioeconomic disparity analysis
  * Spatial justice & equity assessment
  * Machine learning–driven feature engineering

---

### 7️⃣ Population Counts

* **Source**: WorldPop Global Population

  * `WorldPop/GP/100m/pop`
* **Resolution**: 100 m
* **Processing**:

  * Mean population raster
  * Clipped to administrative boundary
* **Use cases**:

  * Population-weighted accessibility
  * Service gap analysis
  * SDG-11.1 & SDG-11.2 indicators

---

## 📤 Outputs

All datasets are exported to **Google Drive** in standard GIS-ready formats:

* **Raster**: GeoTIFF
* **Vector**: GeoJSON

These outputs are compatible with:

* ArcGIS Pro
* QGIS
* Python (GeoPandas, Rasterio)
* Machine learning pipelines (XGBoost, DL models)

---

## 🛠️ Requirements

* Google Earth Engine account
* Internet access to public GEE datasets
* Google Drive (for exports)

---

## 🔄 How to Use

1. Copy any script section into the **GEE Code Editor**
2. Modify:

   ```js
   ee.Filter.eq('ADM1_NAME', 'Islamabad')
   ```

   to your target region
3. Run the script
4. Exported files will appear in your Google Drive

---

## 🎯 Applications

* Urban spatial accessibility modeling
* SDG-11 monitoring and reporting
* GeoAI-driven feature engineering
* Infrastructure equity assessment
* Population-weighted service analysis

---

## 📚 Citation & Data Acknowledgment

Please cite the original data providers when using these datasets:

* ESA (Sentinel-2)
* NOAA (VIIRS)
* JAXA (ALOS)
* WorldPop
* Facebook Data for Good
* SAT-IO Open Datasets
* FAO GAUL

---

