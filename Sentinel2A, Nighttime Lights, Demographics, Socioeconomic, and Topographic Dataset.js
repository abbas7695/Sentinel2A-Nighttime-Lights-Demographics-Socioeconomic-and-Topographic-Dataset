// -----------------------------
// -----------------------------
// 1: Sentinel-2A Dataset
// -----------------------------
// -----------------------------

// -----------------------------
// 1. Define Region of Interest (example: Islamabad)
// -----------------------------
var cities = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
var roi = cities.filter(ee.Filter.eq('ADM1_NAME','Islamabad'));
Map.addLayer(roi, {color:'red'},'Islamabad');
Map.centerObject(roi, 10);
// -----------------------------
// 2. Cloud Mask Function
// -----------------------------
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
               .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.select(['B2', 'B3', 'B4', 'B8']).updateMask(mask).divide(10000);
}
// -----------------------------
// 3. Load Sentinel-2 Collection
// -----------------------------
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filterDate('2025-04-01', '2025-12-31')
              .filterBounds(roi)
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
              .map(maskS2clouds)
              .median()
              .clip(roi);   // Clip here
// -----------------------------
// 4. Display (True Color)
// -----------------------------
var vis = {bands: ['B4','B3','B2'], min:0, max:0.25, gamma:1.2};
Map.addLayer(s2, vis, 'Sentinel-2 True Color');
// -----------------------------
// 5. Export to Google Drive
// -----------------------------
Export.image.toDrive({
  image: s2,
  description: 'Sentinel-2A_Islamabad_2025',
  folder: 'GEE_Exports',       // Optional: your Drive folder
  fileNamePrefix: 'S2_2025',
  region: roi,
  scale: 10,                   // Sentinel-2 resolution (10m for RGB/NIR)
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// ----------------------------------------------------
// ----------------------------------------------------
// 2: NightTIME lights Dataset
// ----------------------------------------------------
// ----------------------------------------------------

// ----------------------------------------------------
// 1. Define Region of Interest (example: Islamabad)
// ----------------------------------------------------
var cities = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
var roi = cities.filter(ee.Filter.eq('ADM1_NAME','Islamabad'));
Map.addLayer(roi, {color:'red'},'Islamabad');
Map.centerObject(roi, 10);
// ----------------------------------------------------
// 2. Function: compute year-mean VIIRS radiance, display stats and export
// ----------------------------------------------------
function computeYearlyVIIRS(startDate, endDate, exportLabel) {
  // Load monthly VIIRS DNB collection, select radiance band and compute annual mean.
  var yearlyMean = ee.ImageCollection("NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG")
    .select('avg_rad')
    .filterDate(startDate, endDate)
    .mean()
    .rename('mean_rad'); 
// ----------------------------------------------------
// 3. Visualization parameters for night lights
// ----------------------------------------------------
  var visParams = {
    min: 0,
    max: 60,
    palette: ['000000','0b1f4a','2c7bb6','41b6c4','a1dab4','ffffcc','fdae61','d7191c','ffffff']
  };
// ----------------------------------------------------
// 4. Compute summary statistics (mean, min, max) over the study area
// ----------------------------------------------------
  var summaries = yearlyMean.reduceRegion({
    reducer: ee.Reducer.mean().combine({reducer2: ee.Reducer.minMax(), sharedInputs: true}),
    geometry: roi.geometry(),
    scale: 500,
    maxPixels: 1e9
  });
// ----------------------------------------------------
// 5. Print the stats to the console with a clear label
// ----------------------------------------------------
  print('VIIRS stats for ' + startDate + ' to ' + endDate + ' (' + exportLabel + ')', summaries);
// ----------------------------------------------------
// 6. Add the yearly mean layer to the map (default off)
// ----------------------------------------------------
  Map.addLayer(yearlyMean.clip(roi.geometry()), visParams, exportLabel + ' (VIIRS mean)', false);
// ----------------------------------------------------
// 7. Export the annual mean image to Google Drive (safe client-side parameters)
// ----------------------------------------------------
  Export.image.toDrive({
    image: yearlyMean.clip(roi.geometry()),
    description: exportLabel + '_VIIRS_Mean_' + startDate.replace(/-/g,''),
    folder: 'GEE_Exports',
    fileNamePrefix: exportLabel + '_viirs_mean_' + startDate.replace(/-/g,''),
    region: roi.geometry(),
    scale: 500,
    crs: 'EPSG:4326',
    maxPixels: 1e13
  });

  return yearlyMean;
}
// ----------------------------------------------------
// 8. Run function for two example years (2024 and 2025)
// ----------------------------------------------------
// var viirs_2024 = computeYearlyVIIRS('2024-01-01', '2024-12-31', 'Islamabad');
var viirs_2025 = computeYearlyVIIRS('2025-01-01', '2025-12-31', 'Islamabad');

// ----------------------------------------------------
// ----------------------------------------------------
// 3: ALOS Global Digital Surface Model (ALOS DSM) dataset
// ----------------------------------------------------
// ----------------------------------------------------

// ----------------------------------------------------
// 1. Define Region of Interest (example: Islamabad)
// ----------------------------------------------------
var cities = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
var roi = cities.filter(ee.Filter.eq('ADM1_NAME','Islamabad'));
Map.addLayer(roi, {color:'red'},'Delhi');
Map.centerObject(roi, 10);
// ----------------------------------------------------
// 2. Load the ALOS Global Digital Surface Model (ALOS DSM) dataset
// ----------------------------------------------------
var alosDem = ee.Image('JAXA/ALOS/AW3D30_V1_1');
var demROI = alosDem.select('MED');
var demClip = demROI.clip(roi);
Map.addLayer(demClip, {min: 0, max: 5000}, 'ALOS DEM');
// ----------------------------------------------------
// 3. Export to Google Drive
// ----------------------------------------------------
Export.image.toDrive({
  image: demClip,
  description: 'ALSO_DEM_Islamabad',
  folder: 'GEE_Exports',       // Optional: your Drive folder
  region: roi,
  scale: 12.5,                   // DEM resolution (12.5)
  crs: 'EPSG:4326',
});

// ----------------------------------------------------
// ----------------------------------------------------
// 4: RURAL ACCASS INDEX
// ----------------------------------------------------
// ----------------------------------------------------

// ----------------------------------------------------
// 1. Define Region of Interest (example: Islamabad)
// ----------------------------------------------------
var cities = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
var roi = cities.filter(ee.Filter.eq('ADM1_NAME','Islamabad'));
Map.addLayer(roi, {color:'red'},'Islamabad');
Map.centerObject(roi, 10);
// ----------------------------------------------------
// 2. distribution of rural population with access to all-season roads
// ----------------------------------------------------
var inaccessibilityindex = ee.Image('projects/sat-io/open-datasets/RAI/raimultiplier');
// ----------------------------------------------------
// 3. Clip global_CISI to ROI
// ----------------------------------------------------
var clipped_inaccessibilityindex = inaccessibilityindex.clip(roi);
// ----------------------------------------------------
// 4. Display clipped layers
// ----------------------------------------------------
// Map.addLayer(roi, {color: 'red'}, 'ROI', false);
Map.addLayer(clipped_inaccessibilityindex,{min:0, max:1, 'palette': ['EFC2B3','ECB176','E9BD3A','E6E600','63C600','00A600']}, 'Inaccessibility index');
// ----------------------------------------------------
// 5. Export the clipped data to Google Drive
// ----------------------------------------------------
Export.image.toDrive({
  image: clipped_inaccessibilityindex,
  description: 'inaccessibilityindex_Islamabad',
  folder: 'GEE_Exports',
  region: roi,
  scale: 30,  // Adjust scale based on your data resolution
  maxPixels: 1e9
});

// ----------------------------------------------------
// ----------------------------------------------------
// 5: CRITICAL INFRACTURE SPATIAL INDEX
// ----------------------------------------------------
// ----------------------------------------------------

// ----------------------------------------------------
// 1. Define Region of Interest (example: Islamabad)
// ----------------------------------------------------
var cities = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
var roi = cities.filter(ee.Filter.eq('ADM1_NAME','Islamabad'));
Map.addLayer(roi, {color:'red'},'Islamabad');
Map.centerObject(roi, 10);
// ----------------------------------------------------
// 2. Load CISI and Infracture Dataset
// ----------------------------------------------------
var global_CISI = ee.Image('projects/sat-io/open-datasets/CISI/global_CISI');
var infrastructure = ee.ImageCollection("projects/sat-io/open-datasets/CISI/amount_infrastructure")
// ----------------------------------------------------
// 3. Import palette
// ----------------------------------------------------
var palettes = require('users/samapriya/utils:palettes');
// ----------------------------------------------------
// 4. Clip global_CISI to ROI
// ----------------------------------------------------
var clipped_CISI = global_CISI.clip(roi);
// ----------------------------------------------------
// 5. Filter and clip infrastructure data (hospitals example)
// ----------------------------------------------------
var hospitals = infrastructure.filter(ee.Filter.eq('id_no', 'hospital')).first();
var clipped_hospitals = hospitals.clip(roi);
// ----------------------------------------------------
// 6. Display clipped layers
// ----------------------------------------------------
Map.addLayer(roi, {color: 'red'}, 'ROI', false);
Map.addLayer(clipped_CISI, {min: 0, max: 0.2, palette: palettes.extra.greens}, 'Clipped Global CISI');
Map.addLayer(clipped_hospitals, {min: 0, max: 50, palette: palettes.extra.orngbluel}, 'Clipped Hospitals');
// ----------------------------------------------------
// 7. Export the clipped data to Google Drive
// ----------------------------------------------------
Export.image.toDrive({
  image: clipped_CISI,
  description: 'CISI_Islamabad',
  folder: 'GEE_Exports',
  region: roi,
  scale: 30,  // Adjust scale based on your data resolution
  maxPixels: 1e9
});

// ----------------------------------------------------
// ----------------------------------------------------
// 6: RELATIVE WEALTH INDEX
// ----------------------------------------------------
// ----------------------------------------------------

// ----------------------------------------------------
// 1. Define Region of Interest (example: Islamabad)
// ----------------------------------------------------
var cities = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
var roi = cities.filter(ee.Filter.eq('ADM1_NAME','Islamabad'));
Map.addLayer(roi, {color:'red'},'Islamabad');
Map.centerObject(roi, 10);

var rwi = ee.FeatureCollection("projects/sat-io/open-datasets/facebook/relative_wealth_index");
// ----------------------------------------------------
// 2. Filter RWI data to ROI
// ----------------------------------------------------
var rwi_fc = ee.FeatureCollection(rwi);
var filtered_rwi = rwi_fc.filterBounds(roi);
// ----------------------------------------------------
// 3. Display data
// ----------------------------------------------------
Map.addLayer(roi, {color: 'red'}, 'ROI', false);
Map.addLayer(filtered_rwi, {
  palette: ['red', 'yellow', 'green'],
  min: -2,
  max: 2
}, 'Relative Wealth Index (Filtered)');
// ----------------------------------------------------
// 4. Print some statistics
// ----------------------------------------------------
print('Number of features in ROI:', filtered_rwi.size());
print('Sample features:', filtered_rwi.limit(5));
// ----------------------------------------------------
// 5. Export as GeoJSON
// ----------------------------------------------------
Export.table.toDrive({
  collection: filtered_rwi,
  description: 'RWI_Islamabad_GeoJSON',
  folder: 'GEE_Exports',
  fileFormat: 'GeoJSON'
});

// ----------------------------------------------------
// ----------------------------------------------------
// 7: POPULATION COUNTS
// ----------------------------------------------------
// ----------------------------------------------------

// ----------------------------------------------------
// 1. Define Region of Interest (example: Islamabad)
// ----------------------------------------------------
var cities = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1");
var roi = cities.filter(ee.Filter.eq('ADM1_NAME', 'Islamabad'));
Map.centerObject(roi, 10);
Map.addLayer(roi, {color: 'red'}, 'ROI');

// 2. Import world population data
var worldpop = ee.ImageCollection("WorldPop/GP/100m/pop")
var meanPopulation = worldpop.reduce(ee.Reducer.mean());

// 3. Set visualization parameter for layer
var visWorldPop = {
  bands: ['population_mean'],
  min: 0.0,
  max: 50.0,
  palette: ['24126c', '1fff4f', 'd4ff50']
};

// 4. Add and Center layer
Map.addLayer(meanPopulation.clip(roi), visWorldPop, 'WorldPop India');
Map.centerObject(roi, 5);
// ----------------------------------------------------
// 5. Export population raster to Google Drive
// ----------------------------------------------------
Export.image.toDrive({
  image: meanPopulation,
  description: 'Population_2025_Islamabad',
  folder: 'GEE_Exports',
  region: roi.geometry(),
  scale: 100,          // WorldPop native resolution
  maxPixels: 1e13
});