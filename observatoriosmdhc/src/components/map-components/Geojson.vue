<script lang="ts">
import { defineComponent, onMounted, watch, onBeforeUnmount } from 'vue';
import L, { Map as LeafletMap, LayerGroup, GeoJSON, Marker } from 'leaflet';
import type { FeatureCollection, Feature } from 'geojson';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import area from '@turf/area';
import center from '@turf/center';

// Dynamic import for large GeoJSON data
let regioesDataCache: any = null;
const loadRegioesData = async (): Promise<any> => {
  if (!regioesDataCache) {
    const module = await import('../../assets/DivisoesAdministrativasSP.json');
    regioesDataCache = module.default;
  }
  return regioesDataCache;
};

// Types
import type { Parceria, FilterType } from '../../types';

// Utils
import { filterParcerias, formatNumber } from '../../utils/dataHelpers';

export default defineComponent({
    name: 'Geojson',
    props: {
        map: {
            type: Object as () => LeafletMap | null,
            required: true
        },
        parcerias: {
            type: Array as () => Parceria[],
            default: () => []
        },        appliedFilters: {
            type: Array as () => FilterType[],
            default: () => []
        },
    },
    emits: ['division-change', 'criteria-change', 'visualization-change', 'feature-counts-update'],
    setup(props, { expose, emit }) {
        let layers: Record<string, GeoJSON | LayerGroup> = {};
        let currentDivision = 'regioes';
        let currentVisualization = 'pontos';
        let colorCriteria = 'amount';
        let densityCriteria = false;
        let showValueMarkers = false;
        let valueMarkers: Marker[] = [];
        let featureCounts: Record<string, number> = {};
        let features: Feature[] = [];        /**
         * Gets filtered partnerships based on applied filters
         */
        const getFilteredParcerias = () => {
            return filterParcerias(props.parcerias || [], props.appliedFilters);
        };        /**
         * Extracts features based on division type
         */
        function extractFeatures(regioes: FeatureCollection, division: string): Feature[] {
            if (division === 'regioes') return regioes.features;
            
            const result: Feature[] = [];
            regioes.features.forEach((regiao: any) => {
                if (Array.isArray(regiao.subfeatures)) {
                    if (division === 'subprefeituras') {
                        regiao.subfeatures.forEach((subpref: any) => result.push(subpref));
                    } else if (division === 'distritos') {
                        regiao.subfeatures.forEach((subpref: any) => {
                            if (Array.isArray(subpref.subfeatures)) {
                                subpref.subfeatures.forEach((distrito: any) => result.push(distrito));
                            }
                        });
                    }
                }
            });
            return result;
        }        /**
         * Creates a simple GeoJSON layer with basic styling
         */
        const createSimpleGeoJsonLayer = (features: Feature[]) => {
            return L.geoJSON(features, {
                style: { color: 'black', weight: 1, fillOpacity: 0 },                onEachFeature: (feature, layer) => {
                    const popupContent = `
                        <div class="popup-content">
                            <strong style="border-bottom: none !important; padding-bottom: 0 !important; margin-bottom: 0 !important;">${feature.properties?.nome}</strong>
                        </div>
                    `;
                      const popup = L.popup({
                        offset: [0, -10],
                        closeButton: true,
                        autoClose: true,
                        closeOnEscapeKey: true,
                        className: 'leaflet-popup-fixed'
                    }).setContent(popupContent);
                    
                    layer.bindPopup(popup);
                }
            });
        };        /**
         * Counts partnerships by administrative division
         */
        const countParceriasByDivision = async (division: string, criteria: string, density: boolean) => {
            const filtered = getFilteredParcerias();
            const regioes = await loadRegioesData();
            const features = division === 'regioes'
                ? regioes.features
                : extractFeatures(regioes, division);const counts: Record<string, number> = {};

            filtered.forEach(p => {
                // Handle projects with multiple addresses
                p.enderecos.forEach(endereco => {
                    const pt = point([endereco.coords.lng, endereco.coords.lat]);
                    for (const feature of features) {
                        if (
                            feature.geometry &&
                            (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') &&
                            booleanPointInPolygon(pt, feature as Feature<import('geojson').Polygon | import('geojson').MultiPolygon>)
                        ) {
                            const name = feature.properties?.nome;
                            if (criteria === 'none') {
                                return 1;
                            } 
                            if (name) {
                                let value = 1;
                                if (criteria !== 'none' && criteria !== 'amount' && typeof p[criteria as keyof Parceria] === 'number') {
                                    // For projects with multiple addresses, count the full project value once per address
                                    // This means the total value will be distributed across all locations
                                    value = (p[criteria as keyof Parceria] as number) / p.enderecos.length;
                                }
                                counts[name] = (counts[name] || 0) + value;
                            }
                            break;
                        }
                    }
                });
            });            // Apply density calculation if requested
            if (density) {
                features.forEach((feature: any) => {
                    const name = feature.properties?.nome;
                    if (name && counts[name]) {
                        const featureArea = area(feature) / 1000000; // Convert to km²
                        if (featureArea > 0) {
                            counts[name] = Number(((counts[name] / featureArea)).toFixed(2));
                        }
                    }
                });
            }

            return counts;
        };

        /**
         * Generates color scale function based on data values
         */
        const getColorScale = (counts: Record<string, number>) => {
            const values = Object.values(counts);
            const min = Math.min(...values, 0);
            const max = Math.max(...values, 1);
            
            return (count: number) => {
                const percent = (count - min) / (max - min || 1);
                const r = Math.round(220 - (180 * percent));
                const g = Math.round(240 - (120 * percent));
                const b = Math.round(255 - (50 * percent));
                return `rgb(${r},${g},${b})`;
            };
        };

        /**
         * Gets localized label for division type
         */
        const getDivisionLabel = (division: string) => {
            if (division === 'regioes') return 'Região';
            if (division === 'subprefeituras') return 'Subprefeitura';
            if (division === 'distritos') return 'Distrito';
            return division.charAt(0).toUpperCase() + division.slice(1);
        };        /**
         * Creates a value marker to display numeric values on map features
         */
        const createValueMarker = (feature: Feature, count: number) => {
            const centerPoint = center(feature);
              // Format the value for display using our utility function
            let displayValue: string;
            if (colorCriteria === 'verba') {
                displayValue = `R$ ${formatNumber(count)}`;
            } else {
                displayValue = formatNumber(count);
            }
            
            // Create a div icon with the formatted value
            const valueIcon = L.divIcon({
                className: 'value-marker',
                html: `<div style="
                             font-weight: bold; 
                             text-align: center;
                             display: flex;
                             align-items: center;
                             justify-content: center;
                             width: 100%;
                             height: 100%;
                             font-size: ${displayValue.length > 8 ? '0.6rem' : displayValue.length > 5 ? '0.7rem' : '0.85rem'};
                             line-height: 1;
                             color: #333;
                             text-shadow: 1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8);
                             pointer-events: none;">
                        ${displayValue}
                      </div>`,
                iconSize: [60, 20],
                iconAnchor: [30, 10] // Center the icon on the point
            });
            
            return L.marker([centerPoint.geometry.coordinates[1], centerPoint.geometry.coordinates[0]], {
                icon: valueIcon,
                interactive: false, // Non-interactive to avoid interfering with map clicks
                zIndexOffset: 1000 // Keep above other layers
            });
        };        const createChoroplethLayer = async (division: string) => {
            const regioes = await loadRegioesData();
            const extractedFeatures = division === 'regioes'
                ? regioes
                : { ...regioes, features: extractFeatures(regioes, division) };
            
            // Store features for reusing when recreating markers
            features = division === 'regioes' 
                ? regioes.features 
                : extractFeatures(regioes, division);
                
            const counts = await countParceriasByDivision(division, colorCriteria, densityCriteria);
            // Store counts for reusing when recreating markers
            featureCounts = counts;
            
            const getColor = getColorScale(counts);

            const getDivisionName = (feature: any) => feature.properties?.nome;
            const label = getDivisionLabel(division);
            
            const layer = L.geoJSON(extractedFeatures, {
                style: (feature: Feature | undefined) => {
                    let name = feature ? getDivisionName(feature) : '';
                    let count = counts[name] || 0;
                    return {
                        color: '#333',
                        weight: 1,
                        fillOpacity: 0.7,
                        fillColor: getColor(count)
                    };
                },                onEachFeature: (feature, layer) => {
                    let name = getDivisionName(feature);
                    let count = counts[name] || 0;
                    
                    // Criar um marcador de valor apenas se showValueMarkers estiver habilitado
                    if (showValueMarkers) {
                        const marker = createValueMarker(feature, count);
                        if (props.map) {
                            marker.addTo(props.map);
                            valueMarkers.push(marker);
                        }
                    }
                      // Create popup content based on criteria
                    let popupContent = '';
                    if (colorCriteria === 'none') {
                        popupContent = `
                            <div class="popup-content">
                                <strong>${name}</strong>
                            </div>
                        `;
                    } else if (colorCriteria === 'verba') {
                        popupContent = `
                            <div class="popup-content">
                                <strong>${name}</strong>
                                <div class="popup-info-row">
                                    <span class="popup-label">Valor:</span>
                                    <span class="popup-value popup-value">R$ ${formatNumber(count)}</span>
                                </div>
                            </div>
                        `;
                    } else if (colorCriteria === 'amount') {
                        popupContent = `
                            <div class="popup-content">
                                <strong>${name}</strong>
                                <div class="popup-info-row">
                                    <span class="popup-label">Projetos:</span>
                                    <span class="popup-value">${formatNumber(count)}</span>
                                </div>
                            </div>
                        `;
                    } else if (typeof count === 'number') {
                        let customLabel = colorCriteria.charAt(0).toUpperCase() + colorCriteria.slice(1);
                        popupContent = `
                            <div class="popup-content">
                                <strong>${name}</strong>
                                <div class="popup-info-row">
                                    <span class="popup-label">Tipo:</span>
                                    <span class="popup-value">${label}</span>
                                </div>
                                <div class="popup-info-row">
                                    <span class="popup-label">${customLabel}:</span>
                                    <span class="popup-value">${formatNumber(count)}</span>
                                </div>
                            </div>
                        `;                    }
                    
                    // Create popup with consistent positioning options
                    const popup = L.popup({
                        offset: [0, -10],
                        closeButton: true,
                        autoClose: true,
                        autoPan: true,
                        keepInView: true,
                        closeOnEscapeKey: true,
                        className: 'leaflet-popup-fixed'
                    }).setContent(popupContent);
                    
                    layer.bindPopup(popup);
                }
            });
            
            return layer;
        };

        const clearLayers = () => {
            if (!props.map) return;
            Object.values(layers).forEach(layer => {
                if (props.map!.hasLayer(layer)) {
                    props.map!.removeLayer(layer);
                }
            });
            if ((props.map as any)._choroplethLayer) {
                props.map.removeLayer((props.map as any)._choroplethLayer);
                (props.map as any)._choroplethLayer = null;
            }
            
            clearValueMarkers();
        };
        
        // Separate function to clear value markers
        const clearValueMarkers = () => {
            if (!props.map) return;
            valueMarkers.forEach(marker => {
                if (props.map!.hasLayer(marker)) {
                    props.map!.removeLayer(marker);
                }
            });
            valueMarkers = [];
        };
        
        // Function to recreate markers after zoom
        const recreateValueMarkers = () => {
            if (!props.map || currentVisualization !== 'coropletico' || !showValueMarkers) return;
            
            clearValueMarkers();
            
            features.forEach(feature => {
                const name = feature.properties?.nome;
                if (name) {
                    const count = featureCounts[name] || 0;
                    const marker = createValueMarker(feature, count);
                    if (props.map) {
                        marker.addTo(props.map);
                        valueMarkers.push(marker);
                    }
                }
            });
        };        const showLayer = async (division: string) => {
            if (!props.map) return;
            
            clearLayers();
            if (currentVisualization === 'coropletico') {
                const choroplethLayer = await createChoroplethLayer(division);
                choroplethLayer.addTo(props.map);
                (props.map as any)._choroplethLayer = choroplethLayer;
                
                // Emitir evento com as contagens de características para o componente Keys
                emit('feature-counts-update', featureCounts);
            } else {
                const layer = layers[division];
                if (layer) {
                    layer.addTo(props.map);
                    if ('eachLayer' in layer) {
                        layer.eachLayer(l => {
                            if ('bringToBack' in l) (l as L.Path).bringToBack();
                        });
                    }
                }
            }
        };        const initializeGeoJsonLayers = async () => {
            if (!props.map) return;
            const regioes = await loadRegioesData();

            layers = {
                regioes: createSimpleGeoJsonLayer(extractFeatures(regioes, 'regioes')),
                subprefeituras: createSimpleGeoJsonLayer(extractFeatures(regioes, 'subprefeituras')),
                distritos: createSimpleGeoJsonLayer(extractFeatures(regioes, 'distritos'))        };
            currentDivision = 'regioes';
            await showLayer(currentDivision);
        };

        const handleDivisionChange = async (division: string) => {
            currentDivision = division;
            
            await showLayer(division);
        };

        const handleVisualizationChange = async (visualization: string) => {
            currentVisualization = visualization;
            
            await showLayer(currentDivision);
        };

        const handleCriteriaChange = async (criteria: { color: string, density: boolean, showValueMarkers?: boolean }) => {
            colorCriteria = criteria.color;
            densityCriteria = criteria.density;
            if (criteria.showValueMarkers !== undefined) {
                showValueMarkers = criteria.showValueMarkers;
            }
            if (currentVisualization === 'coropletico') {
                await showLayer(currentDivision);
            }
        };

        expose({ handleDivisionChange, handleVisualizationChange, handleCriteriaChange });        // Popup handling during zoom events
        let openPopup: L.Popup | null = null;
        let popupLatLng: L.LatLng | null = null;

        const handleZoomStart = () => {
            clearValueMarkers();
            
            // Store and close any open popup to prevent positioning issues
            if (props.map) {
                const currentPopup = (props.map as any)._popup;
                if (currentPopup && currentPopup.isOpen()) {
                    openPopup = currentPopup;
                    const latLng = currentPopup.getLatLng();
                    popupLatLng = latLng || null;
                    props.map.closePopup();
                }
            }
        };

        const handleZoomEnd = () => {
            recreateValueMarkers();
            
            // Reopen popup at correct position after zoom
            if (props.map && openPopup && popupLatLng) {
                // Use a small delay to ensure map has fully settled
                setTimeout(() => {
                    if (props.map && openPopup && popupLatLng) {
                        openPopup.setLatLng(popupLatLng);
                        openPopup.openOn(props.map);
                        openPopup = null;
                        popupLatLng = null;
                    }
                }, 50);
            }
        };        onMounted(async () => {
            if (props.map) {
                await initializeGeoJsonLayers();
                
                // Add zoom event listeners for value markers and popup management
                props.map.on('zoomstart', handleZoomStart);
                props.map.on('zoomend', handleZoomEnd);
            }
        });onBeforeUnmount(() => {
            if (props.map) {
                // Clean up event listeners when component is unmounted
                props.map.off('zoomstart', handleZoomStart);
                props.map.off('zoomend', handleZoomEnd);
            }
        });        watch(() => props.map, (newMap, oldMap) => {
            // Clean up old map event listeners
            if (oldMap) {
                oldMap.off('zoomstart', handleZoomStart);
                oldMap.off('zoomend', handleZoomEnd);
            }
            
            if (newMap) {
                initializeGeoJsonLayers();
                
                // Add zoom event listeners when map changes for value markers and popup management
                newMap.on('zoomstart', handleZoomStart);
                newMap.on('zoomend', handleZoomEnd);
            }
        });        watch(
            () => [props.appliedFilters, props.parcerias],
            async () => {
                if (currentVisualization === 'coropletico') {
                    await showLayer(currentDivision);
                }
            },
            { deep: true }
        );return {};
    }
});
</script>

<style>
/* Shared gradient background for popup elements */
.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
    background: linear-gradient(135deg, rgba(15, 32, 56, 0.7) 0%, rgba(5, 20, 40, 0.7) 50%, rgba(0, 10, 25, 0.7) 100%) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.leaflet-popup {
    font-family: "Roboto", sans-serif !important;
    font-weight: 300 !important;
    transition: none !important;
}

.leaflet-popup-content-wrapper {
    backdrop-filter: blur(5px) !important;
    border-radius: 14px !important;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.75) !important;
    padding: 0 !important;
    min-width: 250px !important;
    max-width: 300px !important;
}

.leaflet-popup-content {
    margin: 0 !important;
    padding: 16px !important;
    font-weight: 300 !important;
    font-size: 0.86rem !important;
    line-height: 1.6 !important;
    color: rgba(255, 255, 255, 0.9) !important;
    letter-spacing: 0.3px !important;
}

.leaflet-popup-content strong {
    font-weight: 600 !important;
    font-size: 1.1rem !important;
    color: #ffffff !important;
    text-shadow: 0 2px 9px rgba(0, 0, 0, 0.3) !important;
    display: block !important;
    margin-bottom: 12px !important;
    padding-bottom: 10px !important;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2) !important;
    letter-spacing: 0.3px !important;
    line-height: 1.3 !important;
}

.popup-info-row {
    display: flex !important;
    margin-bottom: 10px !important;
    gap: 14px !important;
    align-items: flex-start !important;
}

.popup-label {
    font-weight: 500 !important;
    color: rgba(255, 255, 255, 0.9) !important;
    min-width: 80px !important;
    font-size: 0.86rem !important;
    letter-spacing: 0.3px !important;
    line-height: 1.4 !important;
}

.popup-value {
    color: rgba(255, 255, 255, 0.9) !important;
    flex: 1 !important;
    font-weight: 300 !important;
    font-size: 0.75rem !important;
    line-height: 1.5 !important;
    word-break: break-word !important;
}
</style>