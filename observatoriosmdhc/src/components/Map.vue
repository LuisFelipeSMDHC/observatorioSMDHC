<template>
  <div class="map-container">
    <div id="map"></div>
      <!-- Filter panel -->
    <Filters
      :map="map"
      :categories="categories"
      :range-categories="rangeCategories"
      :parcerias="parcerias"
      @apply-filter="handleApplyFilter"
      @remove-filter="handleRemoveFilter"
      @apply-range-filter="handleApplyRangeFilter"
      @remove-range-filter="handleRemoveRangeFilter"
    />
      <!-- Visualization controls -->
    <Visualization
      :map="map"
      @criteria-change="handleCriteriaChange"
      @division-change="handleDivisionChange"
      @visualization-change="handleVisualizationChange"
    />
      <!-- Points layer -->
    <Points
      ref="pointsRef"
      :map="map"
      :parcerias="parcerias"
      :applied-filters="appliedFilters"
      @visualization-change="handleVisualizationChange"
    />
    
    <!-- Heatmap layer -->
    <Heatmap
      ref="heatmapRef"
      :map="map"
      :parcerias="parcerias"
      :applied-filters="appliedFilters"
    />
    
    <!-- GeoJSON layer -->
    <Geojson
      ref="geojsonRef"
      :map="map"
      :parcerias="parcerias"
      :applied-filters="appliedFilters"
      @feature-counts-update="handleFeatureCountsUpdate"
    />
    
    <!-- Legend -->
    <Keys
      ref="keysRef"
      :map="map"
      :parcerias="parcerias"
      :applied-filters="appliedFilters"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Lazy load map components to reduce initial bundle size
const Filters = defineAsyncComponent(() => import('./map-components/Filters.vue'));
const Points = defineAsyncComponent(() => import('./map-components/Points.vue'));
const Heatmap = defineAsyncComponent(() => import('./map-components/Heatmap.vue'));
const Visualization = defineAsyncComponent(() => import('./map-components/Visualization.vue'));
const Geojson = defineAsyncComponent(() => import('./map-components/Geojson.vue'));
const Keys = defineAsyncComponent(() => import('./map-components/Keys.vue'));

// Dynamic import for large JSON data
let parceriasData: any = null;
const loadParceriasData = async (): Promise<any> => {
  if (!parceriasData) {
    const module = await import('../assets/parcerias.json');
    parceriasData = module.default;
  }
  return parceriasData;
};

import type { Parceria, Filter, RangeFilter, FilterType, VisualizationCriteria } from '../types';
import { MAP_CONFIG, FILTER_CATEGORIES, RANGE_FILTER_CATEGORIES } from '../types';

export default defineComponent({
  name: 'Map',  components: {
    Filters,
    Points,
    Heatmap,
    Visualization,
    Geojson,
    Keys  },  data() {
    return {
      map: null as any,
      appliedFilters: [] as FilterType[],
      categories: FILTER_CATEGORIES,
      rangeCategories: RANGE_FILTER_CATEGORIES,
      parcerias: [] as Parceria[],
    };
  },
  async mounted() {
    // Load data asynchronously
    this.parcerias = await loadParceriasData();
    this.initializeMap();
  },
  methods: {
    /**
     * Initialize the Leaflet map with proper configuration
     */
    initializeMap() {
      const bounds = MAP_CONFIG.BOUNDS;
      const center: [number, number] = [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2
      ];

      this.map = L.map('map', {
        center,
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        minZoom: MAP_CONFIG.MIN_ZOOM,
        maxZoom: MAP_CONFIG.MAX_ZOOM,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        attributionControl: false,
        zoomControl: false,
      });

      L.tileLayer(MAP_CONFIG.TILE_URL, {
        maxZoom: MAP_CONFIG.MAX_ZOOM
      }).addTo(this.map);
    },    /**
     * Handle filter application
     */
    handleApplyFilter(filter: Filter) {
      this.appliedFilters.push(filter);
    },    /**
     * Handle filter removal
     */
    handleRemoveFilter(filter: Filter) {
      this.appliedFilters = this.appliedFilters.filter(
        f => !('type' in f) && (f.category !== filter.category || f.value !== filter.value)
      );
    },

    /**
     * Handle range filter application
     */
    handleApplyRangeFilter(filter: RangeFilter) {
      // Remove existing range filter for the same category
      this.appliedFilters = this.appliedFilters.filter(
        f => !('type' in f && f.type === 'range' && f.category === filter.category)
      );
      this.appliedFilters.push(filter);
    },

    /**
     * Handle range filter removal
     */
    handleRemoveRangeFilter(filter: RangeFilter) {
      this.appliedFilters = this.appliedFilters.filter(
        f => !('type' in f && f.type === 'range' && f.category === filter.category)
      );
    },    /**
     * Handle visualization criteria changes
     */
    handleCriteriaChange(criteria: VisualizationCriteria) {
      // Propagate to child components
      const refs = [this.$refs.pointsRef, this.$refs.heatmapRef, this.$refs.geojsonRef, this.$refs.keysRef];
      refs.forEach(ref => {
        if (ref && typeof (ref as any).handleCriteriaChange === 'function') {
          (ref as any).handleCriteriaChange(criteria);
        }
      });
    },

    /**
     * Handle division changes (regions, subprefectures, districts)
     */
    handleDivisionChange(division: string) {
      const refs = [this.$refs.geojsonRef, this.$refs.keysRef];
      refs.forEach(ref => {
        if (ref && typeof (ref as any).handleDivisionChange === 'function') {
          (ref as any).handleDivisionChange(division);
        }
      });
    },    /**
     * Handle visualization type changes
     */
    handleVisualizationChange(visualization: string) {
      const refs = [this.$refs.pointsRef, this.$refs.heatmapRef, this.$refs.geojsonRef, this.$refs.keysRef];
      refs.forEach(ref => {
        if (ref && typeof (ref as any).handleVisualizationChange === 'function') {
          (ref as any).handleVisualizationChange(visualization);
        }
      });
    },

    /**
     * Handle feature counts update from GeoJSON layer
     */
    handleFeatureCountsUpdate(counts: Record<string, number>) {
      const keysRef = this.$refs.keysRef as any;
      if (keysRef && typeof keysRef.updateFeatureCounts === 'function') {
        keysRef.updateFeatureCounts(counts);
      }
    }
  }
});
</script>

<style scoped>

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0, 0, 0);
  overflow-x: hidden;
  overflow-y: hidden;

}

#map {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100vh;
}
</style>
