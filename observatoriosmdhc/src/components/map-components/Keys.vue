<template>
    <div>
        <!-- Sliding Card -->        <div
            class="keys-sliding-card"
            :class="{ 'expanded': showKeysCard || isPinned }"
            @mouseenter="showKeysCard = true"
            @mouseleave="isPinned ? null : showKeysCard = false"
        >
        
        <div class="legend-icon-container">
            <button class="legend-icon" title="Legenda">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="7" y="5" width="3" height="3" fill="currentColor" />
                    <line x1="12" y1="6.5" x2="18" y2="6.5" />
                    <rect x="7" y="11" width="3" height="3" fill="currentColor" />
                    <line x1="12" y1="12.5" x2="18" y2="12.5" />
                    <rect x="7" y="17" width="3" height="3" fill="currentColor" />
                    <line x1="12" y1="18.5" x2="18" y2="18.5" />
                </svg>
            </button>
        </div>

            <div class="card-content">
                <div class="card-header">
                    <h2 class="card-title">Legenda</h2>
                   <button 
                        class="pin-icon" 
                        @click="togglePin"
                        :class="{ 'pinned': isPinned }"
                        title="Fixar painel"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 9V4H17C17.55 4 18 3.55 18 3C18 2.45 17.55 2 17 2H7C6.45 2 6 2.45 6 3C6 3.55 6.45 4 7 4H8V9C8 10.1 7.1 11 6 11C5.45 11 5 11.45 5 12C5 12.55 5.45 13 6 13H11V20L12 22L13 20V13H18C18.55 13 19 12.55 19 12C19 11.45 18.55 11 18 11C16.9 11 16 10.1 16 9Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>

                <!-- Conteúdo da legenda -->
                <div id="legend-content">
                    <!-- Legenda para pontos -->
                    <div v-if="currentVisualization === 'pontos'" class="legend-section">
                        <h3>Pontos</h3>
                        <div v-if="colorCriteria !== 'none'">
                            <div class="color-items">
                                <div v-for="(color, value) in colors" :key="value" class="color-item">
                                    <span class="color-box" :style="{ backgroundColor: color }"></span>
                                    <span class="color-label">{{ value }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p>Cor única para todos os pontos</p>
                            <div class="color-items">
                                <div class="color-item">
                                    <span class="color-box" style="background-color: hsl(210, 70%, 50%)"></span>
                                    <span class="color-label">Todos os pontos</span>
                                </div>
                            </div>
                        </div>                    </div>

                    <!-- Legenda para heatmap -->
                    <div v-if="currentVisualization === 'heatmap'" class="legend-section">
                        <h3>Mapa de Calor</h3>
                        <p>Intensidade baseada em: {{ getHeatmapCriteriaLabel() }}</p>
                        
                        <div class="heatmap-gradient">
                            <div class="gradient-container">
                                <div class="gradient-bar" :style="{ background: getHeatmapGradientBackground() }"></div>
                            </div>
                            <div class="gradient-labels">
                                <span>Baixa</span>
                                <span>Média</span>
                                <span>Alta</span>
                            </div>
                            <div class="heatmap-info">
                                <p>Cada ponto representa uma localização de projeto</p>
                                <p v-if="colorCriteria === 'verba'">A intensidade da cor indica o valor total</p>
                                <p v-else>A intensidade da cor indica a densidade de projetos</p>
                            </div>
                        </div>
                    </div>

                    <!-- Legenda para coroplético -->
                    <div v-if="currentVisualization === 'coropletico'" class="legend-section">
                        <h3>Mapa Coroplético</h3>
                        <p>Divisão: {{ getDivisionLabel(currentDivision) }}</p>
                        <p>Critério: {{ getColorCriteriaLabel() }}</p>
                        
                        <div class="choropleth-gradient">
                            <div class="gradient-container">
                                <div class="gradient-bar" :style="{ background: getGradientBackground() }"></div>
                                <div class="gradient-markers">
                                    <span class="marker" :style="{ left: '0%' }"><span class="marker-line"></span></span>
                                    <span class="marker" :style="{ left: '25%' }"><span class="marker-line"></span></span>
                                    <span class="marker" :style="{ left: '50%' }"><span class="marker-line"></span></span>
                                    <span class="marker" :style="{ left: '75%' }"><span class="marker-line"></span></span>
                                    <span class="marker" :style="{ left: '100%' }"><span class="marker-line"></span></span>
                                </div>
                            </div>
                            <div class="gradient-labels">
                                <span>{{ formatNumber(minValue) }}</span>
                                <span>{{ formatNumber(firstValue) }}</span>
                                <span>{{ formatNumber(middleValue) }}</span>
                                <span>{{ formatNumber(thirdValue) }}</span>
                                <span>{{ formatNumber(maxValue) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';

// Types
import type { Parceria, FilterType } from '../../types';
import { CATEGORY_LABELS } from '../../types';

// Utils
import { filterParcerias, generateColorPalette, getUniqueValues, formatNumber } from '../../utils/dataHelpers';

export default defineComponent({
    name: 'Keys',
    props: {        map: {
            type: Object as () => any,
            required: true
        },
        parcerias: {
            type: Array as () => Parceria[],
            default: () => []
        },        appliedFilters: {
            type: Array as () => FilterType[],
            default: () => []
        }
    },
    setup(props) {
        const showKeysCard = ref(false);
        const isPinned = ref(true);        const currentVisualization = ref('pontos');
        const colorCriteria = ref('osc');
        const sizeCriteria = ref('verba');
        const currentDivision = ref('regioes');
        const densityCriteria = ref(false);
        const colors = ref<Record<string, string>>({});
        
        const minValue = ref(0);
        const maxValue = ref(0);
        const firstValue = ref(0);
        const middleValue = ref(0);
        const thirdValue = ref(0);
        const featureCounts = ref<Record<string, number>>({});        /**
         * Gets filtered partnerships based on applied filters
         */
        const getFilteredParcerias = computed(() => {
            return filterParcerias(props.parcerias || [], props.appliedFilters);
        });        /**
         * Toggles the pinned state of the legend panel
         */
        const togglePin = () => {
            isPinned.value = !isPinned.value;
        };

        /**
         * Generates colors for point visualization
         */
        const generateColorsForPoints = () => {
            if (colorCriteria.value === 'none') {
                colors.value = { default: 'hsl(210, 70%, 50%)' };
                return;
            }            const uniqueValues = getUniqueValues(getFilteredParcerias.value, colorCriteria.value as keyof Parceria);
            colors.value = generateColorPalette(uniqueValues);
        };

        const updateChoroplethValues = () => {
            if (currentVisualization.value !== 'coropletico' || Object.keys(featureCounts.value).length === 0) {
                return;
            }

            const values = Object.values(featureCounts.value);
            
            if (values.length > 0) {
                values.sort((a, b) => a - b);
                minValue.value = Math.round(Math.min(...values));
                maxValue.value = Math.round(Math.max(...values));
                
                const range = maxValue.value - minValue.value;
                firstValue.value = Math.round(minValue.value + range * 0.25);
                middleValue.value = Math.round(minValue.value + range * 0.5);
                thirdValue.value = Math.round(minValue.value + range * 0.75);
            } else {
                minValue.value = 0;
                maxValue.value = 0;
                firstValue.value = 0;
                middleValue.value = 0;
                thirdValue.value = 0;
            }
        };

        const updateFeatureCounts = (counts: Record<string, number>) => {
            featureCounts.value = counts;
            updateChoroplethValues();
        };        const getGradientBackground = () => {
            return 'linear-gradient(to right, rgb(220, 240, 255), rgb(180, 215, 255), rgb(120, 180, 240), rgb(70, 150, 220), rgb(40, 120, 205))';
        };        const getHeatmapGradientBackground = () => {
            return 'linear-gradient(to right, #000080, #0000FF, #00BFFF, #00FFFF, #00FF80, #80FF00, #FFFF00, #FF8000, #FF4000, #FF0000, #800000)';
        };

        const getHeatmapCriteriaLabel = () => {
            if (colorCriteria.value === 'verba') {
                return 'Valor da verba';
            }
            return 'Densidade de projetos';
        };const getReadableCriteria = (criteria: string) => {
            const criteriaMap: Record<string, string> = {
                'osc': CATEGORY_LABELS['osc'] || 'OSC',
                'nome': CATEGORY_LABELS['nome'] || 'Nome',
                'unidadeGestora': CATEGORY_LABELS['unidadeGestora'] || 'Unidade Gestora',
                'origemRecurso': CATEGORY_LABELS['origemRecurso'] || 'Origem do Recurso',
                'categoria': CATEGORY_LABELS['categoria'] || 'Categoria',
                'verba': 'Verba',
                'amount': 'Quantidade',
                'none': 'Nenhum'
            };
            return criteriaMap[criteria] || criteria;
        };

        const getDivisionLabel = (division: string) => {
            if (division === 'regioes') return 'Regiões';
            if (division === 'subprefeituras') return 'Subprefeituras';
            if (division === 'distritos') return 'Distritos';
            return division.charAt(0).toUpperCase() + division.slice(1);
        };

        const getColorCriteriaLabel = () => {
            if (colorCriteria.value === 'amount') {
                return densityCriteria.value ? 'Densidade de projetos' : 'Quantidade de projetos';
            }
            return getReadableCriteria(colorCriteria.value);
        };

        const handleVisualizationChange = (visualization: string) => {
            currentVisualization.value = visualization;
            updateLegend();
        };

        const handleCriteriaChange = (criteria: { color: string; size: string; density?: boolean }) => {
            colorCriteria.value = criteria.color;
            if (criteria.size) {
                sizeCriteria.value = criteria.size;
            }
            if (criteria.density !== undefined) {
                densityCriteria.value = criteria.density;
            }
            updateLegend();
        };

        const handleDivisionChange = (division: string) => {
            currentDivision.value = division;
            updateLegend();
        };        const updateLegend = () => {
            if (currentVisualization.value === 'pontos') {
                generateColorsForPoints();
            } else if (currentVisualization.value === 'coropletico') {
                updateChoroplethValues();
            }
        };

        onMounted(() => {
            updateLegend();
        });

        watch(
            () => [props.appliedFilters, props.parcerias],
            () => {
                updateLegend();
            },
            { deep: true }
        );

        watch(
            () => currentVisualization.value,
            () => {
                updateLegend();
            }
        );

        watch(
            () => colorCriteria.value, 
            () => {
                updateLegend();
            }
        );

        watch(
            () => currentDivision.value,
            () => {
                updateLegend();
            }
        );

        return {
            showKeysCard,
            isPinned,
            currentVisualization,
            colorCriteria,
            currentDivision,
            colors,
            minValue,
            maxValue,
            firstValue,
            middleValue,
            thirdValue,            togglePin,
            getReadableCriteria,
            getDivisionLabel,
            getColorCriteriaLabel,
            getGradientBackground,
            getHeatmapGradientBackground,
            getHeatmapCriteriaLabel,
            handleVisualizationChange,
            handleCriteriaChange,
            handleDivisionChange,
            updateFeatureCounts,
            formatNumber,
        };
    }
});
</script>

<style scoped>
.keys-sliding-card {
    font-family: "Roboto", sans-serif;
    font-optical-sizing: auto;
    font-weight: 300;
    font-style: normal;
    font-variation-settings: "wdth" 100;
    
    position: absolute;
    top: 55vh;
    left: -425px;
    width: 450px;
    background: 
        linear-gradient(135deg, rgba(15, 32, 56, 0.7) 0%, rgba(5, 20, 40, 0.7) 50%, rgba(0, 10, 25, 0.7) 100%);
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(5px);
    z-index: 3100;
    padding: 22px;
    border-radius: 0 14px 14px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    transition: all 0.3s ease;
    height: 41vh;
    overflow-y: auto;
    overflow-x: hidden; 
    color: #ffffff;
}

.keys-sliding-card.expanded {
    left: 0;
}

.legend-icon-container {
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
}

.legend-icon {
    color: rgba(255, 255, 255, 0.9);
    opacity: 1;
    transition: opacity 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
}

.keys-sliding-card.expanded .legend-icon {
    opacity: 0;
}

.card-content {
    flex: 1;
    padding-right: 10px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    position: relative;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 14px;
}

.card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2px 9px rgba(0, 0, 0, 0.3);
    margin: 0;
}

.pin-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s ease;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.8);
}

.pin-icon:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    transform: scale(1.1);
}

.pin-icon.pinned {
    color: #ffffff;
    transform: rotate(45deg) scale(1.1);
    background-color: rgba(255, 255, 255, 0.15);
}

#legend-content {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.legend-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(1px);
    padding: 14px;
    border-radius: 7px;
}

.legend-section h3 {
    margin-top: 0;
    margin-bottom: 11px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2px 7px rgba(0, 0, 0, 0.3);
}

.legend-section p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.81rem;
    margin: 7px 0;
}

.color-items {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-top: 11px;
    height: 20vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.color-items::-webkit-scrollbar {
    width: 6px;
}

.color-items::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.color-items::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.color-items::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

.color-item {
    display: flex;
    align-items: center;
    gap: 9px;
}

.color-box {
    width: 14px;
    height: 14px;
    border-radius: 100%;
    flex-shrink: 0;
    box-shadow: 0 2px 7px rgba(0, 0, 0, 0.2);
    opacity: 1 !important; /* Força 100% de opacidade na legenda */
}

.color-label {
    font-size: 0.77rem;
    color: rgba(255, 255, 255, 0.9);
}

.choropleth-gradient {
    margin-top: 14px;
}

.heatmap-gradient {
    margin-top: 14px;
}

.heatmap-info {
    margin-top: 11px;
}

.heatmap-info p {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 4px 0;
    line-height: 1.4;
}

.gradient-bar {
    height: 18px;
    width: 100%;
    border-radius: 4px;
    margin-bottom: 7px;
    box-shadow: 0 2px 7px rgba(0, 0, 0, 0.2);
    opacity: 1 !important; /* Força 100% de opacidade no gradiente da legenda */
}

/* Garante que todas as cores na legenda tenham 100% de opacidade */
.legend-section .color-box,
.legend-section .gradient-bar {
    opacity: 1 !important;
}

.gradient-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.68rem;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 4px;
}

.gradient-labels span {
    flex: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 54px;
}

.gradient-labels span:first-child {
    text-align: left;
}

.gradient-labels span:last-child {
    text-align: right;
}

.gradient-markers {
    position: relative;
    height: 16px;
    width: 100%;
}

.marker {
    position: absolute;
    transform: translateX(-50%);
}

.marker-line {
    display: block;
    height: 8px;
    width: 1px;
    background-color: rgba(255, 255, 255, 0.7);
}
</style>