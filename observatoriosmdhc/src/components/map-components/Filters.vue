<template>
    <div>
        <!-- Sliding Card -->
        <div
            class="filters-sliding-card"
            :class="{ 'expanded': showFiltersTab || isPinned }"
            @mouseenter="showFiltersTab = true"
            @mouseleave="isPinned ? null : showFiltersTab = false"
        >
            <div class="filter-icon-container">
                <svg class="filter-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 0.55 0.45 1 1 1h2c0.55 0 1-0.45 1-1v-6s3.72-4.8 5.74-7.39c0.51-0.66 0.04-1.61-0.79-1.61H5.04c-0.83 0-1.3 0.95-0.79 1.61z" fill="currentColor"/>
                </svg>
            </div>

            <div class="card-content">
                <div class="card-header">
                    <h2 class="card-title">Filtros</h2>
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
                </div>                <div id="filters-content">
                    <div class="filters-columns">
                        <!-- Categorical Filters -->
                        <div
                            v-for="category in categories"
                            :key="category"
                            class="filter-section"
                        >
                            <div class="category">
                                <div class="filter-header" @click="toggleCollapse(category)">
                                    <div class="filter-category-title">{{ getCategoryLabel(category) }}</div>
                                    <div class="toggle-icon" :class="{ 'collapsed': isCategoryCollapsed(category) }">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                </div>
                                
                                <div v-show="!isCategoryCollapsed(category)" class="filter-content">
                                    <input
                                        type="text"
                                        v-model="searchTexts[category]"
                                        placeholder="Buscar..."
                                        class="filter-search"
                                    />
                                    <div class="filter-column">
                                        <div
                                            v-for="value in getValuesForCategory(category)"
                                            :key="value"
                                            class="filter-value-row"
                                        >
                                            <button
                                                class="filter-value-btn"
                                                :class="{ active: isFilterApplied(category, value) }"
                                                @click="toggleCategoryValue(category, value)"
                                            >
                                                {{ value }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Range Filters -->
                        <div
                            v-for="category in rangeCategories"
                            :key="category"
                            class="filter-section"
                        >
                            <div class="category">
                                <div class="filter-header" @click="toggleCollapse(category)">
                                    <div class="filter-category-title">{{ getCategoryLabel(category) }}</div>
                                    <div class="toggle-icon" :class="{ 'collapsed': isCategoryCollapsed(category) }">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                </div>                                <div v-show="!isCategoryCollapsed(category)" class="filter-content">
                                    <div class="range-filter">
                                        <!-- Range Slider -->
                                        <div class="range-slider-container">
                                            <div class="range-slider-wrapper">
                                                <div class="range-slider-track"></div>
                                                <div 
                                                    class="range-slider-fill" 
                                                    :style="getRangeSliderFillStyle(category)"
                                                ></div>
                                                <input
                                                    type="range"
                                                    :min="rangeFilters[category].min"
                                                    :max="rangeFilters[category].max"
                                                    :value="rangeFilters[category].currentMin"
                                                    @input="updateRangeMin(category, Number(($event.target as HTMLInputElement).value))"
                                                    class="range-slider range-slider-min"
                                                    :step="category === 'verba' ? 1000 : 86400000"
                                                />
                                                <input
                                                    type="range"
                                                    :min="rangeFilters[category].min"
                                                    :max="rangeFilters[category].max"
                                                    :value="rangeFilters[category].currentMax"
                                                    @input="updateRangeMax(category, Number(($event.target as HTMLInputElement).value))"
                                                    class="range-slider range-slider-max"
                                                    :step="category === 'verba' ? 1000 : 86400000"
                                                />
                                            </div>
                                            <div class="range-slider-labels">
                                                <span class="range-label-min">{{ formatRangeValue(category, rangeFilters[category].min) }}</span>
                                                <span class="range-label-max">{{ formatRangeValue(category, rangeFilters[category].max) }}</span>
                                            </div>
                                        </div>

                                        <!-- Editable Range Values Display -->
                                        <div class="range-values-display">
                                            <div class="range-value-item">
                                                <span class="range-value-label">Mínimo:</span>
                                                <input
                                                    v-if="category === 'verba'"
                                                    type="number"
                                                    :value="rangeFilters[category].currentMin"
                                                    @input="updateRangeMinFromInput(category, Number(($event.target as HTMLInputElement).value))"
                                                    :min="rangeFilters[category].min"
                                                    :max="rangeFilters[category].max"
                                                    class="range-value-input"
                                                />
                                                <input
                                                    v-else-if="category === 'data'"
                                                    type="date"
                                                    :value="new Date(rangeFilters[category].currentMin).toISOString().split('T')[0]"
                                                    @input="updateRangeMinFromInput(category, new Date(($event.target as HTMLInputElement).value).getTime())"
                                                    class="range-value-input"
                                                />
                                            </div>
                                            <div class="range-value-item">
                                                <span class="range-value-label">Máximo:</span>
                                                <input
                                                    v-if="category === 'verba'"
                                                    type="number"
                                                    :value="rangeFilters[category].currentMax"
                                                    @input="updateRangeMaxFromInput(category, Number(($event.target as HTMLInputElement).value))"
                                                    :min="rangeFilters[category].min"
                                                    :max="rangeFilters[category].max"
                                                    class="range-value-input"
                                                />
                                                <input
                                                    v-else-if="category === 'data'"
                                                    type="date"
                                                    :value="new Date(rangeFilters[category].currentMax).toISOString().split('T')[0]"
                                                    @input="updateRangeMaxFromInput(category, new Date(($event.target as HTMLInputElement).value).getTime())"
                                                    class="range-value-input"
                                                />
                                            </div>
                                        </div>

                                        <!-- Remove Range Filter Button -->
                                        <div class="range-controls" v-if="isRangeFilterApplied(category)">
                                            <button
                                                @click="removeRangeFilter(category)"
                                                class="range-btn remove"
                                            >
                                                Remover Filtro
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, reactive } from 'vue';
import * as L from 'leaflet';

// Types
import type { Filter, Parceria, RangeFilter } from '../../types';
import { CATEGORY_LABELS } from '../../types';

// Utils
import { getUniqueValues, getVerbaRange, getDateRange, formatCurrency, formatDate } from '../../utils/dataHelpers';

export default defineComponent({
    name: 'Filters',
    props: {
        map: {
            type: Object as () => any,
            required: true
        },categories: {
            type: Array as () => string[],
            required: true
        },        
        rangeCategories: {
            type: Array as () => string[],
            default: () => []
        },
        parcerias: {
            type: Array as () => Parceria[],
            required: true
        }
    },
    emits: ['apply-filter', 'remove-filter', 'apply-range-filter', 'remove-range-filter'],
    setup(props, { emit }) {        const showFiltersTab = ref(false);
        const appliedFilters = ref<Filter[]>([]);
        const appliedRangeFilters = ref<RangeFilter[]>([]);
        const isPinned = ref(true);

        const searchTexts = ref<Record<string, string>>({});
        // Track collapsed state for each category
        const collapsedCategories = reactive<Record<string, boolean>>({});
        
        // Range filter states
        const rangeFilters = reactive<Record<string, { min: number; max: number; currentMin: number; currentMax: number }>>({});
        
        // Initialize categories
        props.categories.forEach(category => {
            searchTexts.value[category] = '';
            collapsedCategories[category] = true;
        });
        
        // Initialize range categories
        props.rangeCategories.forEach(category => {
            searchTexts.value[category] = '';
            collapsedCategories[category] = true;
            
            if (category === 'verba') {
                const range = getVerbaRange(props.parcerias);
                rangeFilters[category] = {
                    min: range.min,
                    max: range.max,
                    currentMin: range.min,
                    currentMax: range.max
                };
            } else if (category === 'data') {
                const range = getDateRange(props.parcerias);
                rangeFilters[category] = {
                    min: range.min,
                    max: range.max,
                    currentMin: range.min,
                    currentMax: range.max
                };
            }
        });

        const togglePin = () => {
            isPinned.value = !isPinned.value;
        };
        
        const toggleCollapse = (category: string) => {
            collapsedCategories[category] = !collapsedCategories[category];
        };
          const isCategoryCollapsed = (category: string) => {
            return collapsedCategories[category] === true;
        };

        /**
         * Returns the user-friendly label for a category
         */
        const getCategoryLabel = (category: string) => {
            return CATEGORY_LABELS[category] || category;
        };/**
         * Returns unique values for a category, filtering based on search
         */
        const getValuesForCategory = (category: string) => {
            const uniqueValues = getUniqueValues(props.parcerias, category as keyof Parceria);
            const search = searchTexts.value[category]?.toLowerCase();
            
            if (search) {
                return uniqueValues.filter(value =>
                    value.toLowerCase().includes(search)
                );
            }
            return uniqueValues;
        };        /**
         * Checks if a filter is currently applied
         */
        const isFilterApplied = (category: string, value: string) => {
            return appliedFilters.value.some(
                (f) => f.category === category && f.value === value
            );
        };        /**
         * Toggles a filter value (applies or removes it)
         */
        const toggleCategoryValue = (category: string, value: string) => {
            const idx = appliedFilters.value.findIndex(
                (f) => f.category === category && f.value === value
            );
            
            if (idx === -1) {
                // Apply new filter
                const newFilter = { category, value };
                appliedFilters.value.push(newFilter);
                emit('apply-filter', newFilter);
            } else {
                // Remove existing filter
                const removed = appliedFilters.value.splice(idx, 1)[0];
                emit('remove-filter', removed);
            }
        };

        /**
         * Applies a range filter
         */
        const applyRangeFilter = (category: string) => {
            const range = rangeFilters[category];
            if (!range) return;
            
            const rangeFilter: RangeFilter = {
                category,
                type: 'range',
                min: range.currentMin,
                max: range.currentMax
            };
            
            // Remove existing range filter for this category
            const existingIndex = appliedRangeFilters.value.findIndex(f => f.category === category);
            if (existingIndex !== -1) {
                appliedRangeFilters.value.splice(existingIndex, 1);
            }
            
            appliedRangeFilters.value.push(rangeFilter);
            emit('apply-range-filter', rangeFilter);
        };

        /**
         * Removes a range filter
         */
        const removeRangeFilter = (category: string) => {
            const index = appliedRangeFilters.value.findIndex(f => f.category === category);
            if (index !== -1) {
                const removed = appliedRangeFilters.value.splice(index, 1)[0];
                emit('remove-range-filter', removed);
                
                // Reset to original range
                const originalRange = category === 'verba' ? getVerbaRange(props.parcerias) : getDateRange(props.parcerias);
                rangeFilters[category].currentMin = originalRange.min;
                rangeFilters[category].currentMax = originalRange.max;
            }
        };

        /**
         * Checks if a range filter is applied
         */
        const isRangeFilterApplied = (category: string) => {
            return appliedRangeFilters.value.some(f => f.category === category);
        };        /**
         * Formats range values for display
         */
        const formatRangeValue = (category: string, value: number) => {
            if (category === 'verba') {
                return formatCurrency(value);
            } else if (category === 'data') {
                return formatDate(value);
            }
            return value.toString();
        };        /**
         * Updates the minimum value of a range filter
         */
        const updateRangeMin = (category: string, value: number) => {
            if (value <= rangeFilters[category].currentMax) {
                rangeFilters[category].currentMin = value;
                applyRangeFilter(category);
            }
        };

        /**
         * Updates the maximum value of a range filter
         */
        const updateRangeMax = (category: string, value: number) => {
            if (value >= rangeFilters[category].currentMin) {
                rangeFilters[category].currentMax = value;
                applyRangeFilter(category);
            }
        };

        /**
         * Updates the minimum value from input field
         */
        const updateRangeMinFromInput = (category: string, value: number) => {
            if (value <= rangeFilters[category].currentMax && value >= rangeFilters[category].min) {
                rangeFilters[category].currentMin = value;
                applyRangeFilter(category);
            }
        };

        /**
         * Updates the maximum value from input field
         */
        const updateRangeMaxFromInput = (category: string, value: number) => {
            if (value >= rangeFilters[category].currentMin && value <= rangeFilters[category].max) {
                rangeFilters[category].currentMax = value;
                applyRangeFilter(category);
            }
        };

        /**
         * Gets the style for the range slider fill
         */
        const getRangeSliderFillStyle = (category: string) => {
            const range = rangeFilters[category];
            if (!range) return {};

            const totalRange = range.max - range.min;
            const currentMinPercent = ((range.currentMin - range.min) / totalRange) * 100;
            const currentMaxPercent = ((range.currentMax - range.min) / totalRange) * 100;

            return {
                left: `${currentMinPercent}%`,
                width: `${currentMaxPercent - currentMinPercent}%`
            };
        };

        /**
         * Removes a filter by index
         */        /**
         * Removes a filter by index
         */
        const removeFilter = (index: number) => {
            const removed = appliedFilters.value.splice(index, 1)[0];
            emit('remove-filter', removed);
        };

        onMounted(() => {
            if (props.map) {
                const control = L.Control.extend({
                    options: { position: 'topright' },
                    onAdd() {
                        return L.DomUtil.create('div');
                    }
                });
                props.map.addControl(new control());
            }
        });

        watch(() => props.map, (newMap) => {
            if (newMap) {
                const control = L.Control.extend({
                    options: { position: 'topright' },
                    onAdd() {
                        return L.DomUtil.create('div');
                    }
                });
                newMap.addControl(new control());
            }
        });        return {
            showFiltersTab,
            appliedFilters,
            appliedRangeFilters,
            removeFilter,
            getValuesForCategory,
            isFilterApplied,
            toggleCategoryValue,
            categories: props.categories,
            rangeCategories: props.rangeCategories,
            searchTexts,
            isPinned,
            togglePin,
            toggleCollapse,
            isCategoryCollapsed,
            getCategoryLabel,
            rangeFilters,
            applyRangeFilter,
            removeRangeFilter,
            isRangeFilterApplied,
            formatRangeValue,
            updateRangeMin,
            updateRangeMax,
            updateRangeMinFromInput,
            updateRangeMaxFromInput,
            getRangeSliderFillStyle
        };
    }
});
</script>

<style scoped>
.filters-sliding-card {
    font-family: "Roboto", sans-serif;
    font-optical-sizing: auto;
    font-weight: 300;
    font-style: normal;
    font-variation-settings: "wdth" 100;
    
    position: absolute;
    top: 10vh;
    right: -425px;
    width: 450px;
    height: 85vh;
    background: 
        linear-gradient(135deg, rgba(15, 32, 56, 0.7) 0%, rgba(5, 20, 40, 0.7) 50%, rgba(0, 10, 25, 0.7) 100%);
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(5px);
    z-index: 3100;
    padding: 22px;
    border-radius: 14px 0 0 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    transition: all 0.3s ease;
    overflow-y: auto;
    overflow-x: hidden;
    color: #ffffff;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.filters-sliding-card::-webkit-scrollbar {
    width: 6px;
}

.filters-sliding-card::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.filters-sliding-card::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.filters-sliding-card::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

.filters-sliding-card.expanded {
    right: 0;
}

.filter-icon-container {
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
}

.filter-icon {
    color: rgba(255, 255, 255, 0.9);
    opacity: 1;
    transition: opacity 0.3s ease;
}

.filters-sliding-card.expanded .filter-icon {
    opacity: 0;
}

.card-content {
    flex: 1;
    padding-left: 10px;
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
    margin: 0;
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

#filters-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 20px;
}

.filters-columns {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.filters-columns::-webkit-scrollbar {
    width: 6px;
}

.filters-columns::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.filters-columns::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.filters-columns::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

.filter-column {
    flex: 0 0 auto;
    height: 270px;
    width: 100%;
    border-radius: 11px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 9px;
    padding-top: 14px;
    padding-bottom: 14px;
    backdrop-filter: blur(1);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.filter-column::-webkit-scrollbar {
    width: 6px;
}

.filter-column::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.filter-column::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.filter-column::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

.category {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(1px);
    border-radius: 10px;
    width: 100%;
    overflow: hidden;
    transition: all 0.3s ease;
}

.category:hover {
    border-color: rgba(255, 255, 255, 0.4);
}

/* Collapsible header styling */
.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 11px 14px;
    transition: background-color 0.2s;
}

.filter-header:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.filter-category-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.9);
    flex: 1;
    text-align: left;
}

.toggle-icon {
    transition: transform 0.3s ease;
}

.toggle-icon.collapsed {
    transform: rotate(-90deg);
}

.filter-content {
    padding: 14px;
}

.filter-search {
    margin-bottom: 11px;
    padding: 9px 13px;
    border: 0px;
    border-radius: 7px;
    width: 100%;    box-sizing: border-box;
    font-size: 0.69rem;
    transition: all 0.2s;
    display: block;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    color: #ffffff;
}

.filter-search::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.filter-search:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
}

.filter-value-row {
    margin-bottom: 7px;
    display: flex;
    justify-content: center;
}

.filter-value-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 0px;
    border-radius: 7px;
    padding: 9px 11px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.69rem;
    line-height: 1;
    color: rgba(255, 255, 255, 0.9);
    width: 90%;
    backdrop-filter: blur(5px);
}

.filter-value-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
}

.filter-value-btn.active {
    background: rgba(255, 255, 255, 0.9);
    color: rgba(15, 32, 56, 0.9);
    border-color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.filter-section {
    margin-bottom: 11px;
}

/* Range Filter Styles */
.range-filter {
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-top: 12px;
}

/* Range Slider Styles */
.range-slider-container {
    margin-bottom: 20px;
}

.range-slider-wrapper {
    position: relative;
    height: 40px;
    margin: 20px 0;
}

.range-slider-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    transform: translateY(-50%);
}

.range-slider-fill {
    position: absolute;
    top: 50%;
    height: 6px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 3px;
    transform: translateY(-50%);
    transition: all 0.1s ease;
}

.range-slider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    pointer-events: none;
}

.range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 3px solid #3b82f6;
    cursor: pointer;
    pointer-events: all;
    position: relative;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    border-color: #8b5cf6;
}

.range-slider::-webkit-slider-thumb:active {
    transform: scale(1.3);
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
}

.range-slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 3px solid #3b82f6;
    cursor: pointer;
    pointer-events: all;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
}

.range-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
    border-color: #8b5cf6;
}

.range-slider::-moz-range-thumb:active {
    transform: scale(1.3);
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
}

.range-slider::-moz-range-track {
    background: transparent;
}

.range-slider-max {
    pointer-events: none;
}

.range-slider-max::-webkit-slider-thumb {
    pointer-events: all;
    border-color: #8b5cf6;
}

.range-slider-max::-moz-range-thumb {
    border-color: #8b5cf6;
}

.range-slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
}

.range-label-min,
.range-label-max {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
}

/* Range Values Display */
.range-values-display {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
}

.range-value-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.range-value-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
}

.range-value-text {
    font-size: 0.9rem;
    color: #ffffff;
    font-weight: 600;
    background: rgba(59, 130, 246, 0.2);
    padding: 4px 8px;
    border-radius: 4px;
}

.range-value-input {
    font-size: 0.85rem;
    color: #ffffff;
    font-weight: 500;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 6px 10px;
    border-radius: 4px;
    text-align: center;
    width: 120px;
    transition: all 0.2s ease;
}

.range-value-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.range-controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
}

.range-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 120px;
}

.range-btn.remove {
    background: rgba(239, 68, 68, 0.8);
    color: #ffffff;
}

.range-btn.remove:hover {
    background: rgba(239, 68, 68, 0.9);
    transform: translateY(-1px);
}
</style>