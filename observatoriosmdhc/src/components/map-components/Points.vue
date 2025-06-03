<script lang="ts">
import { defineComponent, onMounted, watch, onBeforeUnmount } from 'vue';
import * as L from 'leaflet';
import { useNavigation } from '../../composables/useNavigation';

// Types
import type { Parceria, FilterType, Endereco } from '../../types';

// Utils
import { filterParcerias, generateColorPalette, calculateMarkerRadius, formatNumber } from '../../utils/dataHelpers';

export default defineComponent({
    name: 'Points',    props: {
        parcerias: Array as () => Parceria[],
        appliedFilters: Array as () => FilterType[],
        map: Object as () => any
    },setup(props) {        const { navigateToProject } = useNavigation();
          let layerGroup: any;

        let colorCriteria = 'osc';
        let sizeCriteria = 'verba';
        let currentVisualization = 'pontos';

        // Popup handling during zoom events
        let openPopup: any = null;
        let popupLatLng: any = null;

        const handleZoomStart = () => {
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
        };        /**
         * Creates popup content for a parceria marker
         */
        const createPopupContent = (parceria: Parceria, endereco?: Endereco, index?: number): string => {
            const enderecoInfo = endereco ? endereco.endereco : (parceria.enderecos && parceria.enderecos[0] ? parceria.enderecos[0].endereco : 'Endereço não disponível');
            const multipleAddresses = parceria.enderecos && parceria.enderecos.length > 1;
            
            return `
                <div class="popup-content">
                    <strong>${parceria.nome}</strong>
                    ${multipleAddresses ? `<div class="popup-address-indicator">Local ${(index || 0) + 1} de ${parceria.enderecos.length}</div>` : ''}
                    
                    <div class="popup-info-row">
                        <span class="popup-label">OSC:</span>
                        <span class="popup-value">${parceria.osc}</span>
                    </div>
                    
                    <div class="popup-info-row">
                        <span class="popup-label">Endereço:</span>
                        <span class="popup-value">${enderecoInfo}</span>
                    </div>
                    
                    <div class="popup-info-row">
                        <span class="popup-label">Vigência:</span>
                        <span class="popup-value">${new Date(parceria.inicio).toLocaleDateString()} - ${new Date(parceria.termino).toLocaleDateString()}</span>
                    </div>
                    
                    <div class="popup-info-row">
                        <span class="popup-label">Unidade:</span>
                        <span class="popup-value">${parceria.unidadeGestora}</span>
                    </div>
                    
                    <div class="popup-info-row">
                        <span class="popup-label">Origem:</span>
                        <span class="popup-value">${parceria.origemRecurso}</span>
                    </div>
                    
                    <div class="popup-info-row">
                        <span class="popup-label">Categoria:</span>
                        <span class="popup-value">${parceria.categoria}</span>
                    </div>                      <div class="popup-info-row">
                        <span class="popup-label">Verba:</span>
                        <span class="popup-value popup-value">R$ ${formatNumber(parceria.verba)}</span>
                    </div>
                    ${multipleAddresses ? `<div class="popup-address-note">*Valor distribuído entre ${parceria.enderecos.length} localizações</div>` : ''}
                    
                    <div class="popup-action-row">
                        <button class="popup-detail-button" onclick="window.navigateToProjectDetail('${parceria.termos}')">
                            Ver Detalhes Completos
                        </button>
                    </div>
                </div>
            `;
        };
        /**
         * Renders points on the map based on current criteria and filters
         */        const renderPoints = () => {
            if (!props.map) return;

            // Clear existing layers
            if (layerGroup) {
                layerGroup.clearLayers();
            } else {
                layerGroup = L.layerGroup().addTo(props.map);
            }

            // Only render if visualization is set to points
            if (currentVisualization !== 'pontos') {
                return;
            }            // Filter parcerias based on applied filters
            const filteredParcerias = filterParcerias(props.parcerias || [], props.appliedFilters || []);
            
            // Calculate size values for marker scaling - divide by number of addresses for consistent sizing
            const sizeValues: number[] = [];
            filteredParcerias.forEach(p => {
                const value = p[sizeCriteria as keyof Parceria] as number;
                if (typeof value === 'number' && !isNaN(value)) {
                    // For projects with multiple addresses, divide the value by the number of addresses
                    const adjustedValue = value / p.enderecos.length;
                    // Add one value per address to maintain scaling proportions
                    for (let i = 0; i < p.enderecos.length; i++) {
                        sizeValues.push(adjustedValue);
                    }
                }
            });
            const maxSizeValue = Math.max(...sizeValues, 0);
            const minSizeValue = Math.min(...sizeValues, 0);

            // Generate color mapping
            const colorMapping = colorCriteria === 'none' 
                ? { default: 'hsl(210, 70%, 50%)' }
                : generateColorPalette(
                    [...new Set(filteredParcerias.map(p => p[colorCriteria as keyof Parceria] as string))]
                  );            // Create markers for each parceria address
            filteredParcerias.forEach(parceria => {
                const originalValue = parceria[sizeCriteria as keyof Parceria] as number;
                // Divide value by number of addresses for consistent sizing with Geojson component
                const adjustedValue = typeof originalValue === 'number' && !isNaN(originalValue) 
                    ? originalValue / parceria.enderecos.length 
                    : 0;
                const radius = calculateMarkerRadius(adjustedValue, minSizeValue, maxSizeValue);

                const fillColor = colorCriteria === 'none'
                    ? colorMapping.default
                    : colorMapping[parceria[colorCriteria as keyof Parceria] as string];
                
                // Create a marker for each address in the project
                parceria.enderecos.forEach((endereco, index) => {
                    const circle = L.circle([endereco.coords.lat, endereco.coords.lng], {
                        radius,
                        fillColor,
                        weight: 0,
                        fillOpacity: 0.7
                    });

                    // Create popup with project info and current address
                    const popup = L.popup({
                        offset: [0, -10],
                        closeButton: true,
                        autoClose: true,
                        closeOnEscapeKey: true,
                        className: 'leaflet-popup-fixed'
                    }).setContent(createPopupContent(parceria, endereco, index));

                    circle.bindPopup(popup);
                    circle.addTo(layerGroup);
                });
            });
        };

        /**
         * Handles changes to visualization criteria (color and size)
         */
        const handleCriteriaChange = (criteria: { color: string; size: string }) => {
            colorCriteria = criteria.color;
            sizeCriteria = criteria.size;
            renderPoints();
        };        /**
         * Handles changes to visualization type
         */        const handleVisualizationChange = (visualization: string) => {
            currentVisualization = visualization;
            
            if (layerGroup) {
                layerGroup.clearLayers();
            }
            if (visualization === 'pontos') {
                renderPoints();
            }
        };        onMounted(() => {
            if (props.map) {
                renderPoints();
                
                // Add zoom event listeners for popup management
                props.map.on('zoomstart', handleZoomStart);
                props.map.on('zoomend', handleZoomEnd);
            }
            
            // Set up global navigation function for popup buttons
            (window as any).navigateToProjectDetail = (termos: string) => {
                const parceria = props.parcerias?.find(p => p.termos === termos);
                if (parceria) {
                    navigateToProject(parceria);
                }
            };
        });        onBeforeUnmount(() => {
            if (props.map) {
                // Clean up zoom event listeners
                props.map.off('zoomstart', handleZoomStart);
                props.map.off('zoomend', handleZoomEnd);
            }
            
            // Clean up global navigation function
            delete (window as any).navigateToProjectDetail;
        });        watch(
            () => props.map,
            (newMap, oldMap) => {
                // Clean up old map event listeners
                if (oldMap) {
                    oldMap.off('zoomstart', handleZoomStart);
                    oldMap.off('zoomend', handleZoomEnd);
                }
                
                // Set up new map
                if (newMap) {
                    renderPoints();
                    
                    // Add zoom event listeners for popup management
                    newMap.on('zoomstart', handleZoomStart);
                    newMap.on('zoomend', handleZoomEnd);
                }
            }
        );

        watch(() => [props.appliedFilters, props.parcerias], renderPoints, { deep: true });

        return {
            handleCriteriaChange,
            handleVisualizationChange
        };
    }
});
</script>

<style>
.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
    background: linear-gradient(135deg, rgba(15, 32, 56, 0.7) 0%, rgba(5, 20, 40, 0.7) 50%, rgba(0, 10, 25, 0.7) 100%) !important;
    border: none !important;
    outline: none !important;
}

.leaflet-popup {
    font-family: "Roboto", sans-serif !important;
    font-weight: 300 !important;
    transition: none !important;
    border: none !important;
    outline: none !important;
}

.leaflet-popup-content-wrapper {
    backdrop-filter: blur(5px) !important;
    border-radius: 14px !important;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.75) !important;
    padding: 0 !important;
    min-width: 250px !important;
    max-width: 300px !important;
    border: none !important;
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

.popup-address-indicator {
    font-size: 0.7rem !important;
    color: rgba(255, 255, 255, 0.7) !important;
    margin-bottom: 10px !important;
    padding: 4px 8px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border-radius: 4px !important;
    text-align: center !important;
}

.popup-address-note {
    font-size: 0.65rem !important;
    color: rgba(255, 255, 255, 0.6) !important;
    font-style: italic !important;
    margin-top: 4px !important;
    margin-bottom: 8px !important;
    text-align: left !important;
    width: 100% !important;
    padding-left: 94px !important; /* Alinha com o valor da verba */
}

.popup-action-row {
    display: flex !important;
    justify-content: center !important;
    margin-top: 12px !important;
    padding-top: 10px !important;
    border-top: 2px solid rgba(255, 255, 255, 0.2) !important;
}

.popup-detail-button {
    background: rgba(255, 255, 255, 0.1) !important;
    border: none !important;
    border-radius: 7px !important;
    padding: 9px 13px !important;
    cursor: pointer !important;
    font-size: 0.86rem !important;
    color: rgba(255, 255, 255, 0.9) !important;
    transition: all 0.2s ease !important;
    backdrop-filter: blur(1px) !important;
    font-family: "Roboto", sans-serif !important;
    font-weight: 300 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    box-shadow: none !important;
    min-width: 140px !important;
}

.popup-detail-button:hover {
    background-color: rgba(255, 255, 255, 0.2) !important;
    color: #ffffff !important;
    box-shadow: none !important;
}

</style>