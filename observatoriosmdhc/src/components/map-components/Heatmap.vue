<script lang="ts">
import { defineComponent, onMounted, watch, onBeforeUnmount, ref } from 'vue';
import * as L from 'leaflet';
import 'leaflet.heat';

// Types
import type { Parceria, FilterType, VisualizationCriteria } from '../../types';

// Utils
import { filterParcerias } from '../../utils/dataHelpers';

export default defineComponent({
    name: 'Heatmap',
    props: {
        parcerias: Array as () => Parceria[],
        appliedFilters: Array as () => FilterType[],
        map: Object as () => any
    },
    emits: ['visualization-change'],
    setup(props) {        let heatmapLayer: any = null;
        let currentVisualization = ref('pontos');
        let intensityCriteria = ref('verba');
        let baseRadius = ref(25);
        let blur = ref(8);
        let zoomLevel = ref(10);        /**
         * Calculate radius based on zoom level with smooth transition
         * Zoom 10: radius = 25
         * Zoom 20: radius = 250
         */
        const calculateRadius = () => {
            if (!props.map) return 25;
            
            const currentZoom = props.map.getZoom();
            zoomLevel.value = currentZoom;
            
            // Clamp zoom between 10 and 20
            const clampedZoom = Math.max(10, Math.min(20, currentZoom));
            
            // Linear interpolation between zoom 10 (radius 25) and zoom 20 (radius 250)
            // Formula: radius = 25 + (150 - 25) * (zoom - 10) / (20 - 10)
            const radius = 25 + (150 - 25) * (clampedZoom - 10) / (20 - 10);
            
            return Math.round(radius);
        };

        /**
         * Calculate blur based on zoom level with smooth transition
         * Zoom 10: blur = 5
         * Zoom 20: blur = 15
         */
        const calculateBlur = () => {
            if (!props.map) return 5;
            
            const currentZoom = props.map.getZoom();
            
            // Clamp zoom between 10 and 20
            const clampedZoom = Math.max(10, Math.min(20, currentZoom));
            
            // Linear interpolation between zoom 10 (blur 5) and zoom 20 (blur 15)
            // Formula: blur = 5 + (15 - 5) * (zoom - 10) / (20 - 10)
            const blurValue = 8 + (80 - 8) * (clampedZoom - 10) / (20 - 10);
            
            return Math.round(blurValue);
        };

        /**
         * Creates heatmap data from filtered partnerships
         */
        const createHeatmapData = (parcerias: Parceria[]): [number, number, number][] => {
            const data: [number, number, number][] = [];
            // For count, we don't need to extract values from parceria objects
            let minValue = 0;
            let maxValue = 1;
            let valueRange = 1;
            if (intensityCriteria.value !== 'count') {
                // Get min and max values for intensity normalization only for non-count criteria
                const values = parcerias.map(p => p[intensityCriteria.value as keyof Parceria] as number).filter(v => v && !isNaN(v));
                if (values.length === 0) return data;
                minValue = Math.min(...values);
                maxValue = Math.max(...values);
                valueRange = maxValue - minValue;
            }
            parcerias.forEach(parceria => {
                if (parceria.enderecos && parceria.enderecos.length > 0) {
                    parceria.enderecos.forEach(endereco => {
                        if (endereco.coords && endereco.coords.lat && endereco.coords.lng) {
                            let intensity = 0;
                            if (intensityCriteria.value === 'count'){
                                intensity = 1;
                            }
                            else if (intensityCriteria.value === 'verba' && parceria.verba){
                                intensity = ((parceria.verba - minValue) / valueRange) * 100; // Normalize to percentage
                            }
                            data.push([
                                endereco.coords.lat,
                                endereco.coords.lng,
                                intensity
                            ]);
                        }
                    });
                }
            });
            
            return data;
        }

        /**
         * Updates the heatmap layer with current data and settings
         */
        const updateHeatmap = () => {
            if (!props.map) return;

            // Remove existing heatmap layer
            if (heatmapLayer) {
                props.map.removeLayer(heatmapLayer);
                heatmapLayer = null;
            }

            // Only show heatmap when visualization is 'heatmap'
            if (currentVisualization.value !== 'heatmap') return;

            // Filter partnerships
            const filteredParcerias = filterParcerias(props.parcerias || [], props.appliedFilters || []);
            
            if (filteredParcerias.length === 0) return;

            // Create heatmap data
            const heatmapData = createHeatmapData(filteredParcerias);
              if (heatmapData.length === 0) return;

            // Create heatmap layer with dynamic radius and blur
            const dynamicRadius = calculateRadius();
            const dynamicBlur = calculateBlur();
            
            heatmapLayer = (L as any).heatLayer(heatmapData, {
                radius: dynamicRadius,
                blur: dynamicBlur,
                minOpacity: 0.2,
                max: 1.0,
                gradient: {
                    0.0: '#000080',  // Dark blue
                    0.1: '#0000FF',  // Blue
                    0.2: '#00BFFF',  // Deep sky blue
                    0.3: '#00FFFF',  // Cyan
                    0.4: '#00FF80',  // Spring green
                    0.5: '#80FF00',  // Chartreuse
                    0.6: '#FFFF00',  // Yellow
                    0.7: '#FF8000',  // Orange
                    0.8: '#FF4000',  // Red orange
                    0.9: '#FF0000',  // Red
                    1.0: '#800000'   // Dark red
                }
            });

            // Add to map
            heatmapLayer.addTo(props.map);
        };

        /**
         * Handle criteria changes from Visualization component
         */
        const handleCriteriaChange = (criteria: VisualizationCriteria) => {
            // Update intensity criteria based on color criteria
            intensityCriteria.value = criteria.color === 'verba' ? 'verba' : 'count';
            updateHeatmap();
        };

        /**
         * Handle visualization type changes
         */
        const handleVisualizationChange = (visualization: string) => {
            currentVisualization.value = visualization;
            updateHeatmap();
        };        /**
         * Handle zoom changes to update heatmap radius
         */
        const handleZoomChange = () => {
            if (currentVisualization.value === 'heatmap' && heatmapLayer) {
                updateHeatmap();
            }
        };

        /**
         * Update heatmap settings
         */
        const updateHeatmapSettings = (settings: { baseRadius?: number; blur?: number }) => {
            if (settings.baseRadius !== undefined) baseRadius.value = settings.baseRadius;
            if (settings.blur !== undefined) blur.value = settings.blur;
            updateHeatmap();
        };        // Watch for prop changes
        watch([() => props.parcerias, () => props.appliedFilters], () => {
            updateHeatmap();
        }, { deep: true });

        // Watch for map changes to add/remove zoom listeners
        watch(() => props.map, (newMap, oldMap) => {
            if (oldMap) {
                oldMap.off('zoomend', handleZoomChange);
            }
            if (newMap) {
                newMap.on('zoomend', handleZoomChange);
            }
        });

        // Cleanup on unmount
        onBeforeUnmount(() => {
            if (props.map) {
                props.map.off('zoomend', handleZoomChange);
                if (heatmapLayer) {
                    props.map.removeLayer(heatmapLayer);
                }
            }
        });        // Initialize when map is available
        onMounted(() => {
            if (props.map) {
                props.map.on('zoomend', handleZoomChange);
                updateHeatmap();
            }
        });

        return {
            handleCriteriaChange,
            handleVisualizationChange,
            updateHeatmapSettings,
            baseRadius,
            blur,
            zoomLevel,
            intensityCriteria
        };
    }
});
</script>

<template>
    <!-- Heatmap component doesn't need a visible template as it manages Leaflet layers -->
    <div style="display: none;"></div>
</template>

<style scoped>
/* No specific styles needed for heatmap component */
</style>