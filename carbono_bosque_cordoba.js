// ============================================================
//  PROYECTO: Cuantificación de carbono almacenado en bosque nativo
//            Córdoba, Argentina
//
//  Autor:    Javier Ignacio Martínez
//  Versión:  3.0 (ESA CCI Biomass v6.0 — abril 2025)
//  Datos:    ESA CCI Above-Ground Biomass v6.0 (biomasa aérea)
//            FAO GAUL (límite provincial)
//            Hansen Global Forest Change (máscara forestal)
// ============================================================


// ============================================================
// 0. CONFIGURACIÓN
// ============================================================

var AÑO_BIOMASA       = 2022;     // ESA CCI v6.0: 2007, 2010, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022
var FACTOR_C_BIOMASA  = 0.47;     // IPCC: fracción de carbono en biomasa seca
var FACTOR_CO2_C      = 3.67;     // Conversión C → CO2 (44/12)
var FACTOR_BGB        = 0.24;     // IPCC zonas semi-áridas: biomasa subterránea / aérea
var UMBRAL_BOSQUE     = 10;       // % cobertura arbórea — 10% es el umbral FAO para bosques semi-áridos (Chaco Serrano)
var ESCALA_ANALISIS   = 100;      // metros (resolución ESA CCI)


// ============================================================
// 1. ÁREA DE ESTUDIO — Provincia de Córdoba
// ============================================================

var argentina = ee.FeatureCollection('FAO/GAUL/2015/level1');
var cordoba   = argentina.filter(ee.Filter.eq('ADM1_NAME', 'Cordoba'));

Map.centerObject(cordoba, 7);
Map.addLayer(
  ee.Image().paint(cordoba, 0, 2),
  {palette: ['#333333']},
  '📍 Límite Provincia de Córdoba',
  true
);

print('✅ Área de estudio cargada');


// ============================================================
// 2. BIOMASA AÉREA — ESA CCI BIOMASS v6.0
// ============================================================
// Documentación: https://developers.google.com/earth-engine/datasets/catalog/ESA_CCI_Above_Ground_Biomass_V6_0
// IMPORTANTE: en v6.0 se carga DIRECTAMENTE la imagen del año (no se filtra colección)
// Banda: 'agb' (minúscula). Unidades: Mg/ha

var agb = ee.Image('ESA/CCI/Above_Ground_Biomass/V6_0/' + AÑO_BIOMASA)
  .select('agb')
  .clip(cordoba);

Map.addLayer(
  agb,
  {min: 0, max: 150, palette: ['white','#ffffcc','#c2e699','#78c679','#31a354','#006837']},
  '🌳 Biomasa aérea (Mg/ha) — ESA CCI v6.0 año ' + AÑO_BIOMASA,
  true
);

print('✅ Biomasa aérea ESA CCI v6.0 cargada para el año', AÑO_BIOMASA);


// ============================================================
// 3. MÁSCARA FORESTAL — Hansen Global Forest Change
// ============================================================

var hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11')
  .clip(cordoba);

var treecover = hansen.select('treecover2000');
var mascara_bosque = treecover.gte(UMBRAL_BOSQUE) // ajustado para bosques semi-áridos;

Map.addLayer(
  treecover.updateMask(mascara_bosque),
  {min: 30, max: 100, palette: ['#c7e9c0','#74c476','#238b45','#00441b']},
  '🌲 Cobertura arbórea > ' + UMBRAL_BOSQUE + '% (Hansen 2000)',
  false
);

var agb_bosque = agb.updateMask(mascara_bosque);


// ============================================================
// 4. CONVERSIÓN A CARBONO Y CO2 EQUIVALENTE
// ============================================================

var carbono_agb = agb_bosque.multiply(FACTOR_C_BIOMASA).rename('C_aerea');
var co2_agb     = carbono_agb.multiply(FACTOR_CO2_C).rename('CO2_aerea');

var biomasa_total = agb_bosque.multiply(1 + FACTOR_BGB).rename('AGB_BGB');
var carbono_total = biomasa_total.multiply(FACTOR_C_BIOMASA).rename('C_total');
var co2_total     = carbono_total.multiply(FACTOR_CO2_C).rename('CO2_total');

Map.addLayer(
  co2_agb,
  {min: 0, max: 250, palette: ['white','#deebf7','#9ecae1','#3182bd','#08519c']},
  '💨 CO2 aéreo almacenado (Mg/ha)',
  false
);

Map.addLayer(
  co2_total,
  {min: 0, max: 350, palette: ['white','#fee5d9','#fcae91','#fb6a4a','#cb181d','#67000d']},
  '💨 CO2 total almacenado (aéreo + raíces) (Mg/ha)',
  true
);

print('✅ Conversiones a carbono y CO2 calculadas');


// ============================================================
// 5. ESTADÍSTICAS PROVINCIALES
// ============================================================

var area_pixel_ha = ee.Image.pixelArea().divide(10000);

var agb_provincia = agb_bosque
  .multiply(area_pixel_ha)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: cordoba.geometry(),
    scale: ESCALA_ANALISIS,
    maxPixels: 1e13
  });

var c_provincia = carbono_total
  .multiply(area_pixel_ha)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: cordoba.geometry(),
    scale: ESCALA_ANALISIS,
    maxPixels: 1e13
  });

var co2_provincia = co2_total
  .multiply(area_pixel_ha)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: cordoba.geometry(),
    scale: ESCALA_ANALISIS,
    maxPixels: 1e13
  });

var area_bosque = mascara_bosque
  .multiply(area_pixel_ha)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: cordoba.geometry(),
    scale: ESCALA_ANALISIS,
    maxPixels: 1e13
  });

print('═══════════════════════════════════════════');
print('📊 RESULTADOS — Córdoba, año ' + AÑO_BIOMASA);
print('═══════════════════════════════════════════');
print('🌲 Área boscosa total (ha):', area_bosque);
print('🌳 Biomasa aérea total (Mg):', agb_provincia);
print('🌍 Carbono total almacenado (Mg C):', c_provincia);
print('💨 CO2 equivalente total (Mg CO2eq):', co2_provincia);
print('═══════════════════════════════════════════');


// ============================================================
// 6. ESTADÍSTICAS POR CATEGORÍA DE COBERTURA
// ============================================================

var categorias = ee.Image(0)
  .where(treecover.gte(30).and(treecover.lt(50)), 1)
  .where(treecover.gte(50).and(treecover.lt(70)), 2)
  .where(treecover.gte(70).and(treecover.lt(90)), 3)
  .where(treecover.gte(90), 4)
  .rename('categoria');

Map.addLayer(
  categorias.updateMask(categorias.gt(0)),
  {min: 1, max: 4, palette: ['#a1d99b','#41ab5d','#238b45','#00441b']},
  '🌲 Categorías de cobertura forestal',
  false
);

var agb_por_categoria = agb_bosque.addBands(categorias).reduceRegion({
  reducer: ee.Reducer.mean().group({groupField: 1, groupName: 'categoria'}),
  geometry: cordoba.geometry(),
  scale: ESCALA_ANALISIS,
  maxPixels: 1e13
});

print('📊 AGB promedio (Mg/ha) por categoría de cobertura:', agb_por_categoria);


// ============================================================
// 7. HISTOGRAMA DE BIOMASA
// ============================================================

var histograma = ui.Chart.image.histogram({
  image: agb_bosque,
  region: cordoba.geometry(),
  scale: ESCALA_ANALISIS,
  maxBuckets: 50,
  maxPixels: 1e10
}).setOptions({
  title: '📊 Distribución de biomasa aérea en bosques de Córdoba (' + AÑO_BIOMASA + ')',
  hAxis: {title: 'Biomasa aérea (Mg/ha)'},
  vAxis: {title: 'Frecuencia (número de píxeles)'},
  colors: ['#238b45'],
  legend: {position: 'none'}
});

print(histograma);


// ============================================================
// 8. LEYENDA VISUAL
// ============================================================

function crear_leyenda(titulo, colores, etiquetas) {
  var panel = ui.Panel({
    style: {position: 'bottom-left', padding: '8px 10px', backgroundColor: 'white'}
  });
  panel.add(ui.Label(titulo, {fontWeight: 'bold', fontSize: '13px', margin: '0 0 6px 0'}));
  colores.forEach(function(color, i) {
    var fila = ui.Panel({layout: ui.Panel.Layout.flow('horizontal')});
    fila.add(ui.Label('', {backgroundColor: color, padding: '8px', margin: '2px 6px 2px 0'}));
    fila.add(ui.Label(etiquetas[i], {fontSize: '11px', margin: '4px 0'}));
    panel.add(fila);
  });
  return panel;
}

Map.add(crear_leyenda(
  '💨 CO2 total (Mg/ha)',
  ['white','#fee5d9','#fcae91','#fb6a4a','#cb181d','#67000d'],
  ['0', '50', '100', '175', '250', '350+']
));


// ============================================================
// 9. EXPORTACIONES A GOOGLE DRIVE
// ============================================================

Export.image.toDrive({
  image: agb_bosque.toFloat(),
  description: 'AGB_BosqueNativo_Cordoba_' + AÑO_BIOMASA,
  folder: 'GEE_Cordoba_Carbono',
  region: cordoba.geometry(),
  scale: ESCALA_ANALISIS,
  crs: 'EPSG:32720',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: co2_total.toFloat(),
  description: 'CO2_Total_Cordoba_' + AÑO_BIOMASA,
  folder: 'GEE_Cordoba_Carbono',
  region: cordoba.geometry(),
  scale: ESCALA_ANALISIS,
  crs: 'EPSG:32720',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: carbono_total.toFloat(),
  description: 'Carbono_Total_Cordoba_' + AÑO_BIOMASA,
  folder: 'GEE_Cordoba_Carbono',
  region: cordoba.geometry(),
  scale: ESCALA_ANALISIS,
  crs: 'EPSG:32720',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: categorias.toInt8(),
  description: 'Categorias_Cobertura_Cordoba',
  folder: 'GEE_Cordoba_Carbono',
  region: cordoba.geometry(),
  scale: ESCALA_ANALISIS,
  crs: 'EPSG:32720',
  maxPixels: 1e13
});

var stats_tabla = ee.FeatureCollection([
  ee.Feature(null, {parametro: 'Año de referencia',           valor: AÑO_BIOMASA}),
  ee.Feature(null, {parametro: 'Área boscosa (ha)',           valor: area_bosque.get('treecover2000')}),
  ee.Feature(null, {parametro: 'Biomasa aérea total (Mg)',    valor: agb_provincia.get('agb')}),
  ee.Feature(null, {parametro: 'Carbono total (Mg C)',        valor: c_provincia.get('C_total')}),
  ee.Feature(null, {parametro: 'CO2 equivalente (Mg CO2eq)',  valor: co2_provincia.get('CO2_total')})
]);

Export.table.toDrive({
  collection: stats_tabla,
  description: 'Estadisticas_Carbono_Cordoba_' + AÑO_BIOMASA,
  folder: 'GEE_Cordoba_Carbono',
  fileFormat: 'CSV'
});

print('✅ Exportaciones configuradas — ejecutar desde Tasks panel');


// ============================================================
// 10. PANEL INFORMATIVO
// ============================================================

var panel_info = ui.Panel({
  style: {
    position: 'top-right', padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.9)', width: '320px'
  }
});

panel_info.add(ui.Label('🌳 Carbono en bosques — Córdoba',
  {fontWeight: 'bold', fontSize: '14px', margin: '0 0 8px 0'}));
panel_info.add(ui.Label('Año biomasa: ' + AÑO_BIOMASA + ' (ESA CCI v6.0)', {fontSize: '12px'}));
panel_info.add(ui.Label('Umbral cobertura: > ' + UMBRAL_BOSQUE + '%', {fontSize: '12px'}));
panel_info.add(ui.Label('─────────────────────────', {fontSize: '10px', color: '#ccc'}));
panel_info.add(ui.Label('Factores aplicados (IPCC):', {fontWeight: 'bold', fontSize: '12px'}));
panel_info.add(ui.Label('• C / Biomasa: 0.47', {fontSize: '11px'}));
panel_info.add(ui.Label('• CO2 / C: 3.67', {fontSize: '11px'}));
panel_info.add(ui.Label('• BGB / AGB: 0.24 (semi-árido)', {fontSize: '11px'}));
panel_info.add(ui.Label('─────────────────────────', {fontSize: '10px', color: '#ccc'}));
panel_info.add(ui.Label('Datos: ESA CCI Biomass v6.0 + Hansen GFC',
  {fontSize: '10px', color: '#666'}));

Map.add(panel_info);

print('');
print('═══════════════════════════════════════════');
print('✅ SCRIPT v3.0 COMPLETADO');
print('Ejecutar exportaciones desde Tasks panel ➡');
print('═══════════════════════════════════════════');
