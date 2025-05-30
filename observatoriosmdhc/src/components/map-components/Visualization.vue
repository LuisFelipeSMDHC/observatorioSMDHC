<template>
    <div>
        <!-- Sliding Card -->
        <div
            class="visualization-sliding-card"
            :class="{ 'expanded': showCard || isPinned }"
            @mouseenter="showCard = true"
            @mouseleave="isPinned ? null : showCard = false"
        >

            <div class="gear-icon-container">
                <svg class="gear-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22l-1.92 3.32c-.12.21-.07.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
                </svg>
            </div>

            <div class="card-content">
                <div class="card-header">
                    <h2 class="card-title">Opções de Visualização</h2>
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
            
                <div id="visualization-content">                    <div class="visualization-row">
                        <label for="colorCriteria">Cor:</label>
                        <div class="select-wrapper">
                            <select id="colorCriteria" v-model="color" @change="handleCriteriaChange">
                                <option v-for="opt in colorOptions" :key="opt.value" :value="opt.value">
                                    {{ opt.label }}
                                </option>
                            </select>
                            <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="visualization-row" v-if="visualization === 'coropletico'">
                        <div class="checkbox-group">
                            <label class="checkbox-container">
                                <input type="checkbox" v-model="density" @change="handleCriteriaChange" />
                                <span class="checkmark"></span>
                                Considerar densidade
                            </label>
                            <label class="checkbox-container">
                                <input type="checkbox" v-model="showValueMarkers" @change="handleCriteriaChange" />
                                <span class="checkmark"></span>
                                Exibir valores
                            </label>
                        </div>
                    </div>                      <div class="visualization-row" v-if="visualization !== 'coropletico'">
                        <label for="sizeCriteria">Tamanho:</label>
                        <div class="select-wrapper">
                            <select id="sizeCriteria" v-model="size" @change="handleCriteriaChange">
                                <option value="verba">Verba</option>
                                <option value="none">Nenhum</option>
                            </select>
                            <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <label>Divisão Administrativa:</label>
                        <div class="division-btn-group">
                            <button
                                type="button"
                                :class="{ selected: division === 'regioes' }"
                                @click="division = 'regioes'; handleDivisionChange()"
                            >
                                Regiões
                            </button>
                            <button
                                type="button"
                                :class="{ selected: division === 'subprefeituras' }"
                                @click="division = 'subprefeituras'; handleDivisionChange()"
                            >
                                Subprefeituras
                            </button>
                            <button
                                type="button"
                                :class="{ selected: division === 'distritos' }"
                                @click="division = 'distritos'; handleDivisionChange()"
                            >
                                Distritos
                            </button>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <label>Visualização:</label>
                        <div class="visualization-type-btn-group">
                            <button
                                type="button"
                                :class="{ selected: visualization === 'pontos' }"
                                @click="visualization = 'pontos'; handleVisualizationChange()"
                            >
                                Pontos
                            </button>
                            <button
                                type="button"
                                :class="{ selected: visualization === 'coropletico' }"
                                @click="visualization = 'coropletico'; handleVisualizationChange()"
                            >
                                Coroplético
                            </button>
                            <button
                                type="button"
                                :class="{ selected: visualization === 'heatmap' }"
                                @click="visualization = 'heatmap'; handleVisualizationChange()"
                            >
                                Heatmap
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Map } from 'leaflet';

// Types
import type { VisualizationType, VisualizationCriteria, DivisionType } from '../../types';
import { CATEGORY_LABELS } from '../../types';

/**
 * Color option interface for visualization dropdowns
 */
interface ColorOption {
    value: string;
    label: string;
}

/**
 * Props interface for the Visualization component
 */
interface VisualizationProps {
    map: Map | null;
    onCriteriaChange: (criteria: VisualizationCriteria) => void;
    onDivisionChange: (division: DivisionType) => void;
    onVisualizationChange?: (visualization: VisualizationType) => void;
}

export default defineComponent({
    name: 'Visualization',
    props: {
        map: {
            type: Object as () => Map | null,
            default: null
        },
        onCriteriaChange: {
            type: Function as unknown as () => (criteria: VisualizationCriteria) => void,
            required: true
        },
        onDivisionChange: {
            type: Function as unknown as () => (division: DivisionType) => void,
            required: true
        },
        onVisualizationChange: {
            type: Function as unknown as () => (visualization: VisualizationType) => void,
            required: false
        }
    },
    setup(props: VisualizationProps) {
        // Card state management
        const showCard = ref<boolean>(false);
        const isPinned = ref<boolean>(true);
          // Visualization criteria state
        const color = ref<string>('osc');
        const size = ref<string>('verba');
        const density = ref<boolean>(false);
        const showValueMarkers = ref<boolean>(false);
        
        // Geographic and visualization settings
        const division = ref<DivisionType>('regioes');
        const visualization = ref<VisualizationType>('pontos');

        /**
         * Computed property that returns color options based on current visualization type
         * @returns Array of color options for the current visualization
         */        const colorOptions = computed((): ColorOption[] => {
            if (visualization.value === 'coropletico') {
                return [
                    { value: 'verba', label: 'Verba' },
                    { value: 'amount', label: 'Quantidade' },
                    { value: 'none', label: 'Nenhum' }
                ];            } else if (visualization.value === 'pontos') {
                return [
                    { value: 'osc', label: CATEGORY_LABELS['osc'] || 'OSC' },
                    { value: 'unidadeGestora', label: CATEGORY_LABELS['unidadeGestora'] || 'Unidade Gestora' },
                    { value: 'origemRecurso', label: CATEGORY_LABELS['origemRecurso'] || 'Origem do Recurso' },
                    { value: 'categoria', label: CATEGORY_LABELS['categoria'] || 'Categoria' },
                    { value: 'none', label: 'Nenhum' }
                ];
            }
            return [];
        });

        /**
         * Handles visualization type changes and adjusts default criteria
         * Sets appropriate default values for color and size based on visualization type
         */
        const handleVisualizationChange = (): void => {
            props.onVisualizationChange?.(visualization.value);
              // Set default criteria based on visualization type
            if (visualization.value === 'coropletico') {
                color.value = 'amount';
                size.value = 'none';
            } else if (visualization.value === 'pontos') {
                color.value = 'osc';
                size.value = 'verba';
            } else {
                color.value = 'none';
                size.value = 'none';
            }
            
            handleCriteriaChange();
        };

        /**
         * Handles changes in visualization criteria and notifies parent component
         * Combines all visualization settings into a single criteria object
         */
        const handleCriteriaChange = (): void => {
            const criteria: VisualizationCriteria = {
                color: color.value,
                size: size.value,
                density: density.value,
                showValueMarkers: showValueMarkers.value
            };
            
            props.onCriteriaChange?.(criteria);
        };

        /**
         * Handles administrative division changes and notifies parent component
         */
        const handleDivisionChange = (): void => {
            props.onDivisionChange?.(division.value);
        };

        /**
         * Toggles the pin state of the visualization panel
         * When pinned, the panel stays expanded even when not hovering
         */
        const togglePin = (): void => {
            isPinned.value = !isPinned.value;
        };

        return {
            // State refs
            showCard,
            color,
            size,
            division,
            visualization,
            density,
            showValueMarkers,
            isPinned,
            
            // Computed properties
            colorOptions,
            
            // Event handlers
            togglePin,
            handleCriteriaChange,
            handleDivisionChange,
            handleVisualizationChange
        };
    }
});
</script>

<style scoped>
.visualization-sliding-card {
    font-family: "Roboto", sans-serif;
    font-weight: 300;
    position: absolute;
    top: 10vh;
    left: -425px;
    width: 450px;
    background: linear-gradient(135deg, rgba(15, 32, 56, 0.7) 0%, rgba(5, 20, 40, 0.7) 50%, rgba(0, 10, 25, 0.7) 100%);
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(5px);
    z-index: 3100;
    padding: 22px;
    border-radius: 0 14px 14px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    overflow-y: auto;
    color: #ffffff;
}

.visualization-sliding-card.expanded {
    left: 0;
}

.gear-icon-container {
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
}

.gear-icon {
    color: rgba(255, 255, 255, 0.9);
    opacity: 1;
    transition: opacity 0.3s ease;
}

.visualization-sliding-card.expanded .gear-icon {
    opacity: 0;
}

.card-content {
    flex: 1;
    padding-right:10px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 14px;
}

.card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2px 9px rgba(0, 0, 0, 0.3);
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

#visualization-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 18px;
}

.visualization-row {
    display: flex;
    align-items: center;
    gap: 14px;
}

.control-section {
    display: flex;
    flex-direction: column;
    gap: 9px;
}

label {
    font-size: 0.86rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
}

/* Modern select styling */
.select-wrapper {
    position: relative;
    flex: 1;
}

.select-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%) rotate(-90deg);
    pointer-events: none;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
}

select {
    width: 100%;
    padding: 9px 13px;
    border-radius: 7px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(1px);
    font-size: 0.86rem;
    color: #ffffff;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s;
}

select:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

select:hover + .select-arrow {
    color: rgba(255, 255, 255, 0.9);
}

select:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
}

select:focus + .select-arrow {
    color: rgba(255, 255, 255, 1);
    transform: translateY(-50%) rotate(0deg);
}

select option {
    background: rgba(15, 32, 56, 0.95);
    color: #ffffff;
}

/* Custom checkbox */
.checkbox-group {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
}

.checkbox-container {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 27px;
    cursor: pointer;
    user-select: none;
}

.checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkmark {
    position: absolute;
    left: 0;
    height: 18px;
    width: 18px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    transition: all 0.2s;
    backdrop-filter: blur(5px);
}

.checkbox-container:hover input ~ .checkmark {
    background-color: rgba(255, 255, 255, 0.2);
}

.checkbox-container input:checked ~ .checkmark {
    background-color: rgba(255, 255, 255, 0.9);
}

.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
    display: block;
    left: 7px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid rgba(15, 32, 56, 0.9);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

/* Button groups */
.division-btn-group,
.visualization-type-btn-group {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
}

.division-btn-group button,
.visualization-type-btn-group button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 7px;
    padding: 9px 11px;
    cursor: pointer;
    font-size: 0.69rem;
    line-height: 1;
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.2s;
    flex: 1;
    min-width: 81px;
    backdrop-filter: blur(5px);
}

.division-btn-group button:hover,
.visualization-type-btn-group button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.division-btn-group button.selected,
.visualization-type-btn-group button.selected {
    background: rgba(255, 255, 255, 0.9);
    color: rgba(15, 32, 56, 0.9);
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

</style>